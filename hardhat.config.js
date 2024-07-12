require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require('dotenv').config()



const {
  ALCHEMY_RPC_URL = "",
  PK_HARDHAT = "",
  PK_BASE_SEPOLIA = "",
  ETHERSCAN = ""
} = process.env

function utf8ToHex(str: string) {
  return Array.from(str).map(c =>
    c.charCodeAt(0) < 128 ? c.charCodeAt(0).toString(16) :
      encodeURIComponent(c).replace(/\%/g, '').toLowerCase()
  ).join('');
}

const HARDHAT = utf8ToHex(PK_HARDHAT ?? '');
const BASE_SEPOLIA = utf8ToHex(PK_BASE_SEPOLIA ?? '');

module.exports = {
  solidity: "0.8.24",
  networks: {
    base_sepolia: {
      url: ALCHEMY_RPC_URL,
      accounts: [PK_BASE_SEPOLIA],
      chainId: 84532
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: [PK_HARDHAT],
      chainId: 31337,
    }
  },
  etherscan: {
    apiKey: ETHERSCAN
  },
};
