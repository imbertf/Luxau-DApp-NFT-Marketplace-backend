const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require('hardhat');

describe("LuxauMarketplace", function () {
  async function deployContractsFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const LuxauMarketplace = await ethers.getContractFactory('LuxauMarketplace');
    const luxauMarketplace = await LuxauMarketplace.deploy();

    const LuxauNFT = await ethers.getContractFactory('LuxauNFT');
    const luxauNFT = await LuxauNFT.deploy();

    // Mint an NFT
    await luxauNFT.safeMint({ value: ethers.parseEther("10") });
    return { luxauMarketplace, luxauNFT, owner, otherAccount };
  }

  describe("createNFT", function () {
    describe("checks", function () {
      it("Should revert if not a brand", async function () {
        const { luxauMarketplace, luxauNFT, otherAccount } = await loadFixture(deployContractsFixture);

        const NFT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        const TOKEN_ID = 0;
        const PRICE = ethers.parseEther("1");
        const DESCRIPTION = "Test NFT";

        // Try to create NFT
        await expect(
          luxauMarketplace.connect(otherAccount).createNFT(NFT_ADDRESS, TOKEN_ID, PRICE, DESCRIPTION, { value: PRICE })
        ).to.be.revertedWith("You have to be a registered Brand");
      });

      it("Should revert if not enough ETH sent", async function () {
        const { luxauMarketplace, luxauNFT, owner } = await loadFixture(deployContractsFixture);

        const NFT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        const TOKEN_ID = 0;
        const PRICE = ethers.parseEther("1");
        const DESCRIPTION = "Test NFT";

        // Try to create NFT
        await expect(
          luxauMarketplace.createNFT(NFT_ADDRESS, TOKEN_ID, PRICE, DESCRIPTION, { value: ethers.parseEther("0") })
        ).to.be.revertedWith("Minimal price is 1 ETH to create NFT");
      });
    })

    describe("effects", function () {
      it("Should create an NFT", async function () {
        const { luxauMarketplace, luxauNFT, owner } = await loadFixture(deployContractsFixture);

        const NFT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        const TOKEN_ID = 0;
        const PRICE = ethers.parseEther("1");
        const DESCRIPTION = "Test NFT";

        luxauNFT.safeMint({ value: ethers.parseEther("10") });

        await luxauMarketplace.createNFT(NFT_ADDRESS, TOKEN_ID, PRICE, DESCRIPTION, { value: PRICE })

        // Check if the NFT details are stored correctly
        const nftDetails = await luxauMarketplace.brandNFTs(owner.address, TOKEN_ID);

        expect(nftDetails.NFTAddress).to.equal(NFT_ADDRESS);
        expect(nftDetails.seller).to.equal(owner.address);
        expect(nftDetails.id).to.equal(0);
        expect(nftDetails.price).to.equal(PRICE);
        expect(nftDetails.description).to.equal(DESCRIPTION);
        expect(nftDetails.isSold).to.be.false;
      });
    })

    describe("interactions", function () {
      it("Should emit event when create NFT", async function () {
        const { luxauMarketplace, luxauNFT, owner } = await loadFixture(deployContractsFixture);

        const NFT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        const TOKEN_ID = 0;
        const PRICE = ethers.parseEther("1");
        const DESCRIPTION = "Test NFT";

        luxauNFT.safeMint({ value: ethers.parseEther("10") });

        await expect(
          luxauMarketplace.createNFT(NFT_ADDRESS, TOKEN_ID, PRICE, DESCRIPTION, { value: PRICE })
        )
          .to.emit(luxauMarketplace, "NFTCreated")
          .withArgs(owner.address, TOKEN_ID, PRICE, DESCRIPTION);
      })
    })
  });

  describe("buyNFT", function () {
    describe("checks", function () {
      it("Should revert if not a client", async function () {
        const { luxauMarketplace, luxauNFT, otherAccount } = await loadFixture(deployContractsFixture);

        const NFT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        const TOKEN_ID = 0;
        const PRICE = ethers.parseEther("200");
        const DESCRIPTION = "Test NFT";

        // create NFT
        const NFT = await luxauMarketplace.createNFT(NFT_ADDRESS, TOKEN_ID, PRICE, DESCRIPTION, { value: PRICE })

        // try to buy NFT
        await expect(luxauMarketplace.buyNFT(otherAccount.address, TOKEN_ID, { value: PRICE })).to.be.revertedWith("You have to be a registered Client")
      });

      it("Should revert if wrong price", async function () {
        const { luxauMarketplace, luxauNFT, otherAccount, owner } = await loadFixture(deployContractsFixture);

        const NFT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        const TOKEN_ID = 0;
        const PRICE = ethers.parseEther("200");
        const DESCRIPTION = "Test NFT";

        // create NFT
        const NFT = await luxauMarketplace.createNFT(NFT_ADDRESS, TOKEN_ID, PRICE, DESCRIPTION, { value: PRICE })

        // register client
        await luxauMarketplace.registerClient(otherAccount.address)

        // try to buy NFT with not enough funds
        await expect(luxauMarketplace.connect(otherAccount).buyNFT(owner.address, TOKEN_ID, { value: ethers.parseEther("0") })).to.be.revertedWith("Insufficient funds to buy NFT")
      });

      it('Should revert if NFT doesn\'t exist', async function () {
        const { luxauMarketplace, luxauNFT, otherAccount, owner } = await loadFixture(deployContractsFixture);

        const NFT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        const TOKEN_ID = 0;
        const PRICE = ethers.parseEther("200");
        const DESCRIPTION = "Test NFT";

        // create NFT
        const NFT = await luxauMarketplace.createNFT(NFT_ADDRESS, TOKEN_ID, PRICE, DESCRIPTION, { value: PRICE })

        // register client
        await luxauMarketplace.registerClient(otherAccount.address)

        // client buy NFT
        expect(await luxauMarketplace.connect(otherAccount).buyNFT(owner.address, TOKEN_ID, { value: PRICE }))

        // check if NFT is in client wallet
        const clientNFT = await luxauMarketplace.clientNFTs(otherAccount, TOKEN_ID);
        expect(clientNFT.NFTAddress).to.equal(NFT_ADDRESS);
        expect(clientNFT.seller).to.equal(owner.address);
        expect(clientNFT.id).to.equal(0);
        expect(clientNFT.price).to.equal(PRICE);
        expect(clientNFT.description).to.equal(DESCRIPTION);
        // check if NFT is sold
        expect(clientNFT.isSold).to.be.true;

        // client buy NFT already sold
        await expect(luxauMarketplace.connect(otherAccount).buyNFT(owner.address, TOKEN_ID, { value: PRICE })).to.be.revertedWith("NFT doesn't exist")
      })
    })

    describe("effects", function () {
      it("Should buy a NFT", async function () {
        const { luxauMarketplace, luxauNFT, otherAccount, owner } = await loadFixture(deployContractsFixture);

        const NFT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        const TOKEN_ID = 0;
        const PRICE = ethers.parseEther("200");
        const DESCRIPTION = "Test NFT";

        // create NFT
        const NFT = await luxauMarketplace.createNFT(NFT_ADDRESS, TOKEN_ID, PRICE, DESCRIPTION, { value: PRICE })

        // register client
        await luxauMarketplace.registerClient(otherAccount.address)

        // client buy NFT
        expect(await luxauMarketplace.connect(otherAccount).buyNFT(owner.address, TOKEN_ID, { value: PRICE }))

        // check if NFT is in client wallet
        const clientNFT = await luxauMarketplace.clientNFTs(otherAccount, TOKEN_ID);
        expect(clientNFT.NFTAddress).to.equal(NFT_ADDRESS);
        expect(clientNFT.seller).to.equal(owner.address);
        expect(clientNFT.id).to.equal(0);
        expect(clientNFT.price).to.equal(PRICE);
        expect(clientNFT.description).to.equal(DESCRIPTION);
        // check if NFT is sold
        expect(clientNFT.isSold).to.be.true;
      });
    })

    describe("interactions", function () {
      it("Should emit event when buy NFT", async function () {
        const { luxauMarketplace, luxauNFT, otherAccount, owner } = await loadFixture(deployContractsFixture);

        const NFT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        const TOKEN_ID = 0;
        const PRICE = ethers.parseEther("200");
        const DESCRIPTION = "Test NFT";

        // create NFT
        const NFT = await luxauMarketplace.createNFT(NFT_ADDRESS, TOKEN_ID, PRICE, DESCRIPTION, { value: PRICE })

        // register client
        await luxauMarketplace.registerClient(otherAccount.address)

        // client buy NFT
        expect(await luxauMarketplace.connect(otherAccount).buyNFT(owner.address, TOKEN_ID, { value: PRICE })).to.emit(luxauMarketplace, "NFTSold")
          .withArgs(owner.address, otherAccount.address, TOKEN_ID, PRICE);
      })
    })
  });

  describe("registerBrand", function () {
    describe("checks", function () {
      it('Should revert if NOT owner', async function () {
        const { luxauMarketplace, owner, otherAccount } = await loadFixture(deployContractsFixture);
        await expect(luxauMarketplace.connect(otherAccount).registerBrand(otherAccount.address, "brandName")).to.be.revertedWithCustomError(luxauMarketplace, "OwnableUnauthorizedAccount");
      })
    })

    describe("effects", function () {
      it('Should register brand', async function () {
        const { luxauMarketplace, owner, otherAccount } = await loadFixture(deployContractsFixture);

        await expect(luxauMarketplace.registerBrand(otherAccount.address, "brandName")).to.be.not.revertedWithCustomError(luxauMarketplace, "OwnableUnauthorizedAccount");

        const registeredBrand = await luxauMarketplace.registeredBrands(otherAccount)

        expect(registeredBrand.brandAddress).to.equal(otherAccount.address);
        expect(registeredBrand.brandName).to.equal("brandName");
        expect(registeredBrand.isRegistered).to.equal(true);
      })
    });

    describe("interactions", function () {
      it("Should emit event when brand registered", async function () {
        const { luxauMarketplace, owner, otherAccount } = await loadFixture(deployContractsFixture);

        await expect(luxauMarketplace.registerBrand(otherAccount.address, "brandName")).to.emit(luxauMarketplace, "BrandRegistered").withArgs(otherAccount.address);
      })
    })
  });

  describe("registerClient", function () {
    describe("checks", function () {
      it('Should revert if NOT owner', async function () {
        const { luxauMarketplace, owner, otherAccount } = await loadFixture(deployContractsFixture);
        await expect(luxauMarketplace.connect(otherAccount).registerClient(otherAccount.address)).to.be.revertedWithCustomError(luxauMarketplace, "OwnableUnauthorizedAccount");
      })
    })

    describe("effects", function () {
      it('Should register client', async function () {
        const { luxauMarketplace, owner, otherAccount } = await loadFixture(deployContractsFixture);

        await expect(luxauMarketplace.registerClient(otherAccount.address)).to.be.not.revertedWithCustomError(luxauMarketplace, "OwnableUnauthorizedAccount");

        const registeredClient = await luxauMarketplace.registeredClients(otherAccount)

        expect(registeredClient.clientAddress).to.equal(otherAccount.address);
        expect(registeredClient.isRegistered).to.equal(true);
      })
    });

    describe("interactions", function () {
      it("Should emit event when client registered", async function () {
        const { luxauMarketplace, owner, otherAccount } = await loadFixture(deployContractsFixture);

        await expect(luxauMarketplace.registerClient(otherAccount.address)).to.emit(luxauMarketplace, "ClientRegistered").withArgs(otherAccount.address);
      })
    })
  });

  describe("contractBalance", function () {
    describe("checks", function () {
      it('Should revert if NOT owner', async function () {
        const { luxauMarketplace, otherAccount } = await loadFixture(deployContractsFixture);
        await expect(luxauMarketplace.connect(otherAccount).contractBalance()).to.be.revertedWithCustomError(luxauMarketplace, "OwnableUnauthorizedAccount");
      })
      it('Should NOT revert if owner', async function () {
        const { luxauMarketplace, owner } = await loadFixture(deployContractsFixture);
        await expect(luxauMarketplace.contractBalance()).to.be.not.revertedWithCustomError(luxauMarketplace, "OwnableUnauthorizedAccount");
      })
    })
    describe("effects", function () {
      it("Should return the correct contract balance", async function () {
        const { luxauMarketplace, owner } = await loadFixture(deployContractsFixture);
        const currentBalance = await luxauMarketplace.contractBalance();
        await expect(ethers.formatEther(currentBalance)).to.equal("0.0");
      });
    })
  })

  describe("withdraw", function () {
    describe("checks", function () {
      it('Should revert if NOT owner', async function () {
        const { luxauMarketplace, otherAccount } = await loadFixture(deployContractsFixture);
        await expect(luxauMarketplace.connect(otherAccount).withdraw()).to.be.revertedWithCustomError(luxauMarketplace, "OwnableUnauthorizedAccount");
      })
      it('Should NOT revert if owner', async function () {
        const { luxauMarketplace, owner } = await loadFixture(deployContractsFixture);
        await expect(luxauMarketplace.withdraw()).to.be.not.revertedWithCustomError(luxauMarketplace, "OwnableUnauthorizedAccount");
      })
    })

    describe("effects", function () {
      it('Should withdraw contract balance', async function () {
        const { luxauMarketplace, luxauNFT, owner } = await loadFixture(deployContractsFixture);

        const NFT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
        const TOKEN_ID = 0;
        const PRICE = ethers.parseEther("10.0");
        const DESCRIPTION = "Test NFT";

        // functions to add ether in contract balance
        luxauNFT.safeMint({ value: ethers.parseEther("10.0") });
        await luxauMarketplace.createNFT(NFT_ADDRESS, TOKEN_ID, PRICE, DESCRIPTION, { value: PRICE })
        const currentBalance = await luxauMarketplace.contractBalance();
        expect(await ethers.formatEther(currentBalance)).to.equal("10.0");
        await luxauMarketplace.withdraw();
        const newBalance = await luxauMarketplace.contractBalance();
        await expect(ethers.formatEther(newBalance)).to.equal("0.0");
      })
    })
  })
})