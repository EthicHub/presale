require('babel-register');
require('babel-polyfill');


module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*'
      //gasLimit: 0x47e7c4
    },
    rinkeby: {
      host: 'localhost',
      port: 8545,
      from: "0x9a3cee1fc3ffeebbc7be95d57da652654647e519", // default address to use for any transaction Truffle makes during migrations
      network_id: 4,
      gas: 4612388 // Gas limit used for deploys
    },
    coverage: {
      host: 'localhost',
      network_id: "*",
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x01
    },
    ganache: {
      host: "localhost",
      port: 7545,
      network_id: "5777"
    }
  }
};
