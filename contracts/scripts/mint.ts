import { network } from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const { ethers } = await network.connect({
    network: "sepolia",
    chainType: "l1",
  });

  const contractAddress = process.env.MOCK_USDT_CONTRACT_ADDRESS as string;
  const recipient = process.env.WALLET_ADDRESS as string;
  const amount = ethers.parseUnits("1000", 6); // 1000 USDT

  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const contract = await MockUSDT.attach(contractAddress);
  // Mint tokens to the recipient
  const mintTx = await contract.mint(recipient);
  await mintTx.wait();
  console.log(`Minted ${ethers.formatUnits(amount, 6)} USDT to ${recipient}`);
}

main().catch(console.error);