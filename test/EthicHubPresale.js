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

const SimpleToken = artifacts.require('SimpleToken')

const EthicHubPresale = artifacts.require('EthicHubPresale');

contract('EthicHubPresale', function ([owner, _, investor, wallet]) {

  const RATE = new BigNumber(4000);
  const cap = ether(3000)
  const goal = ether(800)
  const numIntervals = 3;
  const percentageDiscount = 10;

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  })


  beforeEach(async function () {
    this.startTime = latestTime();
    this.endTime = this.startTime + duration.days(7);

    const fixedPoolToken = await SimpleToken.new();
    const totalSupply = await fixedPoolToken.totalSupply();
    this.tokenDistribution = await EthicHubTokenDistribution.new(fixedPoolToken.address,RATE);

    this.crowdsale = await EthicHubPresale.new(this.startTime, this.endTime, goal, cap, wallet, this.tokenDistribution.address);
    await fixedPoolToken.transfer(this.tokenDistribution.address, totalSupply);
    this.token = Token.at(await this.tokenDistribution.getToken.call());

  })

  describe('Initialization', function() {

    beforeEach(async function () {
      await increaseTimeTo(this.startTime);
      await this.tokenDistribution.initIntervals();
      console.log(await this.tokenDistribution.getIntervals());
      //this.afterEndTime = this.endTime + duration.seconds(1);
      //for (var i = 0; i <= numIntervals; i++) {
      //  this.tokenDistribution.addInterval(this.startTime + duration.weeks(2*i+1), (numIntervals-i)*percentageDiscount);
      //}
    })

    it('should fulfilled initiate with intervals token distribution', async function () {
      await this.tokenDistribution.initIntervals().should.be.fulfilled;
    })

    it("should create the owner", async function() {
      (await this.crowdsale.owner()).should.be.equal(owner);
    })

    it("should set a cap when created", async function() {
      (await this.crowdsale.cap()).should.be.bignumber.equal(cap);
    });

    it("should set a goal when created", async function() {
      (await this.crowdsale.goal()).should.be.bignumber.equal(goal);
    });
  });

  describe('proving the intervals of the distribution', function () {

    beforeEach(async function () {
      await increaseTimeTo(this.startTime);
      console.log('Pasa');
      //this.afterEndTime = this.endTime + duration.seconds(1);
      //for (var i = 0; i <= numIntervals; i++) {
      //  this.tokenDistribution.addInterval(this.startTime + duration.weeks(2*i+1), (numIntervals-i)*percentageDiscount);
      //}
      await this.tokenDistribution.initIntervals();
      console.log(await this.tokenDistribution.getIntervals());

    })

    it('should calculate tokens', async function () {
      var tokens = 0
      for (var i = 0; i <= numIntervals; i++) {
        await increaseTimeTo(this.startTime + duration.weeks(2*i))
        const investmentAmount = ether(0.000000000000000001);
        console.log("*** Amount: " + investmentAmount);
        tokens = await this.tokenDistribution.calculateTokenAmount(investmentAmount).should.be.fulfilled;
        console.log("*** COMPOSITION Tokens: " + tokens);
        let tx = await this.crowdsale.buyTokens(investor, {value: investmentAmount, from: investor}).should.be.fulfilled;
        console.log("*** COMPOSITION FIXED POOL: " + tx.receipt.gasUsed + " gas used.");

      }
      await increaseTimeTo(this.afterEndTime);
      await this.tokenDistribution.compensate(investor, tokens).should.be.fulfilled;
      (await this.token.balanceOf(investor)).should.be.bignumber.equal(tokens);

    })

  });

});
