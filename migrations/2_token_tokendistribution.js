const Presale = artifacts.require('EthicHubPresale.sol');
const TokenDistributionStrategy = artifacts.require('EthicHubTokenDistributionStrategy.sol');
const EthixToken = artifacts.require('EthixToken.sol');

const moment = require('moment');

function latestTime() {
  return web3.eth.getBlock('latest').timestamp;
}
const duration = {
  seconds: function (val) { return val },
  minutes: function (val) { return val * this.seconds(60) },
  hours: function (val) { return val * this.minutes(60) },
  days: function (val) { return val * this.hours(24) },
  weeks: function (val) { return val * this.days(7) },
  years: function (val) { return val * this.days(365) }
};

function ether(n) {
  return new web3.BigNumber(web3.toWei(n, 'ether'))
}

function now() {
  return Math.round((new Date()).getTime() / 1000);
}

const RATE = new web3.BigNumber(6666);
const WHITELIST_RATE = RATE.mul(20).div(100).add(RATE);
const configurations = {
  rinkeby: {
    start_date: (+ new Date() + duration.minutes(15)),
    end_date: (+ new Date() + duration.minutes(15)),
    token_eth_rate: RATE,
    whitelisted_token_eth_rate: WHITELIST_RATE,
    goal: ether(1),
    cap: ether(2),
    wallet: "0x4b9eaD77C85890477F3aCE286ddcaf9a342C33B4",
    token_sold_percentage: 20,
  },
  develop: {
    start_date: new web3.BigNumber(1514340337),
    end_date: new web3.BigNumber(1514372737),
    token_eth_rate: RATE,
    whitelisted_token_eth_rate: WHITELIST_RATE,
    goal: ether(1),
    cap: ether(2),
    wallet: "0x821aea9a577a9b44299b9c15c88cf3087f3b5544",
    token_sold_percentage: 20,
  }
}



module.exports = function(deployer,network, accounts) {

  deployer.deploy(EthixToken).then(function() {
    const config = configurations[network];
    console.log("--> EthixToken deployed");
    console.log(latestTime());

    return deployer.deploy(TokenDistributionStrategy, 
                            EthixToken.address,
                            config.token_eth_rate,
                            config.whitelisted_token_eth_rate);

    });
  };

