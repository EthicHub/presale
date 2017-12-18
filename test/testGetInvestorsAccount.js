'use strict';
import ether from './helpers/ether'
import {advanceBlock} from './helpers/advanceToBlock'
import {increaseTimeTo, duration} from './helpers/increaseTime'
import latestTime from './helpers/latestTime'
import EVMRevert from './helpers/EVMRevert'

const BigNumber = web3.BigNumber

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const EthicHubTokenDistribution = artifacts.require('EthicHubTokenDistributionStrategy');
const Token = artifacts.require('ERC20')

const EthixToken = artifacts.require('EthixToken')

const EthicHubPresale = artifacts.require('EthicHubPresale');

contract('EstimateCompensationGasUsed', function ([owner ,investor, investor2, investor3, investor4, investor5, investor6, investor7, investor8, wallet]) {

  const RATE = new BigNumber(4000);
  const cap = ether(3000);
  const goal = ether(800);
  const whitelistRate = new BigNumber(5000);
  const moreThanGoal = ether(1000);


  beforeEach(async function () {
    await advanceBlock();

    this.startTime = latestTime() + duration.days(1);
    this.endTime = this.startTime + duration.days(40);
    this.afterEndTime = this.endTime + duration.seconds(1);
    this.vestingTime = this.endTime + duration.days(1);
    this.vestingDuration = duration.days(100);

    const fixedPoolToken = await EthixToken.new();
    const totalSupply = await fixedPoolToken.totalSupply();

    //TODO set correct presale amount of tokens
    const presaleSupply = totalSupply.mul(20).div(100);

    this.tokenDistribution = await EthicHubTokenDistribution.new(fixedPoolToken.address,RATE,whitelistRate);
    this.crowdsale = await EthicHubPresale.new(this.startTime, this.endTime, goal, cap, wallet, this.tokenDistribution.address);

    await fixedPoolToken.transfer(this.tokenDistribution.address, presaleSupply);

    //TODO transfer rest of the tokens to team vestings and ethichub wallet
    this.token = Token.at(await this.tokenDistribution.getToken.call());

  })

  describe('test compensation gas used', function() {

    it('get investors from events', async function(){
        var initBlockNum = web3.eth.blockNumber;
        console.log(web3.eth.blockNumber)
        await this.tokenDistribution.changeRegistrationStatus(investor, ether(200))
        await increaseTimeTo(this.startTime + duration.days(0.5))
        await this.tokenDistribution.configureVesting(this.vestingTime, this.vestingDuration)
        await this.crowdsale.buyTokens(investor, {value: ether(200), from: investor}).should.be.fulfilled;
        await this.crowdsale.buyTokens(investor2, {value: ether(200), from: investor2}).should.be.fulfilled;
        await this.crowdsale.buyTokens(investor3, {value: ether(200), from: investor3}).should.be.fulfilled;
        await this.crowdsale.buyTokens(investor4, {value: ether(200), from: investor4}).should.be.fulfilled;
        await this.crowdsale.buyTokens(investor5, {value: ether(200), from: investor5}).should.be.fulfilled;
        await this.crowdsale.buyTokens(investor6, {value: ether(200), from: investor6}).should.be.fulfilled;
        await this.crowdsale.buyTokens(investor7, {value: ether(200), from: investor7}).should.be.fulfilled;
        await this.crowdsale.buyTokens(investor8, {value: ether(200), from: investor8}).should.be.fulfilled;

        await increaseTimeTo(this.vestingTime + duration.days(0.5));
        await this.crowdsale.finalize().should.be.fulfilled;

        var investors = [investor, investor2, investor3, investor4, investor5, investor6, investor7, investor8]

        var finalBlockNum = console.log(web3.eth.blockNumber)

        let transferEvent = this.crowdsale.TokenPurchase({}, {fromBlock: initBlockNum, toBlock: finalBlockNum})
        var investors = []
        transferEvent.get((error, logs) => {
          logs.forEach(log => investors.push(log.args.beneficiary))
          console.log(investors)
          investors.should.be.deep.equal([investor, investor2, investor3, investor4, investor5, investor6, investor7, investor8])
        })
    })
  });

});
