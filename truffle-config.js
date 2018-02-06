require('babel-register');
require('babel-polyfill');
var HDWalletProvider = require("truffle-hdwallet-provider");

let mnemonic = "";


module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*'
      //gasLimit: 0x47e7c4
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/<key>")
      },
      network_id: '*',
      gasLimit: 6000000,
      gas: 4700000
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
