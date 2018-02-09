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
  UnsoldTokenHandler unsoldTokenHandler;
  uint256 rate;

  constructor(UnsoldTokenHandler _unsoldTokenHandler) {
    this.unsoldTokenHandler = unsoldTokenHandler;
  }

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

  function disposeOfUnsoldTokens() onlyCrowdsale {
    uint256 balance = token.balanceOf(this).sub(totalContributed);

    this.unsoldTokenHandler.disposeOfUnsoldTokens(balance);
  }

  function isContributorAccepted(address _contributor) view returns (boolean) {
    return true;
  }

  function distributeTokens(address beneficiary, uint amount);

  function calculateTokenAmount(uint256 _weiAmount, address beneficiary) view returns (uint256 amount);

  function getToken() view returns(ERC20);


}
