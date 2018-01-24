const Presale = artifacts.require('EthicHubPresale.sol');
const TokenDistributionStrategy = artifacts.require('EthicHubTokenDistributionStrategy.sol');
const EthixToken = artifacts.require('EthixToken.sol');

const moment = require('moment');

function latestTime() {
  return web3.eth.getBlock(web3.eth.blockNumber).timestamp;
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


const configurations = {
  rinkeby: {
    start_date: () => { return (latestTime() + duration.minutes(15))},
    end_date: () => { return (latestTime() + duration.days(7) + duration.seconds(2)) },
    goal: ether(1),
    cap: ether(2),
    wallet: "0x4b9eaD77C85890477F3aCE286ddcaf9a342C33B4",

  },
  develop: {
    start_date: () => { return (latestTime() + duration.minutes(15))},
    end_date: () => { return (latestTime() + duration.days(7) + duration.seconds(2)) },
    goal: ether(1),
    cap: ether(2),
    wallet: "0x821aea9a577a9b44299b9c15c88cf3087f3b5544",

  }
}

const TOKEN_SOLD_PERCENTAGE = 20;

module.exports = function(deployer,network, accounts) {
  console.log("--> Retrieving token");
  if (network === "development") {
      network = "develop";
      console.log("TestRPC/Ganache network, not deploying for tests");
      return;
  }
  EthixToken.deployed().then(function(token) {
    
    const config = configurations[network];
    console.log("--> Deploying Token...");
    TokenDistributionStrategy.deployed().then((distribution) => {
      console.log("--> Deploying Presale...");
      deployer.deploy(Presale,
                        config.start_date(),
                        config.end_date(),
                        config.goal,
                        config.cap,
                        config.wallet,
                        distribution.address)
              .then(() => {
        console.log("--> Retrieving tokenSupply");

        token.totalSupply().then((supply) => {
          console.log("--> All tokens: "+supply);
          const presaleSupply = supply.mul(TOKEN_SOLD_PERCENTAGE).div(100);
          console.log("--> Transfering tokens to TokenDistributionStrategy: "+presaleSupply);
          token.transfer(TokenDistributionStrategy.address, presaleSupply).then( () => {
            console.log("--> Initializing intervals...");
            distribution.initIntervals().then(() => {
              distribution.getIntervals().then((intervals) => {
               console.log(intervals);
               console.log("--> Presale configured!")
              });
            });
          });
        });
      });
    });
  });
};


