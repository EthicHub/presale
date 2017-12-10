pragma solidity ^0.4.18;


import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './TokenDistributionStrategy.sol';

/**
 * @title CompositeCrowdsale
 * @dev CompositeCrowdsale is a base contract for managing a token crowdsale.
 * Contrary to a classic crowdsale, it favours composition over inheritance.
 *
 * Crowdsale behaviour can be modified by specifying TokenDistributionStrategy
 * which is a dedicated smart contract that delegates all of the logic managing
 * token distribution.
 *
 * CompositeCrowdsale is at the WIP stage and is meant to illustrate composition
 * approach for managing crowdsale logic. It shouldn't be used in production code
 * before necessary upgrades and testing.
 */
contract CompositeCrowdsale {
  using SafeMath for uint256;

  // The token being sold
  TokenDistributionStrategy public tokenDistribution;

  // start and end timestamps where investments are allowed (both inclusive)
  uint256 public startTime;
  uint256 public endTime;

  // address where funds are collected
  address public wallet;

  // amount of raised money in wei
  uint256 public weiRaised;

  /**
   * event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);


  function CompositeCrowdsale(uint256 _startTime, uint256 _endTime, address _wallet, TokenDistributionStrategy _tokenDistribution) public {
    require(_startTime >= now);
    require(_endTime >= _startTime);
    require(_wallet != 0x0);

    startTime = _startTime;
    endTime = _endTime;

    tokenDistribution = _tokenDistribution;
    tokenDistribution.initializeDistribution(this);

    wallet = _wallet;
  }


  // fallback function can be used to buy tokens
  function () payable {
    buyTokens(msg.sender);
  }

  // low level token purchase function
  function buyTokens(address beneficiary) payable {
    require(beneficiary != 0x0);
    require(validPurchase());

    uint256 weiAmount = msg.value;

    // calculate token amount to be created
    uint256 tokens = tokenDistribution.calculateTokenAmount(weiAmount, beneficiary);
    // update state
    weiRaised = weiRaised.add(weiAmount);

    tokenDistribution.distributeTokens(beneficiary, tokens);
    TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

    forwardFunds();
  }

  // send ether to the fund collection wallet
  // override to create custom fund forwarding mechanisms
  function forwardFunds() internal {
    wallet.transfer(msg.value);
  }

  // @return true if the transaction can buy tokens
  function validPurchase() internal view returns (bool) {
    bool withinPeriod = now >= startTime && now <= endTime;
    bool nonZeroPurchase = msg.value != 0;
    return withinPeriod && nonZeroPurchase;
  }

  // @return true if crowdsale event has ended
  function hasEnded() public view returns (bool) {
    return now > endTime;
  }


}
