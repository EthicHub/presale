'use strict';

var Web3 = require('web3');
var web3 = new Web3('http://localhost:8545');



// Rinkeby Lending contract address
var contract_address = "0xd2fd8374e0f541be77af6ad957a350a514f6f718";
const loader = require('./contract_loader.js');

var lending;
async function doStuff() {
  var accounts = await web3.eth.getAccounts();
  var strategy = await loader('EthicHubTokenDistributionStrategy', contract_address, web3);
  // test accounts and invest amounts
  var addresses = [accounts[0], accounts[1]]
  var amounts = [web3.utils.toWei('1', 'ether'), web3.utils.toWei('2', 'ether')]
  console.log(1)
  const tx = await strategy.methods.changeRegistrationStatuses(addresses, amounts).send({from: accounts[0]});
  console.log(tx);

}

doStuff();
