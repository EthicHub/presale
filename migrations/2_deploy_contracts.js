const truffle = require('../truffle.js');
console.log(truffle.current_network);

const deployer_helper = require('./migrations_helper.js').networks[truffle.current_network];

const Presale = artifacts.require("./EthicHubPresale.sol");

module.exports = async function(deployer) {
  let wallet = await deployer_helper.getFundsWallet;
  return deployer.deploy(Presale,
                    deployer_helper.startTime,
                    deployer_helper.endTime,
                    deployer_helper.minimum_cap,
                    deployer_helper.hard_cap,
                    wallet);
}