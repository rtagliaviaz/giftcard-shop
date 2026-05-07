import { ethers } from 'ethers';
import { AppDataSource } from '../db/data-source';
import { Orders } from '../entity/GiftCardDatabase';
import config from '../config';
import { deliverGiftCards } from './giftCardService';
import { NetworkName } from '../types/ConfigInterfaces';
import { EMV_EVENTS } from '../constants/emvEvents';
import { SOCKET_EVENTS } from '../constants/socketEvents';
import { MoreThan } from 'typeorm';

const ERC20_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'function decimals() view returns (uint8)',
];

const activeListeners: Map<NetworkName, { provider: ethers.WebSocketProvider; contract: ethers.Contract }> = new Map();

async function hasPendingOrders(network?: NetworkName): Promise<boolean> {
  const orderRepo = AppDataSource.getRepository(Orders);
  const where: any = { status: 'pending', expiresAt: MoreThan(new Date()) };
  if (network) where.network = network;
  const count = await orderRepo.count({ where });
  return count > 0;
}

async function stopListener(networkName: NetworkName) {
  const listener = activeListeners.get(networkName);
  if (listener) {
    listener.provider.removeAllListeners();
    await listener.provider.destroy();
    activeListeners.delete(networkName);
    console.log(`[${networkName}] Listener stopped (no pending orders).`);
  }
}

export async function startListenerIfNeeded(networkName: NetworkName) {
  if (activeListeners.has(networkName)) return; // already active
  if (!(await hasPendingOrders(networkName))) {
    console.log(`[${networkName}] No pending orders, listener not started.`);
    return;
  }
  await setupNetworkListener(networkName);
}

async function setupNetworkListener(networkName: NetworkName) {
  if (networkName !== 'sepolia' && networkName !== 'baseSepolia') {
    console.error(`Unsupported network: ${networkName}`);
    return;
  }
  const network = config.networks[networkName];
  if (!network) return;

  const tokenAddress = network.CURRENCY_CONTRACT_ADDRESS;
  console.log(`Setting up listener for ${network.CURRENCY} on ${network.NAME} at address ${tokenAddress}`);
  const provider = new ethers.WebSocketProvider(network.RPC_WS_URL);
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const decimals = await contract.decimals();
  const divisor = 10n ** decimals;

  contract.on(EMV_EVENTS.TRANSFER, async (from, to, value) => {
    const toAddress = to.toLowerCase();
    const amountHuman = Number(value) / Number(divisor);
    const orderRepo = AppDataSource.getRepository(Orders);
    const order = await orderRepo.findOne({
      where: { address: toAddress, status: 'pending', network: networkName },
      relations: ['orderItems'],
    });
    if (!order) return;
    console.log(`[${network.NAME}] Transfer detected: ${amountHuman} ${network.CURRENCY} to ${to}`);

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

  activeListeners.set(networkName, { provider, contract });
  console.log(`🎧 Listening for ${network.CURRENCY} Transfer events on ${network.NAME}...`);
}

if (process.env.NODE_ENV !== 'test') {
  setInterval(async () => {
    for (const network of ['sepolia', 'baseSepolia'] as NetworkName[]) {
      if (activeListeners.has(network) && !(await hasPendingOrders(network))) {
        await stopListener(network);
      }
    }
  }, 60_000);
}

export async function startEventListeners() {
  if (process.env.NODE_ENV === 'test') {
    console.log('Test environment: skipping WebSocket listeners');
    return;
  }
  await setupNetworkListener('sepolia');
  await setupNetworkListener('baseSepolia');
}