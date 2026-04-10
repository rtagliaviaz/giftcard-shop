import { ethers } from 'ethers';
import { AppDataSource } from '../db/data-source';
import { Orders } from '../entity/GiftCardDatabase';
import config from '../config';
import { deliverGiftCards } from './giftCardSerivce'; // your fulfillment logic

const {sepolia} = config;

const USDT_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'function decimals() view returns (uint8)',
];

export async function startEventListener() {
  const provider = new ethers.WebSocketProvider(sepolia.SEPOLIA_RPC_WS_URL);
  const usdt = new ethers.Contract(sepolia.SEPOLIA_MOCK_USDT_ADDRESS, USDT_ABI, provider);
  const decimals = await usdt.decimals(); // should be 6 for USDT
  const divisor = 10n ** decimals;          // 10n is BigInt 10



  console.log('Listening for USDT Transfer events...');


  usdt.on('Transfer', async (from, to, value, event) => {

    // Convert value to human readable for logging
    const amountHuman = Number(value) / Number(divisor);

    // Find the pending order with this address
    const orderRepo = AppDataSource.getRepository(Orders);
    const order = await orderRepo.findOne({
      where: { address: to, status: 'pending' },
      relations: ['orderItems'], // if you need items for fulfillment
    });

    if (!order) {
      // No pending order for this address – maybe it's a random transfer or already processed
      console.log(`Received ${amountHuman} USDT from ${from} to ${to} – no pending order.`);
      return;
    }

    // Check if the amount meets or exceeds expected (in smallest units)
    if (value >= order.expectedAmount && new Date() <= order.expiresAt) {
        order.status = 'paid';
        order.paidAt = new Date();
        await orderRepo.save(order);
        
        // Emit WebSocket event
        const io = (global as any).io;
        if (io) io.emit('order-paid', { uid: order.uid });
        
        await deliverGiftCards(order);
    } else {
      console.log(`⚠️ Order ${order.id} received partial payment: ${amountHuman} USDT (expected ${Number(order.expectedAmount) / Number(divisor)} USDT)`);
      // You could store a partial payment record, but typically you require full amount
    }
  });

  provider.on('error', (err) => {
    console.error('WebSocket error:', err);
    // Implement reconnection logic if needed
  });
}