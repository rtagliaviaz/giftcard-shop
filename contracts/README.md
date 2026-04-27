# Contracts

This directory contains the MockUSDT contract for the Giftcard Shop project.

## Pre-requisites
- Node.js and npm installed on your machine.
- hardhat installed globally or as a dev dependency in the project.
- An Ethereum-compatible wallet (e.g., MetaMask) connected to the Sepolia Testnet

## Installation
1. Navigate to the `contracts` directory in your terminal.
2. Install the necessary dependencies by running:
```bash
npm install
```

## Testing
To run the tests for the MockUSDT contract, use the following command in the `contracts` directory:
```bash
npx hardhat test
```

## Environment Variables
Before deploying the contracts or running the minting script, make sure to set up the required environment variables. You can create a `.env` file in the `contracts` directory based on the provided `.env.example` file. The necessary variables include:
- `SEPOLIA_RPC_URL`: The RPC URL for the Sepolia Testnet (you can obtain this from services like Infura or Alchemy).
- `SEPOLIA_PRIVATE_KEY`: The private key of the wallet you want to use for deployment and transactions (make sure to keep this secure and never share it).
- `MOCK_USDT_CONTRACT_ADDRESS`: The address of the deployed MockUSDT contract on the Sepolia Testnet.
- `WALLET_ADDRESS`: The address of the wallet that will receive the minted tokens.

note: if you're using Metamask, you can get the private key by going to accounts section -> click on the three dots next to the account you want to use > click on "Account details" > click on "Private Keys" and follow the instructions. Remember to keep your private key secure and never share it with anyone.

## Deployment
To deploy the MockUSDT contract to the Sepolia Testnet, you can use the following command:
```bash
npm run deploy:sepolia
```
This will execute the deployment script and deploy the contract to the specified network. After deployment, make sure to update the `MOCK_USDT_CONTRACT_ADDRESS` variable in your `.env` file with the address of the newly deployed contract.

## Minting Tokens
To mint tokens using the MockUSDT contract, you can run the minting script with the following command:
```bash
npm run mint:sepolia
```

