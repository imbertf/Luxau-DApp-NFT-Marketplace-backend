const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require('hardhat');

describe("LuxauNFT", function () {
  async function deployContractFixture() {
    const _name = "MyToken";
    const _symbol = "MTK";
    const _baseURI = "ifps://base.uri/";

    const [owner, otherAccount] = await ethers.getSigners();
    const LuxauNFT = await ethers.getContractFactory('LuxauNFT');
    const luxauNFT = await LuxauNFT.deploy(_name, _symbol, _baseURI);

    return { luxauNFT, owner, otherAccount };
  }

  describe("DEPLOYMENT", function () {
    it("Should deploy the smart contract", async function () {
      const { luxauNFT, owner } = await loadFixture(deployContractFixture);
      expect(await luxauNFT.owner()).to.equal(owner.address);
      expect(await luxauNFT.name()).to.equal("MyToken");
      expect(await luxauNFT.symbol()).to.equal("MTK");
      expect(await luxauNFT.baseURI()).to.equal("ifps://base.uri/");
    });
  });

  describe("MINT", function () {
    describe("checks", function () {
      it('Should revert if not owner', async function () {
        const { luxauNFT, otherAccount } = await loadFixture(deployContractFixture);
        await expect(luxauNFT.connect(otherAccount).safeMint({ value: ethers.parseEther("0.01") })).to.be.revertedWithCustomError(luxauNFT, 'OwnableUnauthorizedAccount');
      })
      it('Should NOT mint if not expected minimum price', async function () {
        const { luxauNFT, owner } = await loadFixture(deployContractFixture);
        await expect(luxauNFT.safeMint({ value: ethers.parseEther("0.001") })).to.be.revertedWith("Minimum price to mint is 0.01 ETH")
      })
      it('Should NOT mint twice', async function () {
        const { luxauNFT, owner } = await loadFixture(deployContractFixture);
        expect(await luxauNFT.safeMint({ value: ethers.parseEther("0.01") }));
        await expect(luxauNFT.safeMint({ value: ethers.parseEther("0.01") })).to.be.revertedWith("You can mint only once");
      })
    })
    describe("effects", function () {
      it('Should mint if expected minimum price', async function () {
        const { luxauNFT, owner } = await loadFixture(deployContractFixture);
        await expect(luxauNFT.safeMint({ value: ethers.parseEther("10") })).to.be.not.revertedWith("Minimum price to mint is 0.01 ETH")
      })
    })
  })

  describe("tokenURI", function () {
    describe("checks", function () {
      it('Should revert if token does not exist', async function () {
        const { luxauNFT, owner } = await loadFixture(deployContractFixture);
        expect(await luxauNFT.safeMint({ value: ethers.parseEther("0.01") }))
        await expect(luxauNFT.tokenURI(1)).to.be.revertedWith("Token doesn't exist")
      })
      it('Should NOT revert if token exist', async function () {
        const { luxauNFT, owner } = await loadFixture(deployContractFixture);
        expect(await luxauNFT.safeMint({ value: ethers.parseEther("0.01") }))
        await expect(luxauNFT.tokenURI(0)).to.be.not.revertedWith("Token doesn't exist")
      })
    })

  })

});
