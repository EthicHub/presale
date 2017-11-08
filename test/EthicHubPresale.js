'use strict';
//const assertJump = require('./helpers/assertJump');

var EthicHubPresale = artifacts.require('../contracts/EthicHubPresale.sol');

describe('Initialization', function() {
  contract('EthicHubPresale', function(accounts) {
    let presale;
    beforeEach(async function() {
      presale = await EthicHubPresale.new(
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000) + 1000,
        3,
        4,
        accounts[1]
      );
    });
    it("should create EthicHubPresale and be the owner", async function() {
      let owner = await presale.owner();
      assert.equal(accounts[0], owner);
    });
    it("should set a hardcap When created", async function() {
      let cap = await presale.cap();
      assert.equal(4, cap);
    });
  });
});
