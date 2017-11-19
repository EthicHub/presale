const BigNumber = web3.BigNumber

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

import EVMThrow from './helpers/EVMThrow'
import latestTime from './helpers/latestTime';
import {increaseTimeTo, duration} from './helpers/increaseTime';

const MintableToken = artifacts.require('zeppelin-solidity/contracts/token/MintableToken');
const IntervalTokenVesting = artifacts.require('./IntervalTokenVesting');

contract('IntervalTokenVesting', function (accounts) {

  const amount = new BigNumber(1000);
  var owner = accounts[0];
  var beneficiary = accounts[1];
  
  beforeEach(async function () {
    this.token = await MintableToken.new({ from: owner });
    this.start = latestTime() + duration.minutes(2); // +2 minute so it starts after contract instantiation
    this.periodDuration = duration.weeks(26);
    this.numPeriods = 4;
    this.vesting = await IntervalTokenVesting.new(beneficiary, this.start, this.periodDuration, this.numPeriods, true, { from: owner });
    await this.token.mint(this.vesting.address, amount, { from: owner });

  });

  it('cannot be released before start', async function () {
    await this.vesting.release(this.token.address).should.be.rejectedWith(EVMThrow);
  });

  it('cannot be released after start before first period', async function () {
    await increaseTimeTo(this.start + duration.minutes(5));
    await this.vesting.release(this.token.address).should.be.rejectedWith(EVMThrow);
  });

  it('can be released after first period', async function () {
    await increaseTimeTo(this.start + this.periodDuration + duration.weeks(1));
    await this.vesting.release(this.token.address).should.be.fulfilled;
    const balance = await this.token.balanceOf(beneficiary);
    balance.should.bignumber.equal(amount.mul(1).div(this.numPeriods).floor());
  });

  it('should release proper amount after second period', async function () {
    await increaseTimeTo(this.start + duration.weeks(53));

    const { receipt } = await this.vesting.release(this.token.address);
    const balance = await this.token.balanceOf(beneficiary);
    balance.should.bignumber.equal(amount.mul(2).div(this.numPeriods).floor());
  });

  it('should release proper amount after third period', async function () {
    await increaseTimeTo(this.start + duration.weeks(79));

    const { receipt } = await this.vesting.release(this.token.address);
    const balance = await this.token.balanceOf(beneficiary);
    balance.should.bignumber.equal(amount.mul(3).div(this.numPeriods).floor());
  });

  it('should release proper amount after forth period', async function () {
    await increaseTimeTo(this.start + duration.weeks(105) + duration.minutes(100));

    const { receipt } = await this.vesting.release(this.token.address);
    const balance = await this.token.balanceOf(beneficiary);
    balance.should.bignumber.equal(amount);
  });


  it('should have released all after end', async function () {
    await increaseTimeTo(this.start + parseInt(this.periodDuration)*(this.numPeriods) + duration.weeks(2));
    await this.vesting.release(this.token.address);
    const balance = await this.token.balanceOf(beneficiary);
    balance.should.bignumber.equal(amount);
  });

  it('should be revoked by owner if revocable is set', async function () {
    await this.vesting.revoke(this.token.address, { from: owner }).should.be.fulfilled;
  });

  it('should fail to be revoked by owner if revocable not set', async function () {
    const vesting = await IntervalTokenVesting.new(beneficiary, this.start, this.periodDuration, this.numPeriods, false, { from: owner });
    await vesting.revoke(this.token.address, { from: owner }).should.be.rejectedWith(EVMThrow);
  });

  it('should return the non-vested tokens when revoked by owner', async function () {
    await increaseTimeTo(this.start + duration.weeks(53));

    const vested = await this.vesting.vestedAmount(this.token.address);

    await this.vesting.revoke(this.token.address, { from: owner });

    const ownerBalance = await this.token.balanceOf(owner);
    ownerBalance.should.bignumber.equal(amount.sub(vested));
  });

  it('should keep the vested tokens when revoked by owner', async function () {
    await increaseTimeTo(this.start, duration.weeks(13));

    const vestedPre = await this.vesting.vestedAmount(this.token.address);

    await this.vesting.revoke(this.token.address, { from: owner });

    const vestedPost = await this.vesting.vestedAmount(this.token.address);

    vestedPre.should.bignumber.equal(vestedPost);
  });

  it('should fail to be revoked a second time', async function () {
    await increaseTimeTo(this.start + duration.weeks(13));

    const vested = await this.vesting.vestedAmount(this.token.address);

    await this.vesting.revoke(this.token.address, { from: owner });

    await this.vesting.revoke(this.token.address, { from: owner }).should.be.rejectedWith(EVMThrow);
  });

});
