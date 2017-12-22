const EthicHubPresale = artifacts.require('EthicHubPresale.sol')
const EthicHubTokenDistributionStrategy = artifacts.require('EthicHubTokenDistributionStrategy.sol')
const EthixToken = artifacts.require('EthixToken.sol')

module.exports = function(deployer, accounts) {
  var startDate = new Date();
  var endDate = startDate + 1000;
  deployer.deploy(EthixToken).then(function() {
    console.log("EthixToken deployed");
    return deployer.deploy(EthicHubTokenDistributionStrategy, 
    						EthixToken.address,
    						4,
    						5).then(function() {
  		console.log("EthicHubTokenDistributionStrategy deployed");
  		deployer.deploy(EthicHubPresale,
  						startDate,
  						endDate,
  						10,
  						90,
  						accounts[1],
  						EthicHubTokenDistributionStrategy.address).then(function() {
  							console.log("EthicHubPresale deployed");
  						});
    });
  });
};
