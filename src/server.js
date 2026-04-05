const express = require('express')
const {ethers} = require('ethers')
const bodyParser = require('body-parser')
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')


dotenv.config()

app.use(express.json())
app.use(bodyParser.json())
app.use(cors())

// -----------------------------------------------------------------
// 1. Configuration
// -----------------------------------------------------------------
const ORDER_EXPIIRY_MINUTES = 60; // orders expire after 60 minutes

const XPUB = process.env.SEPOLIA_XPUB
// we are using the xpub to derive the addresses, but we still need the mnemonic to be able to sign transactions if needed (e.g. to refund)



const PROVIDER_URL = process.env.SEPOLIA_RPC_URL
const provider = new ethers.JsonRpcProvider(PROVIDER_URL)

const USDT_ADDRESS = process.env.SEPOLIA_MOCK_USDT_ADDRESS



const xpubNode = ethers.HDNodeWallet.fromExtendedKey(XPUB);


// -----------------------------------------------------------------
// 2. Derive a unique address for each order (using same path as MetaMask)
// -----------------------------------------------------------------

//this was unsafe because it could generate the same address for different indexes, we need to use the xpub instead of the mnemonic to derive the addresses
// function getAddressForIndex(index) {
//     const wallet = ethers.HDNodeWallet.fromPhrase(
//         MNEMONIC.trim(),
//         `m/44'/60'/0'/0/${index}`
//     );
//     console.log(`Index ${index} -> ${wallet.address}`);
//     console.log(`Path: ${wallet.path}, depth: ${wallet.depth}`);
//     return { address: wallet.address, privateKey: wallet.privateKey };
// }
function getAddressForIndex(index) {
    //derive child node at path m/44'/60'/0'/0/index
    const childNode = xpubNode.derivePath(`m/44'/60'/0'/0/${index}`);
    console.log(`Index ${index} -> ${childNode.address}`);
    console.log(`Path: ${childNode.path}, depth: ${childNode.depth}`);
    return { address: childNode.address};
}


// -----------------------------------------------------------------
// 3. In‑memory order store
// -----------------------------------------------------------------
let orders = [];
let nextIndex = 0;


// -----------------------------------------------------------------
// healthcheck endpoint
// -----------------------------------------------------------------
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});



// -----------------------------------------------------------------
// 4. API Endpoint: create a new order
// -----------------------------------------------------------------
app.post('/create-order', (req, res) => {
    const { email, items, totalAmountRaw, termsAccepted } = req.body;
    if (!termsAccepted) return res.status(400).json({ error: 'You must accept the terms and conditions' });

    // const address= getAddressForIndex(nextIndex);
    const {address}= getAddressForIndex(nextIndex);
    const expiresAt = new Date(Date.now() + ORDER_EXPIIRY_MINUTES * 60 * 1000);

    // const
    const order = {
        id: nextIndex,
        address,
        paid: false,
        expectedAmount: totalAmountRaw,
        email,
        items,
        expiresAt,
    };
    orders.push(order);
    nextIndex++;
    res.json({ orderId: order.id, address: order.address, expiresAt: expiresAt });
});
// app.post('/create-order', (req, res) => {
//     const { email } = req.body;
//     const { address, privateKey } = getAddressForIndex(nextIndex);
//     orders.push({
//         id: nextIndex,
//         address,
//         privateKey,
//         paid: false,
//         expectedAmount: PRICE_RAW,
//         email,
//     });
//     nextIndex++;
//     res.json({ orderId: nextIndex - 1, address });
// });


// -----------------------------------------------------------------
// 5. Helper: check if an order's address has received the exact amount
// -----------------------------------------------------------------
async function checkPayment(order) {
  console.log(`Checking payment for order ${order.id} at address ${order.address}`);
    if (new Date() > order.expiresAt) {
        console.log(`❌ Order ${order.id} has expired`);
        return false;
    }
    if (order.paid) return true;
    console.log('order.expectedAmount:', order.expectedAmount.toString());
    const usdt = new ethers.Contract(
        USDT_ADDRESS,
        ["function balanceOf(address) view returns (uint256)"],
        provider
    );
    const balance = await usdt.balanceOf(order.address);
    console.log(`Checking order ${order.id}: balance is ${balance}, expected ${order.expectedAmount}`);
    if (balance >= order.expectedAmount) {
        order.paid = true;
        console.log(`✅ Order ${order.id} paid! Sending gift card to ${order.email}`);
        // In a real app: send email with code, etc.
        return true;
    }
    return false;
}

// -----------------------------------------------------------------
// 6. Background monitor
// -----------------------------------------------------------------
//listen to usdt transfer events to the order addresses instead of polling

const usdt = new ethers.Contract(
    USDT_ADDRESS,
    ["event Transfer(address indexed from, address indexed to, uint256 value)"],
    provider
);

usdt.on("Transfer", (from, to, value) => {
    console.log(`Detected USDT transfer from ${from} to ${to} of value ${value}`);
    const order = orders.find(o => o.address === to);
    if (order) {
        console.log(`Detected USDT transfer to order ${order.id}: ${value}`);
        checkPayment(order);
    }
});


// async function monitorOrders() {
//     for (const order of orders) {
//         if (!order.paid) {
//             await checkPayment(order);
//         }
//     }
// }

// setInterval(monitorOrders, 10000); // check every 10 seconds for demo

// -----------------------------------------------------------------
// 7. (Optional) Endpoint to check order status
// -----------------------------------------------------------------
app.get('/order-status/:id', (req, res) => {
    const order = orders[parseInt(req.params.id)];
    if (!order) return res.status(404).json({ error: 'Order not found' });
    // res.json({ paid: order.paid, address: order.address });
    const expired = Date.now() > order.expiresAt;
    res.json({
        paid: order.paid && !expired, // if expired, paid status becomes irrelevant
        address: order.address,
        expectedAmount: order.expectedAmount,
        expiresAt: order.expiresAt,
        expired: expired
    });
});

// -----------------------------------------------------------------
// 8. Start the server
// -----------------------------------------------------------------
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🛒 Gift card shop listening on http://localhost:${PORT}`);
    console.log(`Mock USDT contract at: https://sepolia.etherscan.io/address/${USDT_ADDRESS}`);
});