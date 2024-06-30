const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("LuxauNFT", function () {
  async function deployContractFixture() {
    const [owner, otherAccount] = await ethers.getSigners()
    const LuxauNFT = await ethers.getContractFactory('LuxauNFT');
    const luxauNFT = await LuxauNFT.deploy(LuxauNFT);
    return { luxauNFT, owner, otherAccount };
  }

  describe("DEPLOYMENT", function () {
    it("Should deploy the smart contract", async function () {
      const { luxauNFT, owner } = await loadFixture(deployContractFixture);
      expect(await luxauNFT.owner()).to.equal(owner.address);
    })
  })
});
