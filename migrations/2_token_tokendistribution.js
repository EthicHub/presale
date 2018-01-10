const Presale = artifacts.require('EthicHubPresale.sol');
const TokenDistributionStrategy = artifacts.require('EthicHubTokenDistributionStrategy.sol');
const EthixToken = artifacts.require('EthixToken.sol');

const RATE = new web3.BigNumber(6666);
const WHITELIST_RATE = RATE.mul(20).div(100).add(RATE);


module.exports = function(deployer,network, accounts) {
  console.log(network);
  if (network === "development") {
      network = "develop";
      console.log("TestRPC/Ganache network, not deploying for tests");
      return;
  }
  deployer.deploy(EthixToken).then(function() {

    console.log("--> EthixToken deployed");

    return deployer.deploy(TokenDistributionStrategy, 
                            EthixToken.address,
                            RATE,
                            WHITELIST_RATE);

    });
  };

