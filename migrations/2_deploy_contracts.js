const Presale = artifacts.require("./EthicHubPresale.sol");

const deployer_helper = require('./migrations_helper.js');


module.exports = function(deployer) {
  deployer.deploy(Presale,1531414800,1534093200,);

};
