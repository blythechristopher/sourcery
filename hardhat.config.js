require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
require('hardhat-gas-reporter');

require('dotenv').config();

const {
  MAINNET_RPC_URL,
  RINKEBY_RPC_URL,
  PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  COINMARKETCAP_API_KEY,
} = process.env;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: '0.8.13',
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000,
      },
    },
  },
  defaultNetwork: 'localhost',
  networks: {
    hardhat: {
      chainId: 1337,
      gas: 8000000,
      gasPrice: 875000000,
    },
    rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: [PRIVATE_KEY],
      timeout: 10000000,
    },
    mainnet: {
      url: MAINNET_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    currency: 'USD',
    coinmarketcap: COINMARKETCAP_API_KEY,
    gasPrice: 50,
  },
  mocha: {
    timeout: 600000,
  },
};
