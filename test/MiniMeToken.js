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

  describe('MiniMeToken', function() {
    it('should deploy all the contracts', async () => {
      const tokenFactory = await MiniMeTokenFactory.new(web3);
      miniMeToken = await MiniMeToken.new(web3,
        tokenFactory.$address,
        0,
        0,
        'MiniMe Test Token',
        18,
        'MMT',
        true);
      assert.ok(miniMeToken.$address);
      miniMeTokenState = new MiniMeTokenState(miniMeToken);
    }).timeout(20000);

    it('Should generate tokens for address 1', async () => {
      b[0] = await web3.eth.getBlockNumber();
      log(`b[0]-> ${b[0]}`);

      await miniMeToken.generateTokens(accounts[1], 10);
      const st = await miniMeTokenState.getState();
      assert.equal(st.totalSupply, 10);
      assert.equal(st.balances[accounts[1]], 10);
      b[1] = await web3.eth.getBlockNumber();
    }).timeout(6000);

    it('Should transfer tokens from address 1 to address 2', async () => {
      await miniMeToken.transfer(accounts[2], 2, { from: accounts[1], gas: 200000 });
      b[2] = await web3.eth.getBlockNumber();
      log(`b[2]->  ${b[3]}`);
      const st = await miniMeTokenState.getState();
      assert.equal(st.totalSupply, 10);
      assert.equal(st.balances[accounts[1]], 8);
      assert.equal(st.balances[accounts[2]], 2);

      const balance = await miniMeToken.balanceOfAt(accounts[1], b[1]);
      assert.equal(balance, 10);
    }).timeout(6000);

    it('Should Create the clone token', async () => {
      const miniMeTokenCloneTx = await miniMeToken.createCloneToken(
        'Clone Token 1',
        18,
        'MMTc',
        0,
        true);

      let addr = miniMeTokenCloneTx.events.NewCloneToken.raw.topics[1];
      addr = `0x${addr.slice(26)}`;
      addr = utils.toChecksumAddress(addr);
      miniMeTokenClone = new MiniMeToken(web3, addr);

      miniMeTokenCloneState = new MiniMeTokenState(miniMeTokenClone);

      b[5] = await web3.eth.getBlockNumber();
      log(`b[5]->  ${b[5]}`);
      const st = await miniMeTokenCloneState.getState();

      assert.equal(st.parentToken, miniMeToken.$address);
      assert.equal(st.parentSnapShotBlock, b[5]);
      assert.equal(st.totalSupply, 7);
      assert.equal(st.balances[accounts[1]], 6);

      const totalSupply = await miniMeTokenClone.totalSupplyAt(b[4]);

      assert.equal(totalSupply, 7);

      const balance = await miniMeTokenClone.balanceOfAt(accounts[2], b[4]);
      assert.equal(balance, 1);
    }).timeout(6000);

  });

});
