const TokenVesting = artifacts.require('IntervalTokenVesting.sol')
const BigNumber = web3.BigNumber

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

module.exports = function(deployer,accounts) {
  //Todo deploy for every founder/team
  var startDate = latestTime + duration.weeks(1);
  var periodDuration = duration.years(0.5);
  var periods = new BigNumber(4);
  deployer.deploy(TokenVesting,accounts[1],startDate,periodDuration,periods,true,{ from: deployer });
};
