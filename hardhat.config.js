require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require('dotenv').config()



const {
  ALCHEMY_RPC_URL = "",
  PK_HARDHAT = "",
  PK_BASE_SEPOLIA = "",
  ETHERSCAN = ""
} = process.env

module.exports = {
  solidity: "0.8.24",
  networks: {
    base_sepolia: {
      url: ALCHEMY_RPC_URL,
      accounts: [`0x${PK_BASE_SEPOLIA}`],
      chainId: 84532
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: [`0x${PK_HARDHAT}`],
      chainId: 31337,
    }
  },
  etherscan: {
    apiKey: ETHERSCAN
  },
};
