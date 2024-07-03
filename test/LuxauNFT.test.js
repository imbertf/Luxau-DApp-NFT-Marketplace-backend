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
    const _baseURI = "ifps://CID/";
    const zeroAddress = "0x0000000000000000000000000000000000000000"

    const [owner, otherAccount] = await ethers.getSigners();
    const LuxauNFT = await ethers.getContractFactory('LuxauNFT');
    const luxauNFT = await LuxauNFT.deploy(_name, _symbol, _baseURI);

    return { luxauNFT, owner, otherAccount, zeroAddress };
  }

  describe("DEPLOYMENT", function () {
    it("Should deploy the smart contract", async function () {
      const { luxauNFT, owner } = await loadFixture(deployContractFixture);
      expect(await luxauNFT.owner()).to.equal(owner.address);
      expect(await luxauNFT.name()).to.equal("MyToken");
      expect(await luxauNFT.symbol()).to.equal("MTK");
      expect(await luxauNFT.baseURI()).to.equal("ifps://CID/");
    });
  });

  describe("safeMint", function () {
    describe("checks", function () {
      it('Should NOT mint if not expected minimum price', async function () {
        const { luxauNFT, owner } = await loadFixture(deployContractFixture);
        await expect(luxauNFT.safeMint({ value: ethers.parseEther("0.00001") })).to.be.revertedWith("Minimum price to mint is 0.0001 ETH")
      })
    })
    describe("effects", function () {
      it('Should mint if expected minimum price', async function () {
        const { luxauNFT, owner } = await loadFixture(deployContractFixture);
        await expect(luxauNFT.safeMint({ value: ethers.parseEther("10") })).to.be.not.revertedWith("Minimum price to mint is 0.0001 ETH")
      })
    })

    describe('interactions', function () {
      it('Should emit an event when mint', async function () {
        const { luxauNFT, owner, zeroAddress } = await loadFixture(deployContractFixture);
        await expect(luxauNFT.safeMint({ value: ethers.parseEther("0.0001") })).to.emit(luxauNFT, 'NFTMinted').withArgs(0, zeroAddress, owner.address, "ifps://CID/");
      })
    })
  })

  describe("tokenURI", function () {
    describe("checks", function () {
      it('Should revert if token does not exist', async function () {
        const { luxauNFT, owner } = await loadFixture(deployContractFixture);
        expect(await luxauNFT.safeMint({ value: ethers.parseEther("0.0001") }))
        await expect(luxauNFT.tokenURI(1)).to.be.revertedWithCustomError(luxauNFT, 'ERC721NonexistentToken')
      })
      it('Should NOT revert if token exist', async function () {
        const { luxauNFT, owner } = await loadFixture(deployContractFixture);
        expect(await luxauNFT.safeMint({ value: ethers.parseEther("0.0001") }))
        await expect(luxauNFT.tokenURI(0)).to.be.not.revertedWithCustomError(luxauNFT, 'ERC721NonexistentToken')
      })
    })

  })

});
