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

const FinalizableCompositeCrowdsale = artifacts.require('./helpers/FinalizableCompositeCrowdsaleImpl.sol')
const TokenDistribution = artifacts.require('FixedPoolWithBonusTokenDistributionStrategy')
const SimpleToken = artifacts.require('SimpleToken')

contract('FinalizableCompositeCrowdsale', function ([_, owner, wallet, thirdparty]) {

  const RATE = new BigNumber(4000)

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock()
  })

  beforeEach(async function () {
    this.startTime = latestTime() + duration.weeks(1)
    this.endTime =   this.startTime + duration.weeks(1)
    this.afterEndTime = this.endTime + duration.seconds(1)
    const fixedPoolToken = await SimpleToken.new();
    const totalSupply = await fixedPoolToken.totalSupply();
    this.tokenDistribution = await TokenDistribution.new(fixedPoolToken.address, RATE);
    fixedPoolToken.transfer(this.tokenDistribution.address, 100000000 * ether(1))


    this.crowdsale = await FinalizableCompositeCrowdsale.new(this.startTime, this.endTime, wallet, this.tokenDistribution.address, {from: owner})
  })

  it('cannot be finalized before ending', async function () {
    await this.crowdsale.finalize({from: owner}).should.be.rejectedWith(EVMRevert)
  })

  it('cannot be finalized by third party after ending', async function () {
    await increaseTimeTo(this.afterEndTime)
    await this.crowdsale.finalize({from: thirdparty}).should.be.rejectedWith(EVMRevert)
  })

  it('can be finalized by owner after ending', async function () {
    await increaseTimeTo(this.afterEndTime)
    await this.crowdsale.finalize({from: owner}).should.be.fulfilled
  })

  it('cannot be finalized twice', async function () {
    await increaseTimeTo(this.afterEndTime)
    await this.crowdsale.finalize({from: owner})
    await this.crowdsale.finalize({from: owner}).should.be.rejectedWith(EVMRevert)
  })

  it('logs finalized', async function () {
    await increaseTimeTo(this.afterEndTime)
    const {logs} = await this.crowdsale.finalize({from: owner})
    const event = logs.find(e => e.event === 'Finalized')
    should.exist(event)
  })

})
