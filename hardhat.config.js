require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require('dotenv').config()

const ALCHEMY_URL = process.env.ALCHEMY_RPC_URL || "";
const PK = process.env.PK_BASE_SEPOLIA || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

module.exports = {
  solidity: "0.8.24",
  networks: {
    base_sepolia: {
      url: ALCHEMY_URL,
      accounts: [`0x${PK}`],
      chainId: 84532
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN
  },
};
