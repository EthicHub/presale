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

//const FixedPoolWithDiscountsTokenDistributionMock = artifacts.require('./helpers/FixedPoolWithDiscountsTokenDistributionMock');
const EthicHubTokenDistribution = artifacts.require('EthicHubTokenDistributionStrategy');
const Token = artifacts.require('ERC20')

const EthixToken = artifacts.require('EthixToken')

const EthicHubPresale = artifacts.require('EthicHubPresale');

contract('EthicHubPresale', function ([owner, investor, investor2, investor3, wallet]) {

  const RATE = new BigNumber(4000);
  const cap = ether(3000)
  const goal = ether(800)
  const numIntervals = 3;
  const percentageDiscount = 10;
  const whitelistRate = new BigNumber(5000);

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  })


  beforeEach(async function () {
    this.startTime = latestTime() + duration.days(1);
    this.endTime = this.startTime + duration.days(40);

    const fixedPoolToken = await EthixToken.new();

    const totalSupply = await fixedPoolToken.totalSupply();

    //TODO set correct presale amount of tokens
    const presaleSupply = totalSupply.mul(20).div(100);

    this.tokenDistribution = await EthicHubTokenDistribution.new(fixedPoolToken.address,RATE,whitelistRate);
    this.crowdsale = await EthicHubPresale.new(this.startTime, this.endTime, goal, cap, wallet, this.tokenDistribution.address);
    console.log(presaleSupply);
    await fixedPoolToken.transfer(this.tokenDistribution.address, presaleSupply);

    //TODO transfer rest of the tokens to team vestings and ethichub wallet
    this.token = Token.at(await this.tokenDistribution.getToken.call());

  })

  describe('Initialization', function() {

    it('should fulfilled initiate with intervals token distribution', async function () {
      await this.tokenDistribution.initIntervals().should.be.fulfilled;
    })
    it('should init intervals only once');
    it('should fail to intervals if not owner');

    it("should create the owner", async function() {
      (await this.crowdsale.owner()).should.be.equal(owner);
    })

    it("should transfer ownership");


    it("should set a cap when created", async function() {
      (await this.crowdsale.cap()).should.be.bignumber.equal(cap);
    });

    it("should set a goal when created", async function() {
      (await this.crowdsale.goal()).should.be.bignumber.equal(goal);
    });

  });

  describe('proving the intervals of the distribution', function () {

    beforeEach(async function () {
      this.afterEndTime = this.endTime + duration.seconds(1);
      await this.tokenDistribution.initIntervals();
    })

    it('should calculate tokens', async function () {
      var [endPeriods, discounts] = await this.tokenDistribution.getIntervals();
      var tokens = 0
      const investmentAmount = ether(0.000000000000000001);
      console.log(`*** Amount:  ${investmentAmount}`);
      for (var i = 0; i <= endPeriods.length; i++) {
      //for (var i = 0; i <= 10; i++) {
        await increaseTimeTo(this.startTime + duration.days(i + 0.5))
        tokens = await this.tokenDistribution.calculateTokenAmount(investmentAmount).should.be.fulfilled;
      console.log(`*** Tokens:  ${tokens}`);
        let tx = await this.crowdsale.buyTokens(investor, {value: investmentAmount, from: investor}).should.be.fulfilled;
        console.log(`*** Gas used: ${tx.receipt.gasUsed}`);

      }
      await increaseTimeTo(this.afterEndTime);
      await this.tokenDistribution.compensate(investor, tokens).should.be.fulfilled;
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
      	var vestingStart = this.endTime + + duration.days(1);
      	var vestingDuration = 1;
      	await this.tokenDistribution.initIntervals();
	await this.tokenDistribution.changeRegistrationStatus(investor, ether(5))
        const tx = await this.tokenDistribution.configureVesting(vestingStart, vestingDuration);
        await increaseTimeTo(this.startTime + duration.days(0.5))
        let tokens = await this.tokenDistribution.calculateTokenAmount(ether(5), {from: investor}).should.be.fulfilled;
        await this.crowdsale.buyTokens(investor, {value: ether(5), from: investor}).should.be.fulfilled;
	whitelistRate.mul(ether(5)).should.be.bignumber.equal(tokens);

        await this.crowdsale.buyTokens(investor2, {value: goal, from: investor2}).should.be.fulfilled;
        await increaseTimeTo(this.endTime + duration.days(4))

	await this.crowdsale.finalize().should.be.fulfilled;
	await this.tokenDistribution.compensate(investor, tokens).should.be.fulfilled;
	let newBalance = await this.token.balanceOf(investor);
      	newBalance.should.be.bignumber.equal(tokens);
    });

    it('whitelists investor does not reach his compromised amount', async function(){
      	var vestingStart = this.endTime + + duration.days(1);
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

	await this.tokenDistribution.compensate(investor, tokens).should.be.fulfilled;

	let newBalance = await this.token.balanceOf(investor);
      	newBalance.should.be.bignumber.equal(tokens);
    });

  });


  describe('Crowdsale', function() {
    it('should refund investors if goal is not reached in time');
    it('should calculate correct tokens for whitelists');
    it('should have a succesfull crowdsale not reaching cap and compensating vested tokens');
    it('should have a succesfull crowdsale reaching cap, rejecting further buys and compensating vested tokens');

    it('should pause');

  });

  // TODO Que no hayamos llegadp al min cap y devolver pasta
  // TODO Whitelist
  // TODO Si llegamos al maxcap
  // TODO Que nos quedemos entre medias
  // TODO compensar tokens
  // TODO Pausable
  // TODO LLegar al max antes de tiempo
  // TODO Intervals se settea una vez y solo el owner

});
