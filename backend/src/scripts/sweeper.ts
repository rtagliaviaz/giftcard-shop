import { ethers } from 'ethers';
import { HDKey } from '@scure/bip32';
import { mnemonicToSeed } from '@scure/bip39';
import config from '../config';
import { AppDataSource } from '../db/data-source';
import { Orders, SweepLog } from '../entity/GiftCardDatabase';
import dotenv from 'dotenv';
dotenv.config();

const TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
];


async function ensureGasBalance(address: string, provider: ethers.Provider, gasWallet: ethers.Wallet): Promise<void> {
  const balance = await provider.getBalance(address);
  const minGas = ethers.parseEther(process.env.GAS_AMOUNT || "0.0005");
  if (balance < minGas) {
    console.log(`Funding ${address} with ${ethers.formatEther(minGas)} ETH for gas`);
    const tx = await gasWallet.sendTransaction({
      to: address,
      value: minGas,
    });
    await tx.wait();
    console.log(`Gas funded, tx: ${tx.hash}`);
  }
}

async function getWalletForIndex(index: number): Promise<ethers.Wallet> {
  const seed = await mnemonicToSeed(process.env.SWEEPER_MNEMONIC as string);
  const master = await HDKey.fromMasterSeed(seed);
  const child = master.derive(`m/44'/60'/0'/0/${index}`);
  if (!child.privateKey) throw new Error(`No private key for index ${index}`);
  return new ethers.Wallet('0x' + Buffer.from(child.privateKey).toString('hex'));
}

async function sweepOrder(order: Orders): Promise<void> {
  const network = config.networks[order.network as keyof typeof config.networks];
  if (!network) {
    console.error(`Unknown network ${order.network} for order ${order.id}`);
    return;
  }

  const provider = new ethers.JsonRpcProvider(network.RPC_URL); 
  const wallet = (await getWalletForIndex(order.addressIndex)).connect(provider);
  const tokenContract = new ethers.Contract(network.CURRENCY_CONTRACT_ADDRESS, TOKEN_ABI, wallet);

  try {
    

    const balance = await tokenContract.balanceOf(wallet.address);
    if (balance === 0n) {
      console.log(`Order ${order.id} (${order.address}) has zero balance, skipping.`);
      return;
    }

    const gasWallet = new ethers.Wallet(process.env.GAS_WALLET_PRIVATE_KEY!, provider);
    await ensureGasBalance(wallet.address, provider, gasWallet);

    
    console.log(`Sweeping ${ethers.formatUnits(balance, network.DECIMALS)} ${network.CURRENCY} from order ${order.id} to treasury ${process.env.SWEEPER_TREASURY_ADDRESS}`);
    const tx = await tokenContract.transfer(process.env.SWEEPER_TREASURY_ADDRESS as string, balance);
    console.log(`Tx hash: ${tx.hash}`);
    await tx.wait(1);
    console.log(`Transaction confirmed.`);

    const sweepLogRepo = AppDataSource.getRepository(SweepLog);
    await sweepLogRepo.save({
      orderId: order.id,
      txHash: tx.hash,
      fromAddress: wallet.address,
      amount: balance,
    });

    order.swept = true;
    await AppDataSource.getRepository(Orders).save(order);
    console.log(`Order ${order.id} marked as swept`);
  } catch (error) {
    console.error(`Error sweeping order ${order.id}:`, error);
  }
}

async function mainLoop() {
  console.log('Sweeper running...');
  const orderRepo = AppDataSource.getRepository(Orders);
  const ordersToSweep = await orderRepo.find({
    where: { status: 'paid', swept: false },
  });
  for (const order of ordersToSweep) {
    await sweepOrder(order);
  }
}

async function start() {
  await AppDataSource.initialize();
  console.log('Database connected');
  await mainLoop();
  setInterval(mainLoop, process.env.SWEEPER_INTERVAL_MS ? Number(process.env.SWEEPER_INTERVAL_MS) : 15 * 60 * 1000);
}

start().catch(console.error);