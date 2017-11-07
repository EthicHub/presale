'use strict';
//const assertJump = require('./helpers/assertJump');

var EthicHubPresale = artifacts.require('../contracts/EthicHubPresale.sol');

describe('Initialization', function() {
  contract('EthicHubPresale', function(accounts) {
    it("should create EthicHubPresale and be the owner", function() {
      return EthicHubPresale.new(
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000) + 1000,
        3,
        4,
        accounts[1]
      ).then( instance => {
        return instance.owner();
      }).then( owner => {
        assert.equal(accounts[0], owner);
      });
    });
  });
});

describe('Hard Cap', (accounts) => {
  //This test is to assure we are inheriting OpenZeppelin CappedCrowdsale
  contract('EthicHubPresale', function(accounts) {
    it("should set a hardcap When created", function() {
      return EthicHubPresale.new(
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000) + 1000,
        3,
        4,
        accounts[1]
      ).then( instance => {
        return instance.cap();
      }).then( cap => {
        assert.equal(4, cap);
      });
    });
  });
});
