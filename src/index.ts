import express, { Request, Response } from 'express';
import { ethers } from 'ethers';
import bodyParser from 'body-parser';
import cors from 'cors';
import config from './config';
import { Order, OrderItem } from './types/OrdersInterfaces';
import { initializeDatabase } from './db/init';


const { sepolia } = config;



const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// -----------------------------------------------------------------
// 1. Configuration & Types
// -----------------------------------------------------------------
const ORDER_EXPIRY_MINUTES = 60; // fixed typo from ORDER_EXPIIRY_MINUTES

// Environment variables with type safety
const XPUB: string = sepolia.SEPOLIA_XPUB || '';
const PROVIDER_URL: string = sepolia.SEPOLIA_RPC_URL || '';
const USDT_ADDRESS: string = sepolia.SEPOLIA_MOCK_USDT_ADDRESS || '';

if (!XPUB || !PROVIDER_URL || !USDT_ADDRESS) {
    throw new Error('Missing required environment variables');
}

const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const xpubNode = ethers.HDNodeWallet.fromExtendedKey(XPUB);

// -----------------------------------------------------------------
// 2. Data Models (matching your in‑memory store)
// -----------------------------------------------------------------


// In‑memory store
let orders: Order[] = [];
let nextIndex = 0;

// -----------------------------------------------------------------
// 3. Helper: derive Ethereum address from XPUB
// -----------------------------------------------------------------
function getAddressForIndex(index: number): { address: string } {
    // Derive child node at path m/44'/60'/0'/0/index
    const childNode = xpubNode.derivePath(`m/44'/60'/0'/0/${index}`);
    console.log(`Index ${index} -> ${childNode.address}`);
    console.log(`Path: ${childNode.path}, depth: ${childNode.depth}`);
    return { address: childNode.address };
}

// -----------------------------------------------------------------
// 4. Health check endpoint
// -----------------------------------------------------------------
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

// -----------------------------------------------------------------
// 5. Create order endpoint
// -----------------------------------------------------------------
interface CreateOrderBody {
    email: string;
    items: OrderItem[];
    totalAmountRaw: string;       // as string to preserve bigint
    termsAccepted: boolean;
}

app.post('/create-order', (req: Request<{}, {}, CreateOrderBody>, res: Response) => {
    const { email, items, totalAmountRaw, termsAccepted } = req.body;

    if (!termsAccepted) {
        return res.status(400).json({ error: 'You must accept the terms and conditions' });
    }

    const { address } = getAddressForIndex(nextIndex);
    const expiresAt = new Date(Date.now() + ORDER_EXPIRY_MINUTES * 60 * 1000);

    // Convert totalAmountRaw from string to BigInt
    const expectedAmount = BigInt(totalAmountRaw);

    const order: Order = {
        id: nextIndex,
        address,
        paid: false,
        expectedAmount,
        email,
        items,
        expiresAt,
    };

    orders.push(order);
    nextIndex++;

    res.json({
        orderId: order.id,
        address: order.address,
        expiresAt: expiresAt.toISOString(),
    });
});

// -----------------------------------------------------------------
// 6. Check payment using USDT balance
// -----------------------------------------------------------------
async function checkPayment(order: Order): Promise<boolean> {
    console.log(`Checking payment for order ${order.id} at address ${order.address}`);

    if (new Date() > order.expiresAt) {
        console.log(`❌ Order ${order.id} has expired`);
        return false;
    }
    if (order.paid) return true;

    console.log(`Expected amount: ${order.expectedAmount.toString()}`);

    const usdtContract = new ethers.Contract(
        USDT_ADDRESS,
        ['function balanceOf(address) view returns (uint256)'],
        provider
    );

    const balance: bigint = await usdtContract.balanceOf(order.address);
    console.log(`Balance for order ${order.id}: ${balance.toString()}`);

    if (balance >= order.expectedAmount) {
        order.paid = true;
        console.log(`✅ Order ${order.id} paid! Sending gift card to ${order.email}`);
        // TODO: send email with gift card codes
        return true;
    }
    return false;
}

// -----------------------------------------------------------------
// 7. Monitor USDT Transfer events
// -----------------------------------------------------------------
const usdtContract = new ethers.Contract(
    USDT_ADDRESS,
    ['event Transfer(address indexed from, address indexed to, uint256 value)'],
    provider
);

usdtContract.on('Transfer', (from: string, to: string, value: bigint) => {
    console.log(`Detected USDT transfer from ${from} to ${to} of value ${value.toString()}`);
    const order = orders.find(o => o.address === to);
    if (order) {
        console.log(`Matched order ${order.id}`);
        checkPayment(order).catch(err => console.error(`Error checking payment: ${err}`));
    }
});
  
// -----------------------------------------------------------------
// 8. Order status endpoint
// -----------------------------------------------------------------
app.get('/order-status/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const order = orders[id];

    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    const expired = Date.now() > order.expiresAt.getTime();
    res.json({
        paid: order.paid && !expired,
        address: order.address,
        expectedAmount: order.expectedAmount.toString(),
        expiresAt: order.expiresAt.toISOString(),
        expired,
    });
});

// -----------------------------------------------------------------
// 9. Start server
// -----------------------------------------------------------------
const PORT = process.env.PORT || 3000;
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🛒 Gift card shop listening on http://localhost:${PORT}`);
        console.log(`Mock USDT contract at: https://sepolia.etherscan.io/address/${USDT_ADDRESS}`);
    });
}).catch((error) => {
    console.error("Error initializing database:", error);
});
