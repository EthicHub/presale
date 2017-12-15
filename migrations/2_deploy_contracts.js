const EthicHubPresale = artifacts.require('EthicHubPresale.sol')
const EthicHubTokenDistributionStrategy = artifacts.require('EthicHubTokenDistributionStrategy.sol')
const EthixToken = artifacts.require('EthixToken.sol')

module.exports = function(deployer, accounts) {
  var startDate = + new Date();
  var endDate = startDate + 1000;
  deployer.deploy(EthixToken);
  console.log("EthixToken deployed");
  deployer.deploy(EthicHubTokenDistributionStrategy, EthixToken.address, 4, 5);
  console.log("EthicHubTokenDistributionStrategy deployed");
  deployer.deploy(EthicHubPresale, startDate, endDate, 10, 90, '0x11281370f11da845c4F88241027505fFA4B5079c', EthicHubTokenDistributionStrategy.address);
  console.log("EthicHubPresale deployed");
};
