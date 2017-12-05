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

contract('EthicHubPresale', function ([owner, investor, investor2, investor3, wallet]) {

  const RATE = new BigNumber(4000);
  const cap = ether(3000);
  const goal = ether(800);
  const whitelistRate = new BigNumber(5000);
  const moreThanGoal = ether(1000);

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  })


  beforeEach(async function () {
    this.startTime = latestTime() + duration.days(1);
    this.endTime = this.startTime + duration.days(40);
    this.afterEndTime = this.endTime + duration.seconds(1);
    this.vestingTime = this.endTime + duration.days(100);
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

  describe('Initialization', function() {

    it('should fulfilled initiate with intervals token distribution', async function () {
      await this.tokenDistribution.initIntervals().should.be.fulfilled;
    })
    it('should fulfilled initiate with intervals token distribution', async function () {
      await this.tokenDistribution.initIntervals().should.be.fulfilled;
      await this.tokenDistribution.initIntervals().should.be.rejectedWith(EVMRevert);
    })

    it('should fail to set intervals if not owner', async function () {
      await this.tokenDistribution.initIntervals({from:investor3}).should.be.rejectedWith(EVMRevert);

    })

    it("should create the owner", async function() {
      (await this.tokenDistribution.owner()).should.be.equal(owner);
    })

    it("should transfer ownership", async function() {
      console.log("tokenDistribution");
      this.tokenDistribution.transferOwnership(investor2);
      (await this.tokenDistribution.owner()).should.be.equal(investor2);
      console.log("crowdsale");
      console.log(investor2);
      this.crowdsale.transferOwnership(investor2);
      (await this.crowdsale.owner()).should.be.equal(investor2);

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
      await this.tokenDistribution.initIntervals();
    })

    it('should calculate tokens', async function () {
      var [endPeriods, discounts] = await this.tokenDistribution.getIntervals();
      var tokens = new BigNumber(0);
      const investmentAmount = ether(0.000000000000000001);
      console.log(`*** Amount:  ${investmentAmount}`);
      for (var i = 0; i <= endPeriods.length; i++) {

        await increaseTimeTo(this.startTime + duration.days(i + 0.5))
        const newTokens = await this.tokenDistribution.calculateTokenAmount(investmentAmount);
        console.log(`*** Tokens bought:  ${newTokens}`);
        tokens = tokens.add(newTokens);
        let tx = await this.crowdsale.buyTokens(investor, {value: investmentAmount, from: investor}).should.be.fulfilled;
        console.log(`*** Gas used: ${tx.receipt.gasUsed}`);
      }

      await this.tokenDistribution.configureVesting(this.vestingTime,duration.seconds(1));
      await increaseTimeTo(this.vestingTime + duration.days(30));
      console.log(await this.tokenDistribution.vestedAmount(investor));
      await this.tokenDistribution.compensate(investor).should.be.fulfilled;

      (await this.token.balanceOf(investor)).should.be.bignumber.equal(tokens);

    })

  });

  describe('Vesting periods', function () {
    it('should set correct vesting periods ', async function() {
      var vestingStart = this.endTime + + duration.days(1);
      var vestingDuration = 1;

      const tx = await this.tokenDistribution.configureVesting(vestingStart, vestingDuration);
      const expectedStart = new BigNumber(vestingStart);
      const resultStart = await this.tokenDistribution.vestingStart();
      resultStart.should.be.bignumber.equal(expectedStart);
      const expectedDuration = new BigNumber(vestingDuration);
      const resultDuration = await this.tokenDistribution.vestingDuration();

      resultDuration.should.be.bignumber.equal(expectedDuration);
    });

  });

  describe('Whitelists', function() {
    it('should calculate correct tokens for whitelists investor', async function(){

        await this.tokenDistribution.initIntervals();
        await this.tokenDistribution.changeRegistrationStatus(investor, ether(5));

        var vestingStart = this.endTime + duration.days(1);
        var vestingDuration = 1;
        const tx = await this.tokenDistribution.configureVesting(vestingStart, vestingDuration);
        await increaseTimeTo(this.startTime + duration.days(0.5))

        let tokens = await this.tokenDistribution.calculateTokenAmount(ether(5), {from: investor}).should.be.fulfilled;
        await this.crowdsale.buyTokens(investor, {value: ether(5), from: investor}).should.be.fulfilled;
        whitelistRate.mul(ether(5)).should.be.bignumber.equal(tokens);

        await this.crowdsale.buyTokens(investor2, {value: goal, from: investor2}).should.be.fulfilled;

        await increaseTimeTo(this.endTime + duration.days(4))
        await this.crowdsale.finalize().should.be.fulfilled;

        await this.tokenDistribution.compensate(investor).should.be.fulfilled;
        let newBalance = await this.token.balanceOf(investor);
        newBalance.should.be.bignumber.equal(tokens);
    });

    it('whitelists investor does not reach his compromised amount', async function(){

        var vestingStart = this.endTime + duration.days(1);
        var vestingDuration = 1;
        await this.tokenDistribution.initIntervals();
        const tx = await this.tokenDistribution.configureVesting(vestingStart, vestingDuration);
        await this.tokenDistribution.changeRegistrationStatus(investor, ether(5))
        await increaseTimeTo(this.startTime + duration.days(0.5))
        await this.crowdsale.buyTokens(investor, {value: ether(4), from: investor}).should.be.fulfilled;
        let tokens = await this.tokenDistribution.calculateTokenAmount(ether(4), {from: investor}).should.be.fulfilled;
        RATE.mul(ether(4).mul(1.1)).should.be.bignumber.equal(tokens);

        await this.crowdsale.buyTokens(investor2, {value: goal, from: investor2}).should.be.fulfilled;
        await increaseTimeTo(this.endTime + duration.days(4))

        await this.crowdsale.finalize().should.be.fulfilled;

        await this.tokenDistribution.compensate(investor).should.be.fulfilled;

        let newBalance = await this.token.balanceOf(investor);
        newBalance.should.be.bignumber.equal(tokens);
    });

  });


  describe('Crowdsale', function() {
    beforeEach(async function () {
      await this.tokenDistribution.initIntervals();
      await this.tokenDistribution.configureVesting(this.vestingTime, this.vestingDuration);
      //await this.tokenDistribution.changeRegistrationStatus(investor, ether(5));
    });
    it('should refund investors if goal is not reached in time');

    it('should have a succesfull crowdsale not reaching cap and compensating vested tokens', async function(){

      await increaseTimeTo(this.startTime + duration.days(1));
      let amount = await this.tokenDistribution.calculateTokenAmount(moreThanGoal, {from: investor}).should.be.fulfilled;
      console.log("Token:" + amount);
      await this.crowdsale.buyTokens(investor, {value: moreThanGoal, from: investor}).should.be.fulfilled;
      //await this.crowdsale.send(moreThanGoal);
      await increaseTimeTo(this.endTime + duration.days(1));
      await this.crowdsale.finalize().should.be.fulfilled;

      // Vested 1 day
      await increaseTimeTo(this.vestingTime + duration.days(1));
      console.log("Token/100:" + amount.div(100));
      console.log("Vested token day 1:" + await this.tokenDistribution.vestedAmount(investor));
      var tx = await this.tokenDistribution.compensate(investor).should.be.fulfilled;
      var releaseTime = web3.eth.getBlock(tx.receipt.blockNumber).timestamp;
      var balance = await this.token.balanceOf(investor);
      console.log("Balance:" + balance);
      var expectedVesting = amount.mul(releaseTime - this.vestingTime).div(this.vestingDuration).floor();
      console.log("Expected Vesting:" + expectedVesting);
      balance.should.bignumber.equal(expectedVesting);

      // Vested middle duration
      await increaseTimeTo(this.vestingTime + duration.days(50));
      console.log("Token/2:" + amount.div(2));
      console.log("Vested token middle:" + await this.tokenDistribution.vestedAmount(investor));
      tx = await this.tokenDistribution.compensate(investor).should.be.fulfilled;
      releaseTime = web3.eth.getBlock(tx.receipt.blockNumber).timestamp;
      balance = await this.token.balanceOf(investor);
      console.log("Balance:" + balance);
      expectedVesting = amount.mul(releaseTime - this.vestingTime).div(this.vestingDuration).floor();
      console.log("Expected Vesting:" + expectedVesting);
      balance.should.bignumber.equal(expectedVesting);

      // Vested end duration
      await increaseTimeTo(this.vestingTime + duration.days(100));
      console.log("Token total amount:" + amount);
      console.log("Vested token end:" + await this.tokenDistribution.vestedAmount(investor));
      tx = await this.tokenDistribution.compensate(investor).should.be.fulfilled;
      releaseTime = web3.eth.getBlock(tx.receipt.blockNumber).timestamp;
      balance = await this.token.balanceOf(investor);
      console.log("Balance:" + balance);
      expectedVesting = amount.mul(releaseTime - this.vestingTime).div(this.vestingDuration).floor();
      console.log("Expected Vesting:" + expectedVesting);
      balance.should.bignumber.equal(expectedVesting);

    });

    it('should have a succesfull crowdsale reaching cap, rejecting further buys and compensating vested tokens', async function(){

      await increaseTimeTo(this.startTime + duration.days(1));
      let amount = await this.tokenDistribution.calculateTokenAmount(cap, {from: investor}).should.be.fulfilled;
      console.log("Tokens:" + amount);
      await this.crowdsale.buyTokens(investor, {value: cap, from: investor}).should.be.fulfilled;
      await this.crowdsale.buyTokens(investor, {value: ether(1), from: investor}).should.be.rejectedWith(EVMRevert);
      await increaseTimeTo(this.endTime + duration.days(1));
      await this.crowdsale.finalize().should.be.fulfilled;

      await increaseTimeTo(this.vestingTime + this.vestingDuration);
      console.log("Vested Amount end:" + await this.tokenDistribution.vestedAmount(investor));
      let tx = await this.tokenDistribution.compensate(investor).should.be.fulfilled;
      let releaseTime = web3.eth.getBlock(tx.receipt.blockNumber).timestamp;
      let balance = await this.token.balanceOf(investor);
      console.log("Balance:" + balance);
      let expectedVesting = amount.mul(releaseTime - this.vestingTime).div(this.vestingDuration).floor();
      console.log("Expected Vesting:" + expectedVesting);
      balance.should.bignumber.equal(expectedVesting);

    });

    //it('Crowsale should be pausable', async function(){
    //  await this.crowsale.pause();
    //  await this.crowsale.unpause();
    //  await this.crowsale.normalProcess();
    //  let count = await this.crowsale.count();

    //  assert.equal(count, 1);
    //});
  });

});
