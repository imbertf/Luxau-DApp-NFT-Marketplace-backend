require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require('dotenv').config()

const ALCHEMY_URL = process.env.ALCHEMY_RPC_URL || "";
const PK = process.env.PK_BASE_SEPOLIA || "";

module.exports = {
  solidity: "0.8.24",
  networks: {
    base_sepolia: {
      url: ALCHEMY_URL,
      accounts: [PK],
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
