# GIFTCARD SHOP 
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Node](https://img.shields.io/badge/node-%3E%3D%2018-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)]()
[![React](https://img.shields.io/badge/React-18.2-61dafb)]()
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF)]()
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22-FFF)]()
[![Jest](https://img.shields.io/badge/Jest-passing-brightgreen)]()
[![Vitest](https://img.shields.io/badge/Vitest-passing-brightgreen)]()

English | [Spanish](./README.es-LA.md)


⚠️ **Important note: the cryptocurrencies used in this project are not from the mainnet, but from the testnet, which means they have no real value and are used solely for development and testing purposes.**

This project is a gift card shop that accepts cryptocurrency payments. It allows users to purchase gift cards using various cryptocurrencies, providing a convenient and secure way to buy gift cards online, because the project uses testnets. You can obtain test ETH for free from the faucets listed below.


# Index
- [Demo](#demo)
- [Video Demo](#video-demo)
- [Project Structure](#project-structure)
- [Security](#security)
- [Test Wallet](#test-wallet)
- [Faucets](#faucets)
- [Backend](./backend/README.md)
- [Frontend](./frontend/README.md)
- [Contracts](./contracts/README.md)
- [Troubleshooting](#troubleshooting)


## Demo
https://rtagliavia.net/

## Video Demo


## Project Structure

```
├── backend/
├── contracts/
├── frontend/
├── docker-compose.yml
├── README.es-LA.md
└── README.md
```

## Installation
To set up the project, you need to install the dependencies for both the backend and frontend. In order to do this, navigate to each directory and run `npm install`. Check the README files in each directory for more details.

If you need to deploy your own mock USDT contract, you can use the provided `contracts/MockUSDT` contract and deploy it to the Sepolia testnet using Hardhat (read the contracts [README](./contracts/README.md) file for instructions). Make sure to update the `USDT_ADDRESS` in the backend `.env` file with the address of your deployed contract.

[init.sql](./backend/init.sql) file is provided in the backend directory, you can use it to initialize your MySQL database with the required tables and some sample data. You can run the SQL commands in that file using a MySQL client or command line tool.

**docker-compose**: for the database, you can use the provided `docker-compose.yml` file to set up a MySQL database in a Docker container. Make sure you have Docker installed, then run `docker-compose up` in the root directory of the project.

## Security
### XPUB
- The project uses an XPUB key to generate unique wallet addresses for each gift card purchase. This allows the system to track payments without needing to create separate wallets for each transaction, enhancing security and simplifying the payment process. Also avoids the exposure of private keys.

### Sweeper Wallet
- The project uses a sweeper wallet. This wallet collects the payments received from customers and allows for easier management of the funds, ensuring that they are securely stored and can be accessed when needed. The purpose is to avoid losing funds in case of an attack.


## Test Wallet
For this project I used MetaMask as my wallet, so to test the project you need to have an Ethereum-compatible wallet and connected to the `Sepolia Testnet` and `Base Sepolia`.

To add the `Base Sepolia` network to Metamask, you can follow the steps of this [guide](https://revoke.cash/learn/wallets/add-network/base-sepolia)

## Faucets

### USDT 
- for this project I made a mock USDT token on Sepolia testnet, if you use Metamask you can go to Sepolia, import token and add the token contract address and mint some test USDT tokens to your wallet. The token contract address is: `0x6920e98F7dAA4F6c89C4baadB115daEF1b31EeA7` (note: this is a mock token and has no real value).

### USDC
- https://faucet.circle.com/ : just enter your wallet address and select the USDC token on the Base Sepolia testnet to receive test USDC.

### ETH for Base Sepolia Testnet
- https://coinbase.com: it needs a coinbase account, but it is the easiest way to get testnet ETH for Base Sepolia.

### ETH Sepolia Testnet
- https://cloud.google.com/application/web3/faucet/ethereum/sepolia: you can get some testnet ETH for Sepolia by connecting your wallet and completing a captcha.


## Troubleshooting
### `Socket connection failed`
- Check that the frontend `VITE_WS_URL` points to the correct backend URL (e.g., `http://localhost:3000`).
- Confirm no firewall is blocking WebSocket upgrades.
- Check Backend `CLIENT_URL` matches the frontend URL for CORS.

### `Cannot mint mock USDT – missing revert data`
- Make sure you are using the contract owner’s private key (the one that deployed the contract).
- Verify the contract address in `.env` is correct.
- Check that Sepolia ETH is available in the signer wallet.

### `Order not detected after payment`
- Confirm the event listener is running (`startEventListener` called in `server.ts`).
- Check that the network (`sepolia` or `baseSepolia`) matches the order’s network.
- Verify the `USDT_ADDRESS` / `USDC_ADDRESS` in config matches the deployed mock contract.

### `Database connection error`
- Validate MySQL credentials in `.env`.
- Ensure that docker container is running.
- Run `mysql -u root -p` to test connectivity.
- If using SQLite for tests, ensure `sqlite3` is installed.

### `xpubs or addresses mismatch`
- The derivation path must be `m/44'/60'/0'` for the account xpub.
- Address index `0` should match the first derived address from your wallet.

### `Sweeper fails with "insufficient funds for gas"`
- The deposit address lacks native ETH for the gas fee. For testnets, send a small amount of test ETH to that address. If you need some ETH, check [Faucets](#faucets).
