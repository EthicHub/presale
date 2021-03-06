import ether from './helpers/ether'
import {advanceBlock} from './helpers/advanceToBlock'
import {increaseTimeTo, duration} from './helpers/increaseTime'
import latestTime from './helpers/latestTime'
import EVMRevert from './helpers/EVMRevert'

const BigNumber = web3.BigNumber

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const RefundableCompositeCrowdsale = artifacts.require('./helpers/RefundableCompositeCrowdsaleImpl.sol')
const TokenDistribution = artifacts.require('FixedPoolWithBonusTokenDistributionStrategy')
const SimpleToken = artifacts.require('SimpleToken')

contract('RefundableCompositeCrowdsale', function ([_, owner, wallet, investor]) {

  const RATE = new BigNumber(4000)
  const goal = ether(800)
  const lessThanGoal = ether(750)

  beforeEach(async function () {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    this.startTime = latestTime() + duration.weeks(1)
    this.endTime =   this.startTime + duration.weeks(1)
    this.afterEndTime = this.endTime + duration.seconds(1)
    const fixedPoolToken = await SimpleToken.new();
    const totalSupply = await fixedPoolToken.totalSupply();
    this.tokenDistribution = await TokenDistribution.new(fixedPoolToken.address, RATE);
    fixedPoolToken.transfer(this.tokenDistribution.address, 100000000 * ether(1))
    this.crowdsale = await RefundableCompositeCrowdsale.new(this.startTime, this.endTime, wallet, this.tokenDistribution.address, goal, {from: owner})
  })

  it('should fail with zero goal', async function () {
      await RefundableCompositeCrowdsale.new(this.startTime, this.endTime, wallet, this.tokenDistribution.address, 0, {from: owner}).should.be.rejectedWith(EVMRevert);
  })

  it('should deny refunds before end', async function () {
    await this.crowdsale.claimRefund({from: investor}).should.be.rejectedWith(EVMRevert)
    await increaseTimeTo(this.startTime)
    await this.crowdsale.claimRefund({from: investor}).should.be.rejectedWith(EVMRevert)
  })

  it('should deny refunds after end if goal was reached', async function () {
    await increaseTimeTo(this.startTime)
    await this.crowdsale.sendTransaction({value: goal, from: investor})
    await increaseTimeTo(this.afterEndTime)
    await this.crowdsale.claimRefund({from: investor}).should.be.rejectedWith(EVMRevert)
  })

  it('should allow refunds after end if goal was not reached', async function () {
    await increaseTimeTo(this.startTime)
    await this.crowdsale.sendTransaction({value: lessThanGoal, from: investor})
    await increaseTimeTo(this.afterEndTime)

    await this.crowdsale.finalize({from: owner})

    const pre = await web3.eth.getBalance(investor)
    await this.crowdsale.claimRefund({from: investor, gasPrice: 0})
			.should.be.fulfilled
    const post = await web3.eth.getBalance(investor)

    post.minus(pre).should.be.bignumber.equal(lessThanGoal)
  })

  it('should forward funds to wallet after end if goal was reached', async function () {
    await increaseTimeTo(this.startTime)
    await this.crowdsale.sendTransaction({value: goal, from: investor})
    await increaseTimeTo(this.afterEndTime)

    const pre = web3.eth.getBalance(wallet)
    await this.crowdsale.finalize({from: owner})
    const post = web3.eth.getBalance(wallet)

    post.minus(pre).should.be.bignumber.equal(goal)
  })

})
