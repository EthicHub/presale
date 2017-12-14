pragma solidity ^0.4.18;

import './TokenDistributionStrategy.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'minimetoken/contracts/MiniMeToken.sol';

/**
 * @title FixedRateTokenDistributionStrategy
 * @dev Strategy that distributes a fixed number of tokens among the contributors,
 * with a percentage deppending in when the contribution is made, defined by periods.
 * It's done in two steps. First, it registers all of the contributions while the sale is active.
 * After the crowdsale has ended the contract compensate buyers proportionally to their contributions.
 * This class is abstract, the intervals have to be defined by subclassing
 */
contract FixedPoolWithDiscountsTokenDistributionStrategy is TokenDistributionStrategy {
  using SafeMath for uint256;

  // Definition of the interval when the discount is applicable
  struct DiscountInterval {
    //end timestamp
    uint256 endPeriod;
    // percentage
    uint256 discount;
  }
  DiscountInterval[] discountIntervals;
  bool intervalsConfigured = false;

  // The token being sold
  MiniMeToken token;
  mapping(address => uint256) contributions;
  uint256 totalContributed;
  //mapping(uint256 => DiscountInterval) discountIntervals;

  function FixedPoolWithDiscountsTokenDistributionStrategy(MiniMeToken _token, uint256 _rate)
           TokenDistributionStrategy(_rate) public
  {
    token = _token;
  }


  // First period will go from crowdsale.start_date to discountIntervals[0].end
  // Next intervals have to end after the previous ones
  // Last interval must end when the crowdsale ends
  // All intervals must have a positive discount (penalizations are not contemplated)
  modifier validateIntervals {
    _;
    require(intervalsConfigured == false);
    intervalsConfigured = true;
    require(discountIntervals.length > 0);
    for(uint i = 0; i < discountIntervals.length; ++i) {
      require(discountIntervals[i].discount >= 0);
      require(crowdsale.startTime() < discountIntervals[i].endPeriod);
      require(discountIntervals[i].endPeriod <= crowdsale.endTime());
      if (i != 0) {
        require(discountIntervals[i-1].endPeriod < discountIntervals[i].endPeriod);
      }
    }
  }

  // Init intervals
  function initIntervals() validateIntervals {
  }

  function calculateTokenAmount(uint256 _weiAmount) view returns (uint256 tokens) {
    // calculate discount in function of the time
    for (uint i = 0; i < discountIntervals.length; i++) {
      if (now <= discountIntervals[i].endPeriod) {
        // calculate token amount to be created
        tokens = _weiAmount.mul(rate);
        // OP : tokens + ((tokens * discountIntervals[i].discount) / 100)
        // BE CAREFULLY with decimals
        return tokens.add(tokens.mul(discountIntervals[i].discount).div(100));
      }
    }
    return _weiAmount.mul(rate);
  }

  function distributeTokens(address _beneficiary, uint256 _tokenAmount) onlyCrowdsale {
    contributions[_beneficiary] = contributions[_beneficiary].add(_tokenAmount);
    totalContributed = totalContributed.add(_tokenAmount);
  }

  function compensate(address _beneficiary) {
    require(crowdsale.hasEnded());
    if (token.transfer(_beneficiary, contributions[_beneficiary])) {
      contributions[_beneficiary] = 0;
    }
  }

  function getToken() view returns(MiniMeToken) {
    return token;
  }

  function getIntervals() view returns (uint256[] _endPeriods, uint256[] _discounts) {
    uint256[] memory endPeriods = new uint256[](discountIntervals.length);
    uint256[] memory discounts = new uint256[](discountIntervals.length);
    for (uint256 i=0; i<discountIntervals.length; i++) {
      endPeriods[i] = discountIntervals[i].endPeriod;
      discounts[i] = discountIntervals[i].discount;
    }
    return (endPeriods, discounts);
  }

}
