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

const CompositeCrowdsale = artifacts.require('CompositeCrowdsale')
const FixedPoolWithDiscountsTokenDistributionMock = artifacts.require('./helpers/FixedPoolWithDiscountsTokenDistributionMock');
const Token = artifacts.require('ERC20')

const SimpleToken = artifacts.require('SimpleToken')

contract('FixedPoolWithDiscountsTokenDistribution', function ([_, investor, wallet]) {

  const RATE = new BigNumber(4000);
  const numIntervals = 3;
  const percentageDiscount = 10;

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  })


  beforeEach(async function () {
    this.startTime = latestTime() + duration.weeks(1);
    this.endTime = this.startTime + duration.weeks(8);

    const fixedPoolToken = await SimpleToken.new();
    const totalSupply = await fixedPoolToken.totalSupply();
    this.tokenDistribution = await FixedPoolWithDiscountsTokenDistributionMock.new(fixedPoolToken.address,RATE);

    this.crowdsale = await CompositeCrowdsale.new(this.startTime, this.endTime, wallet, this.tokenDistribution.address)

    await fixedPoolToken.transfer(this.tokenDistribution.address, totalSupply);
    this.token = Token.at(await this.tokenDistribution.getToken.call());

  })



  describe('proving the intervals of the distribution', function () {

    beforeEach(async function () {
      this.afterEndTime = this.endTime + duration.seconds(1);

      for (var i = 0; i <= numIntervals; i++) {
        this.tokenDistribution.addInterval(this.startTime + duration.weeks(2*i+1), (numIntervals-i)*percentageDiscount);
      }
      await this.tokenDistribution.initIntervals();
      //console.log(await this.tokenDistribution.getIntervals());

    })

    it('should calculate tokens', async function () {

      for (var i = 0; i <= numIntervals; i++) {
        await increaseTimeTo(this.startTime + duration.weeks(2*i))
        const investmentAmount = ether(0.000000000000000001);
        console.log("*** Amount: " + investmentAmount);
        let tokens = await this.tokenDistribution.calculateTokenAmount(investmentAmount).should.be.fulfilled;
        console.log("*** COMPOSITION Tokens: " + tokens);
        let tx = await this.crowdsale.buyTokens(investor, {value: investmentAmount, from: investor}).should.be.fulfilled;
        console.log("*** COMPOSITION FIXED POOL: " + tx.receipt.gasUsed + " gas used.");

      }
      await increaseTimeTo(this.afterEndTime);
      await this.tokenDistribution.compensate(investor).should.be.fulfilled;
      const totalSupply = await this.token.totalSupply();
      (await this.token.balanceOf(investor)).should.be.bignumber.equal(totalSupply);

    })

  });

  describe('proving without intervals', function () {

    beforeEach(async function () {
      await increaseTimeTo(this.startTime);
    })

    it('should fail because not have intervals', async function () {
      await this.tokenDistribution.initIntervals().should.be.rejectedWith(EVMRevert);
    })

  });

  describe('proving intervals time', function () {

    beforeEach(async function () {
      await increaseTimeTo(this.startTime);
    })

    it('should fail because interval > endTime', async function () {
      this.tokenDistribution.addInterval(this.endTime + duration.seconds(1), 1);
      console.log(`end time:  ${this.endTime}`);
      console.log(`end period interval:  ${this.endTime + duration.seconds(1)}`);
      await this.tokenDistribution.initIntervals().should.be.rejectedWith(EVMRevert);
    })

    it('should fail because interval < startTime', async function () {
      this.tokenDistribution.addInterval(this.startTime - duration.seconds(1), 1);
      console.log(`start time:  ${this.startTime}`);
      console.log(`start period interval:  ${this.startTime - duration.seconds(1)}`);
      await this.tokenDistribution.initIntervals().should.be.rejectedWith(EVMRevert);
    })

    it('should fail because next interval period < previous interval period', async function () {
      this.tokenDistribution.addInterval(this.startTime + duration.seconds(2), 1);
      this.tokenDistribution.addInterval(this.startTime + duration.seconds(1), 1);
      console.log(`first interval period:  ${this.startTime + duration.seconds(2)}`);
      console.log(`second interval period:  ${this.startTime + duration.seconds(1)}`);
      await this.tokenDistribution.initIntervals().should.be.rejectedWith(EVMRevert);
    })

  });

})
