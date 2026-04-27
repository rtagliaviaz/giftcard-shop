import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect({
    network: "sepolia",
    chainType: "l1",
  });
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const contract = await MockUSDT.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("MockUSDT contract deployed to:", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});