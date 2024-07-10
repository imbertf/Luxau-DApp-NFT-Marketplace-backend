require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require('dotenv').config()

const INFURA_RPC_URL = process.env.INFURA_RPC_URL || "";
const PK = process.env.PK || "";
const ETHERSCAN = process.env.ETHERSCAN || "";

module.exports = {
  solidity: "0.8.24",
  networks: {
    base_sepolia: {
      url: 'https://sepolia.base.org',
      accounts: [`0x${PK}`],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    }
  },
  etherscan: {
    apiKey: ETHERSCAN
  },
};
