# Luxau NFT Marketplace - Backend

## Description

Decentralized marketplace specializing in luxury NFT transactions, each representing a physical item. Once purchased, the seller directly ships the product to the buyer.

## Technologies Used

- **Solidity**
- **Node.js**
- **Yarn**
- **Hardhat**
- **OpenZeppelin**
- **Chai**
- **Ethers**

## Prerequisites

```bash
yarn add --dev hardhat
npx hardhat init
```

## Installation

1. Clone the repository.
2. Run yarn install to install the dependencies.

## Usage

Launch the blockchain with the command:

```bash
yarn hardhat node
```

Deploy the contracts:

```bash
yarn hardhat ignition deploy ./ignition/modules/LuxauMarketplace.js --network localhost
yarn hardhat ignition deploy ./ignition/modules/LuxauNFT.js --network localhost
```

## Tests

Run the tests with:

```bash
yarn hardhat test
```

For coverage:

```bash
yarn hardhat coverage
```

## Licence

MIT License.

## Contact

Email : f.imbert4@gmail.com

## Authors

Imbertf
