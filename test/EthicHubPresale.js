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

contract('EthicHubPresale', function ([owner ,investor, investor2, investor3, investor4, investor5, wallet]) {

  const RATE = new BigNumber(4000);
  const cap = ether(3000)
  const goal = ether(800)
  const numIntervals = 3;
  const percentageDiscount = 10;
  const whitelistRate = new BigNumber(5000);


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
      console.log("tokenDistribution");
      this.tokenDistribution.transferOwnership(investor2);
      (await this.tokenDistribution.owner()).should.be.equal(investor2);
      console.log("crowdsale");
      console.log(investor);
      this.crowdsale.transferOwnership(investor,{from:owner});
      (await this.crowdsale.owner()).should.be.equal(investor);

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
      console.log("y");
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

  describe('whitelists', function() {
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
      console.log("LOL");
      await this.tokenDistribution.initIntervals();
      console.log("What");
      console.log(this.vestingTime);
      console.log(this.vestingDuration);

      await this.tokenDistribution.configureVesting(this.vestingTime, this.vestingDuration);
      console.log("What2");

      await this.tokenDistribution.changeRegistrationStatus(investor, ether(5))

    });
    it.only('should refund investors if goal is not reached in time', async function () {
      await increaseTimeTo(this.startTime + duration.days(0.5))
      //Buy period
      console.log("o");
      await this.crowdsale.buyTokens(investor, {value: ether(1)});
      const balance1 = web3.eth.getBalance(investor);

      await this.crowdsale.buyTokens(investor2, {value: ether(1.999)});
      const balance2 = web3.eth.getBalance(investor2);

      await increaseTimeTo(this.startTime + duration.days(1.5))
      await this.crowdsale.buyTokens(investor3, {value: ether(1)});
      await increaseTimeTo(this.startTime + duration.days(5))
      await this.crowdsale.buyTokens(investor3, {value: ether(1)});
      const balance3 = web3.eth.getBalance(investor3);

      //Crowdsale end
      await increaseTimeTo(this.afterEndTime);
      console.log("finalize");
      await this.crowdsale.finalize();

      //Return funds shouls be successes
      console.log("Refunds");
      console.dir(this.crowdsale.claimRefund);
      console.dir(EthicHubPresale._json.abi);
      await this.crowdsale.claimRefund({from:investor}).should.be.fulfilled;
      console.log("getBalance");

      web3.eth.getBalance(investor).should.be.equal(balance1.add(ether(1)));
      console.log("crowdsale");

      await this.crowdsale.claimRefund({from:investor2}).should.be.fulfilled;
      web3.eth.getBalance(investor2).should.be.equal(balance2.add(ether(1.999)));
      await this.crowdsale.claimRefund({from:investor3}).should.be.fulfilled;
      web3.eth.getBalance(investor3).should.be.equal(balance1.add(ether(2)));



      //Compensation fail
      // const afterVesting = this.vestingTime + this.vestingDuration + duration.days(1);
      // await increaseTimeTo(afterVesting);
      //
      // await this.tokenDistribution.compensate(investor).should.be.rejectedWith(EVMRevert);
    });
    it('should have a succesfull crowdsale not reaching cap and compensating vested tokens');
    it('should have a succesfull crowdsale reaching cap, rejecting further buys and compensating vested tokens');

    it('should pause?');

  });



});
