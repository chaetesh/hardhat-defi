require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
require("solidity-coverage");
require("hardhat-deploy");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // solidity: "0.8.19",
  solidity: {
    compilers: [
      { version: "0.8.7" },
      { version: "0.6.6" },
      { version: "0.6.0" },
      { version: "0.6.12" },
      { version: "0.4.19" },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/gSk_DBdgrUsM-K85SVnLTJ_lnWHHPI15",
      },
    },
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/lFlEqs4A-_jmelDXJeTXPhDK15PBnFL9",
      accounts: [
        "0x36e81a7c346508f7f67acff5338dec1c50b7d3953e0832e61f5f9b2b354d412c",
      ],
      blockConfirmations: 6,
      chainId: 5,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      // accounts hardhat will place by default when running hardhat on localhost
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
  },
  etherscan: {
    apiKey: "Y1KDYSC31H5GJGDGRMUTEP1BT4FF1NDHGX",
  },
};
