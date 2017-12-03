pragma solidity ^0.4.18;

import '../../contracts/crowdsale/VestedTokenDistributionStrategy.sol';


/**
 * @title VestedTokenDistributionStrategyMock
 * @dev Helper class so we can test vesting
 */

contract VestedTokenDistributionStrategyMock is VestedTokenDistributionStrategy {


  function VestedTokenDistributionStrategyMock(ERC20 _token, uint256 _rate)
            VestedTokenDistributionStrategy(_token, _rate) {
  }

  function initializeDistribution(CompositeCrowdsale _crowdsale) {
    super.initializeDistribution(_crowdsale);
    discountIntervals.push(DiscountInterval(crowdsale.startTime(),0));

  }
}
