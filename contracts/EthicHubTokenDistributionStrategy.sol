pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './crowdsale/FixedPoolWithBonusTokenDistributionStrategy.sol';
import './crowdsale/WhitelistedDistributionStrategy.sol';
import './EthixToken.sol';

/**
 * @title EthicHubTokenDistributionStrategy
 * @dev Strategy that distributes a fixed number of tokens among the contributors,
 * with a percentage deppending in when the contribution is made, defined by periods.
 * It's done in two steps. First, it registers all of the contributions while the sale is active.
 * After the crowdsale has ended the contract compensate buyers proportionally to their contributions.
 * Contributors registered to the whitelist will have better rates
 */
contract EthicHubTokenDistributionStrategy is Ownable, WhitelistedDistributionStrategy {
  
  event UnsoldTokensReturned(address indexed destination, uint256 amount);


  function EthicHubTokenDistributionStrategy(EthixToken _token, uint256 _rate, uint256 _rateForWhitelisted)
           WhitelistedDistributionStrategy(_token, _rate, _rateForWhitelisted)
           public
  {

  }


  // Init intervals
  function initIntervals() onlyOwner validateIntervals  {

    //For extra security, we check the owner of the crowdsale is the same of the owner of the distribution
    require(owner == crowdsale.owner());

    bonusIntervals.push(BonusInterval(crowdsale.startTime() + 1 days,10));
    bonusIntervals.push(BonusInterval(crowdsale.startTime() + 2 days,10));
    bonusIntervals.push(BonusInterval(crowdsale.startTime() + 3 days,8));
    bonusIntervals.push(BonusInterval(crowdsale.startTime() + 4 days,6));
    bonusIntervals.push(BonusInterval(crowdsale.startTime() + 5 days,4));
    bonusIntervals.push(BonusInterval(crowdsale.startTime() + 6 days,2));
  }

  function returnUnsoldTokens(address _wallet) onlyCrowdsale {
    require(crowdsale.endTime() <= now);
    if (token.balanceOf(this) == 0) {
      UnsoldTokensReturned(_wallet,0);
      return;
    }
    
    uint256 balance = token.balanceOf(this).sub(totalContributed);
    require(balance > 0);

    if(token.transfer(_wallet, balance)) {
      UnsoldTokensReturned(_wallet, balance);
    }
    
  } 
}
