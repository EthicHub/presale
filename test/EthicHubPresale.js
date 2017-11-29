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

const FixedPoolWithDiscountsTokenDistributionMock = artifacts.require('./helpers/FixedPoolWithDiscountsTokenDistributionMock');
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
    this.startTime = latestTime() + duration.weeks(1);
    this.endTime = this.startTime + duration.weeks(8);

    const fixedPoolToken = await SimpleToken.new();
    const totalSupply = await fixedPoolToken.totalSupply();
    this.tokenDistribution = await FixedPoolWithDiscountsTokenDistributionMock.new(fixedPoolToken.address,RATE);

    this.crowdsale = await EthicHubPresale.new(this.startTime, this.endTime, goal, cap, wallet, this.tokenDistribution.address);
    await fixedPoolToken.transfer(this.tokenDistribution.address, totalSupply);
    this.token = Token.at(await this.tokenDistribution.getToken.call());

  })

  describe('Initialization', function() {

    beforeEach(async function () {
      this.afterEndTime = this.endTime + duration.seconds(1);
      for (var i = 0; i <= numIntervals; i++) {
        this.tokenDistribution.addInterval(this.startTime + duration.weeks(2*i+1), (numIntervals-i)*percentageDiscount);
      }
    //  await increaseTimeTo(this.startTime)
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

});
