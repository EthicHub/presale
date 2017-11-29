pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/ERC20.sol';
import './CompositeCrowdsale.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

/**
 * @title TokenDistributionStrategy
 * @dev Base abstract contract defining methods that control token distribution
 */
contract TokenDistributionStrategy {
  using SafeMath for uint256;

  CompositeCrowdsale crowdsale;
  uint256 rate;

  modifier onlyCrowdsale() {
    require(msg.sender == address(crowdsale));
    _;
  }

  function TokenDistributionStrategy(uint256 _rate) {
    require(_rate > 0);
    rate = _rate;
  }

  function initializeDistribution(CompositeCrowdsale _crowdsale) {
    require(crowdsale == address(0));
    require(_crowdsale != address(0));
    crowdsale = _crowdsale;
  }

  function distributeTokens(address beneficiary, uint amount);

  function calculateTokenAmount(uint256 weiAmount) view returns (uint256 amount);

  function getToken() view returns(ERC20);


}
