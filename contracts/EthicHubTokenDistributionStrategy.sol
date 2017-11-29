pragma solidity ^0.4.18;

import './crowdsale/FixedPoolWithDiscountsTokenDistributionStrategy.sol';

/**
 * @title FixedRateTokenDistributionStrategy
 * @dev Strategy that distributes a fixed number of tokens among the contributors,
 * with a percentage deppending in when the contribution is made, defined by periods.
 * It's done in two steps. First, it registers all of the contributions while the sale is active.
 * After the crowdsale has ended the contract compensate buyers proportionally to their contributions.
 * This class is abstract, the intervals have to be defined by subclassing
 */
contract EthicHubTokenDistributionStrategy is FixedPoolWithDiscountsTokenDistributionStrategy {

  function EthicHubTokenDistributionStrategy(ERC20 _token, uint256 _rate)
           FixedPoolWithDiscountsTokenDistributionStrategy(_token, _rate) public
  {
    //initIntervals();
  }

  // Init intervals
  function initIntervals() validateIntervals {
    discountIntervals.push(DiscountInterval(crowdsale.startTime() + 1 days,10));
    discountIntervals.push(DiscountInterval(crowdsale.startTime() + 2 days,8));
    discountIntervals.push(DiscountInterval(crowdsale.startTime() + 3 days,6));
    discountIntervals.push(DiscountInterval(crowdsale.startTime() + 4 days,4));
    discountIntervals.push(DiscountInterval(crowdsale.startTime() + 5 days,2));
    discountIntervals.push(DiscountInterval(crowdsale.startTime() + 6 days,0));
  }

}
