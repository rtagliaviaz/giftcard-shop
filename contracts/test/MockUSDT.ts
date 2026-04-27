import {expect} from "chai";
import {network} from "hardhat";

const {ethers} = await network.create();



describe("MockUSDT", function () {
  it('should have correct name, symbol, decimals and initial supply', async function () {
    const mockUSDT = await ethers.deployContract("MockUSDT");
    const [deployer] = await ethers.getSigners();

    expect(await mockUSDT.name()).to.equal("Mock USDT");
    expect(await mockUSDT.symbol()).to.equal("mUSDT");
    expect(await mockUSDT.decimals()).to.equal(6);
    const expectedSupply = ethers.parseUnits("1000000", 6);
    expect(await mockUSDT.totalSupply()).to.equal(expectedSupply);
    expect(await mockUSDT.balanceOf(deployer.address)).to.equal(expectedSupply);
  })

  it('should allow minting tokens from any address', async function () {
    const mockUSDT = await ethers.deployContract("MockUSDT");
    const [deployer, recipient] = await ethers.getSigners();
    const mintAmount = ethers.parseUnits("1000", 6);

    await mockUSDT.mint(recipient.address);
    expect(await mockUSDT.balanceOf(recipient.address)).to.equal(mintAmount);
  })
})