const truffle = require('../truffle.js');
const network = truffle.networks[truffle.current_network];

var Web3 = require('web3');
//TODO include other networks'providers
var web3 = new Web3(new Web3.providers.HttpProvider(`http://${network.host}:${network.port}`));

var getAccount = (index) => { return web3.eth.accounts[index] };


module.exports = {
  networks: {
    development: {
      startTime: 1531414800,
      endTime: 1534093200,
      minimum_cap: 1000,
      soft_cap: 9000,
      hard_cap: 12000,
      getOwnerAddress: getAccount(0),
      getFundsWallet: getAccount(1)
    }
  },

};
