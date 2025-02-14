require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Load private key from env file
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    bttTestnet: {
      url: "https://pre-rpc.bt.io/",
      chainId: 1029,
      accounts: [PRIVATE_KEY],
      gas: 3000000,
      gasPrice: 300000000000
    }
  },
  etherscan: {
    apiKey: {
      bttTestnet: process.env.BTTCSCAN_API_KEY || ""
    }
  }
};
