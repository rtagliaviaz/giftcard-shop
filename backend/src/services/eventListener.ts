import { ethers } from 'ethers';
import { AppDataSource } from '../db/data-source';
import { Orders } from '../entity/GiftCardDatabase';
import config from '../config';
import { deliverGiftCards } from './giftCardService'; // your fulfillment logic
import {NetworkName} from '../types/ConfigInterfaces';
import { MoreThan } from 'typeorm';
import { EMV_EVENTS } from '../constants/emvEvents';
import { SOCKET_EVENTS } from '../constants/socketEvents';


let activeAddresses = new Map<NetworkName, Set<string>>(); // per network

async function refreshActiveAddresses(networkName: NetworkName) {
  const orderRepo = AppDataSource.getRepository(Orders);
  const pendingOrders = await orderRepo.find({
    where: {
      status: 'pending',
      network: networkName,
      expiresAt: MoreThan(new Date())
    },
    select: ['address']
  });
  const addresses = new Set(pendingOrders.map(order => order.address.toLowerCase()));
  activeAddresses.set(networkName, addresses);
  console.log(`[${networkName}] Loaded ${addresses.size} active addresses`);
}

const ERC20_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'function decimals() view returns (uint8)',
];

async function setupNetworkListener(networkName: NetworkName) {

  if (networkName !== 'sepolia' && networkName !== 'baseSepolia') {
    console.error(`Unsupported network: ${networkName}`);
    return;
  }
  const network = config.networks[networkName];
  if (!network) return;

  const tokenAddress = network.CURRENCY === 'USDT' ? network.CURRENCY_CONTRACT_ADDRESS : network.CURRENCY_CONTRACT_ADDRESS;
  console.log(`Setting up listener for ${network.CURRENCY} on ${network.NAME} at address ${tokenAddress}`);
  const provider = new ethers.WebSocketProvider(network.RPC_WS_URL);
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const decimals = await contract.decimals();
  const divisor = 10n ** decimals;


  // await refreshActiveAddresses(networkName);
  

  contract.on(EMV_EVENTS.TRANSFER, async (from, to, value) => {
    const toAddress = to.toLowerCase();
    // const currentSet = activeAddresses.get(networkName);
    // if (!currentSet || !currentSet.has(toAddress)) {
    //   // Not an active address, ignore
    //   return;
    // }
    const amountHuman = Number(value) / Number(divisor);
    console.log(`[${network.NAME}] Transfer detected: ${amountHuman} ${network.CURRENCY} to ${to}`);

    const orderRepo = AppDataSource.getRepository(Orders);
    // We need to store the network name in the order to look it up correctly
    const order = await orderRepo.findOne({
      where: { address: toAddress, status: 'pending', network: networkName },
      relations: ['orderItems'],
    });

    if (!order) return;

    if (value >= BigInt(order.expectedAmount) && new Date() <= order.expiresAt) {
      order.status = 'paid';
      order.paidAt = new Date();
      await orderRepo.save(order);

      const io = (global as any).io;
      if (io) io.emit(SOCKET_EVENTS.ORDER_PAID, { uid: order.uid });

      await deliverGiftCards(order);
    } else {
      console.log(`⚠️ Order ${order.id} on ${network.NAME} received partial payment: ${amountHuman} ${network.CURRENCY}`);
    }
  });

  provider.on(EMV_EVENTS.ERROR, (err) => {
    console.error(`[${network.NAME}] WebSocket error:`, err);
  });

  console.log(`🎧 Listening for ${network.CURRENCY} Transfer events on ${network.NAME}...`);
}

export async function startEventListeners() {
  await setupNetworkListener('sepolia');      // For USDT
  await setupNetworkListener('baseSepolia');  // For USDC

  // setInterval(() => refreshActiveAddresses('sepolia'), 60000);
  // setInterval(() => refreshActiveAddresses('baseSepolia'), 60000);
}

