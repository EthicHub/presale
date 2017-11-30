import ether from './helpers/ether'
import {advanceBlock} from './helpers/advanceToBlock'
import {increaseTimeTo, duration} from './helpers/increaseTime'
import latestTime from './helpers/latestTime'
const EVMThrow = require('./helpers/EVMThrow.js')

const BigNumber = web3.BigNumber

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const CompositeCrowdsale = artifacts.require('CompositeCrowdsale');
const VestedTokenDistributionStrategy = artifacts.require('VestedTokenDistributionStrategy');
const Token = artifacts.require('ERC20');

const SimpleToken = artifacts.require('SimpleToken');

contract('CompositeCrowdsale', function ([owner,_, thirdParty, investor, wallet]) {

  const RATE = new BigNumber(1);

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  })

  describe('Vested Distribution', function () {

    beforeEach(async function () {
      this.startTime = latestTime() + duration.weeks(1);
      this.endTime = this.startTime + duration.weeks(1);
      this.afterEndTime = this.endTime + duration.seconds(1);
      this.vestingStart = this.endTime + duration.days(2);
      this.aftervestingStart = this.vestingStart + duration.seconds(1);
      this.vestingDuration = duration.days(100);
      this.fixedPoolToken = await SimpleToken.new();
      const totalSupply = await this.fixedPoolToken.totalSupply();
      this.tokenDistribution = await VestedTokenDistributionStrategy.new(this.fixedPoolToken.address, RATE);
      await this.fixedPoolToken.transfer(this.tokenDistribution.address, totalSupply);

      this.crowdsale = await CompositeCrowdsale.new(this.startTime, this.endTime, wallet, this.tokenDistribution.address)
      this.token = Token.at(await this.tokenDistribution.getToken.call());
    });

    beforeEach(async function () {

      await increaseTimeTo(this.startTime);
    });

    it('should have an owner', async function() {
      const resultOwner = await this.tokenDistribution.owner();
      resultOwner.should.be.equal(owner);
    });

    it('should set correct config ', async function() {
      const tx = await this.tokenDistribution.configureVesting(this.vestingStart,this.vestingDuration);
      const expectedStart = new BigNumber(this.vestingStart);
      const resultStart = await this.tokenDistribution.vestingStart();
      resultStart.should.be.bignumber.equal(expectedStart);
      const expectedDuration = new BigNumber(this.vestingDuration);
      const resultDuration = await this.tokenDistribution.vestingDuration();

      resultDuration.should.be.bignumber.equal(expectedDuration);
    });

    it('should fail when setting date previous to end', async function() {
      const badTime = this.endTime - duration.seconds(1);
      this.tokenDistribution.configureVesting(badTime,this.vestingDuration).should.eventually.be.rejectedWith(EVMThrow);
    });

    it('should fail when setting incorrect duration', async function() {
      this.tokenDistribution.configureVesting(this.vestingStart,0).should.eventually.be.rejectedWith(EVMThrow);
    });

    it('should fail to configure vesting if not owner', async function() {
      const resultOwner = await this.tokenDistribution.owner();
      await this.tokenDistribution.configureVesting(this.vestingStart,this.vestingDuration,{from: thirdParty}).should.be.rejectedWith(EVMThrow);
    });


    it('should release proper amount after cliff', async function () {
      await this.tokenDistribution.configureVesting(this.vestingStart,this.vestingDuration);
      const investmentAmount = ether(1);
      await this.crowdsale.buyTokens(investor, {value: investmentAmount, from: investor}).should.be.fulfilled;
      const amount = await this.tokenDistribution.calculateTokenAmount(investmentAmount);
      const afterVestingStart = this.vestingStart + duration.minutes(2);
      await increaseTimeTo(afterVestingStart);
      const {receipt} = await this.tokenDistribution.compensate(investor);
      const releaseTime = web3.eth.getBlock(receipt.blockNumber).timestamp;
      const balance = await this.token.balanceOf(investor);
      balance.should.bignumber.equal(amount.mul(releaseTime - this.vestingStart).div(this.vestingDuration).floor());
    });

    it('should linearly release tokens during vesting period', async function () {
      await this.tokenDistribution.configureVesting(this.vestingStart,this.vestingDuration);
      const investmentAmount = ether(1);
      await this.crowdsale.buyTokens(investor, {value: investmentAmount, from: investor}).should.be.fulfilled;

      const amount = await this.tokenDistribution.calculateTokenAmount(investmentAmount);

      const vestingPeriod = this.vestingDuration;
      const checkpoints = 4;

      for (let i = 1; i <= checkpoints; i++) {
        const now = this.vestingStart + i * (vestingPeriod / checkpoints);
        await increaseTimeTo(now);

        const tx = await this.tokenDistribution.compensate(investor);
        const releaseTime = web3.eth.getBlock(tx.receipt.blockNumber).timestamp;

        const balance = await this.token.balanceOf(investor);
        const expectedVesting = amount.mul(releaseTime - this.vestingStart).div(this.vestingDuration).floor();

        if (i === checkpoints) {
          amount.should.bignumber.equal(balance);
        } else {
          balance.should.bignumber.equal(expectedVesting);
        }
      }

    });

    it('should have released all after end', async function () {
      await this.tokenDistribution.configureVesting(this.vestingStart,this.vestingDuration);
      const investmentAmount = ether(0.02);
      await this.crowdsale.buyTokens(investor, {value: investmentAmount, from: investor}).should.be.fulfilled;
      const amount = await this.tokenDistribution.calculateTokenAmount(investmentAmount);
      increaseTimeTo(this.vestingStart + this.vestingDuration);

      await this.tokenDistribution.compensate(investor);
      const balance = await this.token.balanceOf(investor);
      balance.should.bignumber.equal(amount);
    });


    it('should fail to compensate if not owner', async function() {
      await this.tokenDistribution.configureVesting(this.vestingStart,this.vestingDuration);
      const investmentAmount = ether(1);

      await this.crowdsale.buyTokens(investor, {value: investmentAmount, from: investor}).should.be.fulfilled;
      const amount = await this.tokenDistribution.calculateTokenAmount(investmentAmount);
      increaseTimeTo(this.vestingStart + this.vestingDuration);

      await this.tokenDistribution.compensate(investor,{from:investor}).should.be.rejectedWith(EVMThrow);

    });


  });


})
