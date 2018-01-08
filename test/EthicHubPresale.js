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

contract('EthicHubPresale', function ([owner ,investor, investor2, investor3, investor4, investor5, investor6, investor7, investor8, wallet]) {

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
      await this.tokenDistribution.transferOwnership(investor2);
      (await this.tokenDistribution.owner()).should.be.equal(investor2);
      await this.crowdsale.transferOwnership(investor,{from:owner});
      (await this.crowdsale.owner()).should.be.equal(investor);
    });

    it("should set a cap when created", async function() {
      (await this.crowdsale.cap()).should.be.bignumber.equal(cap);
    });

    it("should set a goal when created", async function() {
      (await this.crowdsale.goal()).should.be.bignumber.equal(goal);
    });

    it("should fail if the crowdsale owner and distribution owner are different", async function() {
      const fixedPoolToken = await EthixToken.new();
      const someTokenDistribution = await EthicHubTokenDistribution.new(fixedPoolToken.address,RATE,whitelistRate);
      await EthicHubPresale.new(this.startTime, this.endTime, goal, cap, wallet, someTokenDistribution.address, {from: investor}).should.be.eventually.rejectedWith(EVMRevert);
    });

  });

  describe('when buying tokens', function() {
    beforeEach(async function () {
      await increaseTimeTo(this.startTime + duration.seconds(2));
    });

    it('should reject buying under minimun contribution', async function () {
      var amount = await this.crowdsale.minimumBidAllowed();
      amount = amount.sub(new BigNumber(1));
      await this.crowdsale.buyTokens(investor, {value: amount, from: investor}).should.be.rejectedWith(EVMRevert);
    });

    it('should reject buying over max limit', async function() {
      var amount = await this.crowdsale.maximumBidAllowed();
      amount = amount.add(new BigNumber(1));
      await this.crowdsale.buyTokens(investor, {value: amount, from: investor}).should.be.rejectedWith(EVMRevert);
    });

    it('should reject buying over max limit in several tries', async function() {
      var amount = await this.crowdsale.maximumBidAllowed();
      amount = amount.div(2).add(1);
      await this.crowdsale.buyTokens(investor, {value: amount, from: investor}).should.be.fulfilled;
      await this.crowdsale.buyTokens(investor, {value: amount, from: investor}).should.be.rejectedWith(EVMRevert);

    });

  });

  describe('proving the intervals of the distribution', function () {

    beforeEach(async function () {
      await this.tokenDistribution.initIntervals();
    })

    it('should calculate tokens', async function () {
      var [endPeriods, discounts] = await this.tokenDistribution.getIntervals();
      var tokens = new BigNumber(0);
      const investmentAmount = ether(1);
      console.log(`*** Amount:  ${investmentAmount}`);
      for (var i = 0; i <= endPeriods.length; i++) {

        await increaseTimeTo(this.startTime + duration.days(i + 0.5))
        const newTokens = await this.tokenDistribution.calculateTokenAmount(investmentAmount, investor);
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
      var vestingStart = this.endTime + duration.days(1);
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

        let tokens = await this.tokenDistribution.calculateTokenAmount(ether(5), investor, {from: investor}).should.be.fulfilled;
        console.log(tokens)
        await this.crowdsale.buyTokens(investor, {value: ether(5), from: investor}).should.be.fulfilled;
        whitelistRate.mul(ether(5)).should.be.bignumber.equal(tokens);

        await increaseTimeTo(this.startTime + duration.days(1))
        await this.crowdsale.buyTokens(investor2, {value: ether(200), from: investor2}).should.be.fulfilled;
        await increaseTimeTo(this.startTime + duration.days(1.5))
        await this.crowdsale.buyTokens(investor3, {value: ether(300), from: investor3}).should.be.fulfilled;
        await increaseTimeTo(this.startTime + duration.days(2.5))
        await this.crowdsale.buyTokens(investor4, {value: ether(400), from: investor4}).should.be.fulfilled;

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
        let tokens = await this.tokenDistribution.calculateTokenAmount(ether(4), investor, {from: investor}).should.be.fulfilled;
        RATE.mul(ether(4).mul(1.1)).should.be.bignumber.equal(tokens);

        await this.crowdsale.buyTokens(investor2, {value: ether(400), from: investor2}).should.be.fulfilled;
        await this.crowdsale.buyTokens(investor3, {value: ether(500), from: investor3}).should.be.fulfilled;

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
      await this.tokenDistribution.changeRegistrationStatus(investor, ether(5))

    });
    it('should refund investors if goal is not reached in time', async function () {
      await increaseTimeTo(this.startTime + duration.days(0.5))
      //Buy period
      await this.crowdsale.buyTokens(investor, {value: ether(1), from: investor});
      var balance1 = web3.eth.getBalance(investor);

      await this.crowdsale.buyTokens(investor2, {value: ether(1.999), from: investor2});
      var balance2 = web3.eth.getBalance(investor2);

      await increaseTimeTo(this.startTime + duration.days(1.5))
      await this.crowdsale.buyTokens(investor3, {value: ether(1), from: investor3});
      await increaseTimeTo(this.startTime + duration.days(5))
      await this.crowdsale.buyTokens(investor3, {value: ether(1), from: investor3});
      var balance3 = web3.eth.getBalance(investor3);
      //Crowdsale end
      await increaseTimeTo(this.afterEndTime);
      console.log("finalize");
      await this.crowdsale.finalize();

      //Return funds shouls be successes
      console.log("Refunds");
      // console.dir(this.crowdsale.claimRefund);
      // console.dir(EthicHubPresale._json.abi);
      var tx = await this.crowdsale.claimRefund({from:investor}).should.be.fulfilled;
      (new BigNumber(web3.eth.getBalance(investor))).should.be.bignumber.above(new BigNumber(balance1).add(ether(0.99)));

      await this.crowdsale.claimRefund({from:investor2}).should.be.fulfilled;
      // 0.1 eth less due to used gas
      new BigNumber(web3.eth.getBalance(investor2)).should.be.bignumber.above(new BigNumber(balance2).add(ether(1.899)));
      await this.crowdsale.claimRefund({from:investor3}).should.be.fulfilled;
      // 0.1 eth less due to used gas
      new BigNumber(web3.eth.getBalance(investor3)).should.be.bignumber.above(new BigNumber(balance3).add(ether(1.99)));



      //Compensation fail
      // const afterVesting = this.vestingTime + this.vestingDuration + duration.days(1);
      // await increaseTimeTo(afterVesting);
      //
      // await this.tokenDistribution.compensate(investor).should.be.rejectedWith(EVMRevert);
    });


    it('should have a succesfull crowdsale not reaching cap and compensating vested tokens', async function(){

      await increaseTimeTo(this.startTime + duration.days(1));

      await this.crowdsale.buyTokens(investor2, {value: ether(500), from: investor2}).should.be.fulfilled;

      let amount = await this.tokenDistribution.calculateTokenAmount(ether(400), investor, {from: investor}).should.be.fulfilled;
      console.log("Amount:" + amount);
      await this.crowdsale.buyTokens(investor, {value: ether(400), from: investor}).should.be.fulfilled;
      
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

      await increaseTimeTo(this.vestingTime + duration.days(101));
      console.log("Amount:" + amount);
      console.log("Vested Amount end:" + await this.tokenDistribution.vestedAmount(investor));

      tx = await this.tokenDistribution.compensate(investor).should.be.fulfilled;
      releaseTime = web3.eth.getBlock(tx.receipt.blockNumber).timestamp;
      balance = await this.token.balanceOf(investor);
      console.log("Balance:" + balance);

      // internally if the releaseTime is bigger then vestingDuration, the total amount is sent
      // expectedVesting = amount.mul(releaseTime - this.vestingTime).div(this.vestingDuration).floor();
      // console.log("Expected Vesting:" + expectedVesting);
      balance.should.bignumber.equal(amount);

    });

    it('should have a succesfull crowdsale reaching cap, rejecting further buys and compensating vested tokens', async function(){
        await this.tokenDistribution.changeRegistrationStatus(investor, ether(200))
        await increaseTimeTo(this.startTime + duration.days(0.5))
        await this.crowdsale.buyTokens(investor, {value: ether(200), from: investor}).should.be.fulfilled;
        let tokens = await this.tokenDistribution.calculateTokenAmount(ether(200), investor, {from: investor}).should.be.fulfilled;

        await this.crowdsale.buyTokens(investor2, {value: ether(500), from: investor2}).should.be.fulfilled;
        await this.crowdsale.buyTokens(investor3, {value: ether(500), from: investor3}).should.be.fulfilled;
        await this.crowdsale.buyTokens(investor4, {value: ether(500), from: investor4}).should.be.fulfilled;
        await this.crowdsale.buyTokens(investor5, {value: ether(500), from: investor5}).should.be.fulfilled;
        await this.crowdsale.buyTokens(investor6, {value: ether(500), from: investor6}).should.be.fulfilled;
        await this.crowdsale.buyTokens(investor7, {value: ether(300), from: investor7}).should.be.fulfilled;

        // cap reached should reject
        await this.crowdsale.buyTokens(investor8, {value: ether(100), from: investor8}).should.be.rejectedWith(EVMRevert);

        // can be finished before end time
        await this.crowdsale.finalize().should.be.fulfilled;

        await increaseTimeTo(this.vestingTime + duration.days(230));
        await this.tokenDistribution.compensate(investor).should.be.fulfilled;

        let newBalance = await this.token.balanceOf(investor);
        newBalance.should.be.bignumber.equal(tokens);

    })

    it('should be pausable', async function(){
      await increaseTimeTo(this.startTime + duration.days(1));
      await this.crowdsale.buyTokens(investor2, {value: ether(500), from: investor2}).should.be.fulfilled;

      await this.crowdsale.pause({from: owner}).should.be.fulfilled;
      // can not invest more tokens from now
      await this.crowdsale.buyTokens(investor, {value: ether(10), from: investor}).should.be.rejectedWith(EVMRevert);

      await this.crowdsale.unpause({from: owner}).should.be.fulfilled;
      // can invest more tokens from now
      await this.crowdsale.buyTokens(investor, {value: ether(10), from: investor}).should.be.fulfilled;

      //can be finished with ico paused after the end time
      await this.crowdsale.pause({from: owner}).should.be.fulfilled;
      await increaseTimeTo(this.afterEndTime);

      await this.crowdsale.finalize().should.be.fulfilled;
      //await this.crowdsale.claimRefund({from:investor}).should.be.fulfilled;
    })

    it('check user invested amount', async function(){
      await increaseTimeTo(this.startTime + duration.days(1));
      await this.crowdsale.buyTokens(investor, {value: ether(100), from: investor}).should.be.fulfilled;
      await this.crowdsale.buyTokens(investor, {value: ether(10), from: investor}).should.be.fulfilled;
      await this.crowdsale.buyTokens(investor, {value: ether(200), from: investor}).should.be.fulfilled;

      const invested = await this.crowdsale.getInvestedAmount(investor).should.be.fulfilled;
      invested.should.be.bignumber.equal(ether(310));
      //await this.crowdsale.claimRefund({from:investor}).should.be.fulfilled;
    })

  });

});
