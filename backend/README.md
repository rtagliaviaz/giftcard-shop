# Backend

This document provides an overview of the backend structure, packages used, installation instructions, API endpoints, and database schema for the gift card shop project.

# Index
- [Project Structure](#project-structure)
- [Packages](#packages)
- [Installation](#installation)
- [Tests](#tests)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database](#database)
- [Socket.io Events](#socketio-events)
- [Scripts](#scripts)

## Project Structure


```
├── database/
│   └── init.sql
├── src/
│   ├── __tests__/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── db/
│   ├── entity/
│   ├── middleware/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   ├── socket/
│   ├── types/
│   ├── app.ts
│   ├── index.ts
│   └── server.ts
├── .env
├── .env.example
├── .gitignore
├── jest.config.cjs
├── package-lock.json
├── package.json
├── README.es-LA.md
├── README.md
└── tsconfig.json
```

## Packages

- `cors`: Middleware for enabling Cross-Origin Resource Sharing (CORS) in Express.
- `dotenv`: Loads environment variables from a `.env`.
- `ethers`: Library for interacting with the Ethereum blockchain, used for handling cryptocurrency payments and transactions.
- `express`: Web framework for Node.js.
- `express-rate-limit`: Middleware to limit repeated requests to API.
- `jest`: Testing framework.
- `mysql2`: MySQL client for Node.js to interact with the database.
- `nanoid`: Library for generating unique IDs, used for creating gift card codes and order IDs.
- `nodemailer`: Library for sending emails, used for sending order confirmations and notifications to customers.
- `socket.io`: Library for real-time web applications, enabling bidirectional communication between clients and servers.
- `sqlite3`: Database driver for SQLite for Jest testing with TypeORM.
- `supertest`: Library for testing HTTP servers, used in conjunction with Jest for API endpoint testing.
- `ts-node`: TypeScript execution environment for Node.js.
- `typeorm`: ORM for TypeScript and JavaScript to interact with the database.
- `typescript`: TypeScript language support.
- `@scure/bip32`: Library for working with BIP32 hierarchical deterministic wallets, used for generating addresses from an extended public key (xpub).
- `@types/express`, `@types/node`, `@types/jest`, etc.: TypeScript type definitions for the libraries used.

## Installation
in order to install the dependencies, run the following command in the terminal at the root of the project assuming you have Node.js and npm installed and you are located in the `backend` directory:

```bash
npm install
```

## Tests
To run the tests, use the following command in the terminal must be located in the `backend` directory:

```bash
npm run test
```


## Environment Variables
The backend relies on several environment variables for configuration. You can create a `.env` file in the root of the project based on the provided `.env.example` file. Below is a list of the required environment variables along with their descriptions and examples:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port for the Express server | `3000` |
| `CLIENT_URL` | Frontend URL | `http://localhost:3001` |
| `XPUB` | Extended public key (derived from same mnemonic) | `xpub6...` |
| `SEPOLIA_NAME` | Sepolia network name | `sepolia` |
| `SEPOLIA_CHAIN_ID` | Sepolia chain ID | `11155111` |
| `SEPOLIA_RPC_URL` | Sepolia HTTP RPC endpoint | `https://sepolia.infura.io/v3/<api-key>` |
| `SEPOLIA_RPC_WS_URL` | Sepolia WebSocket RPC endpoint | `wss://sepolia.infura.io/ws/v3/<api-key>` |
| `SEPOLIA_CURRENCY` | Sepolia currency symbol | `USDT` |
| `SEPOLIA_MOCK_USDT_ADDRESS` | Mock USDT contract address on Sepolia | `0x56C60aa5...` |
| `SEPOLIA_DECIMALS` | Decimals for USDT on Sepolia | `6` |
| `BASE_SEPOLIA_NAME` | Base Sepolia network name | `base-sepolia` |
| `BASE_SEPOLIA_CHAIN_ID` | Base Sepolia chain ID | `84532`|
| `BASE_SEPOLIA_RPC_URL` | Base Sepolia HTTP RPC endpoint | `https://sepolia.base.org` |
| `BASE_SEPOLIA_RPC_WS_URL` | Base Sepolia WebSocket RPC endpoint | `wss://base-sepolia.infura.io/ws/v3/<api-key>` |
| `BASE_SEPOLIA_CURRENCY` | Base Sepolia currency symbol | `USDC` |
| `BASE_SEPOLIA_USDC_ADDRESS` | USDC contract address on Base Sepolia | `0x036CbD53...` |
| `BASE_SEPOLIA_DECIMALS` | Decimals for USDC on Base Sepolia | `6` |
| `MYSQL_*` | Database credentials (host, port, user, password, name) | See `.env.example` |
| `EMAIL_HOST` | Email server host | `smtp.example.com` |
| `EMAIL_PORT` | Email server port | `587` |
| `EMAIL_SECURE` | Indicates if a secure connection should be used (true for port 465, false for 587) | `false` |
| `EMAIL_AUTH_USER` | Email server user | `user@example.com` |
| `EMAIL_AUTH_PASS` | Email server password | `password` |
| `SWEEPER_INTERVAL_MS` | Interval for the sweeper script in milliseconds | `900000` |
| `SWEEPER_TREASURY_ADDRESS` | Treasury address for the sweeper script | `0x...` |
| `SWEEPER_MNEMONIC` | Mnemonic for the sweeper script | `test test ... junk` |
| `WALLET_MNEMONIC` | Mnemonic for the xpub generation script | `test test ... junk` |
| `GAS_WALLET_PRIVATE_KEY` | Private key for the gas wallet | `0x...` |
| `GAS_AMOUNT` | Amount of gas to be used for transactions | `0.0005` |



## API Endpoints
### `GET /api/health`: Health check endpoint to verify that the server is running.
- **Endpoint**: `/api/health`
- **Method**: `GET`
- **Status Codes**:
  - `200 OK`: Server is healthy.
- **Response**:
```json
{
  "status": "ok"
}
```

### `POST /api/create-order`: Creates a new order.
- **Endpoint**: `/api/create-order`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "customer@example.com",
  "items": [
    {
      "giftCardTypeId": 1,
      "quantity": 2,
      "unitAmountUSD": 25
    }
  ],
  "totalAmountRaw": 50000000, //total price in cents (quantity * unitAmountUSD) with decimals (6 for USDT/USDC),
  "network": "sepolia" //or "base-sepolia"
}
```
- **Status Codes**:
  - `201 Created`: Order created successfully.
  - `400 Bad Request`: Invalid request body or missing fields.
  - `500 Internal Server Error`: Failed to create order.
- **Response**:
```json
{
  "uid": "unique_order_id",
  "address": "derived_wallet_address_for_payment",
  "expiresAt": "2024-01-01T00:00:00.000Z"
}
```

### `GET /api/order-status/:uid`: Retrieves order details by UID.
- **Endpoint**: `/api/order-status/:uid`
- **Method**: `GET`
- **Status Codes**:
  - `200 OK`: Order found and returned successfully.
  - `404 Not Found`: No order found with the provided UID.
- **Response**:
```json
{
  "paid": false, // or true
  "address": "derived_wallet_address_for_payment",
  "expectedAmount": "50.000000", // human readable amount with decimals
  "expiresAt": "2024-01-01T00:00:00.000Z",
  "status": "pending", // possible states: "pending", "paid", "cancelled", "expired"
  "network": "sepolia", // or "base-sepolia"
  "currency": "USDT" // or "USDC"
}
```

### `GET /api/order-codes/:uid`: Retrieves order codes by UID.
- **Endpoint**: `/api/order-codes/:uid`
- **Method**: `GET`
- **Status Codes**:
  - `200 OK`: Codes retrieved successfully.
  - `400 Bad Request`: Order not paid yet or invalid UID.
  - `404 Not Found`: No order found with the provided UID.
- **Response**:
```json
[
  {
    "code": "CODE1234567890",
    "giftCardId": 1,
    "giftCardType": "Amazon Gift Card",
    "deliveredAt": "2024-01-01T00:00:00.000Z",
    "denomination": 5.00
  },
  {
    "code": "CODE0987654321",
    "giftCardId": 2,
    "giftCardType": "Amazon Gift Card",
    "deliveredAt": "2024-01-01T00:00:00.000Z",
    "denomination": 10.00
  }
]
```

### `GET /api/gift-card-types`: Retrieves the list of available gift card types.
- **Endpoint**: `/api/gift-card-types`
- **Method**: `GET`
- **Status Codes**:
  - `200 OK`: Gift card types retrieved successfully.
  - `500 Internal Server Error`: Error retrieving gift card types.
- **Response**:
```json
[
  {
    "id": 1,
    "name": "Steam Gift Card",
    "image": "https://example.com/steam.png",
    "denominations": [
      {
        "id": 1,
        "value": 5.00
      },
      {
        "id": 2,
        "value": 10.00
      }
    ]
  },
  {
    "id": 2,
    "name": "Amazon Gift Card",
    "image": "https://example.com/amazon.png",
    "denominations": [
      {
        "id": 6,
        "value": 10.00
      },
      {
        "id": 7,
        "value": 25.00
      }
    ]
  }
]
```

### `GET /api/gift-card-types/:id`: Retrieves details of a gift card type by its ID.
- **Endpoint**: `/api/gift-card-types/:id`
- **Method**: `GET`
- **Status Codes**:
  - `200 OK`: Gift card type retrieved successfully.
  - `404 Not Found`: No gift card type found with the provided ID.
  - `500 Internal Server Error`: Failed to fetch gift card type.
- **Response**:
```json
{
  "id": 1,
  "name": "Steam Gift Card",
  "image": "https://example.com/steam.png",
  "denominations": [
    {
      "id": 1,
      "amount": 5.00
    },
    {
      "id": 2,
      "amount": 10.00
    }
  ]
}
```

## Database
The database tables and relationships are defined in the `database/init.sql` file and in the TypeORM entities located in `src/entity/`. These entities represent the database tables and their relationships, and are used to interact with the database through TypeORM.


## Socket.io Events
- `connection`: Event triggered when a client connects to the Socket.io server.
- `disconnect`: Event triggered when a client disconnects from the Socket.io server.
- `order-codes`: Custom event emitted to send order codes to the client in real-time
- `order-paid`: Custom event emitted to notify the client that their order has been paid.
- `cancel-order`: Custom event emitted to notify the client that their order has been canceled.
- `order-cancelled`: Custom event emitted to notify the client that their order has been canceled by the system due to non-payment within the time limit.

## Scripts

### Sweeper (`sweeper.ts`)
Script for sweeping funds from user wallets to the treasury.

The `sweeper.ts` script is responsible for checking the balances of user wallets associated with
orders and transferring any funds to the treasury address. It connects to the blockchain using ethers.js, retrieves the balance of each wallet, and if there are funds present, it initiates a transfer to the treasury.

The script uses the `getWalletForIndex` function to derive the wallet for each order based on an index, which is typically derived from a master mnemonic. In this case, it uses the `MNEMONIC` environment variable to generate the wallet. 

The script checks the balance of the wallet for each order, and if the balance is greater than zero, it transfers the funds to the treasury address specified in the `TREASURY_ADDRESS` environment variable.

### Generate Xpub (`generateXpub.ts`)
Script for generating an extended public key (xpub) from a mnemonic, used for deriving wallet addresses.

The `generateXpub.ts` script is used to generate an extended public key (xpub) from a given mnemonic. This xpub can then be used to derive multiple wallet addresses for the orders without exposing the private keys. The script takes a mnemonic as input, generates the master seed, and then derives the xpub using the BIP32 standard. The generated xpub can be used in the application to derive wallet addresses for each order based on an index, allowing for secure management of multiple wallets without needing to store private keys on the server.

### How to Use the Scripts
To run any of the scripts, make sure you have the necessary environment variables configured in your `.env` file, then you can execute the script using the following command in the terminal, located in the `backend` directory:

sweeper:
```bash
npm run script:sweeper
```

generate xpub:
```bash
npm run script:generate-xpub
```


### ⚠️ Security Note 
> In a real case scenario, the private keys should never be stored on the server, and the sweeping process should be handled in a secure environment. Always ensure that the environment variables containing sensitive information are properly secured and not exposed in version control or logs. It is better to run the sweeping process and the xpub generation on a separate server with restricted access.