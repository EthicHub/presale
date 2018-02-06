pragma solidity ^0.4.18;

import './TokenDistributionStrategy.sol';
import 'zeppelin-solidity/contracts/token/ERC20.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

/**
 * @title FixedPoolWithBonusTokenDistributionStrategy 
 * @dev Strategy that distributes a fixed number of tokens among the contributors,
 * with a percentage depending in when the contribution is made, defined by periods.
 * It's done in two steps. First, it registers all of the contributions while the sale is active.
 * After the crowdsale has ended the contract compensate buyers proportionally to their contributions.
 * This class is abstract, the intervals have to be defined by subclassing
 */
contract FixedPoolWithBonusTokenDistributionStrategy is TokenDistributionStrategy {
  using SafeMath for uint256;
  uint256 constant MAX_DISCOUNT = 100;

  // Definition of the interval when the bonus is applicable
  struct BonusInterval {
    //end timestamp
    uint256 endPeriod;
    // percentage
    uint256 bonus;
  }
  BonusInterval[] bonusIntervals;
  bool intervalsConfigured = false;

  // The token being sold
  ERC20 token;
  mapping(address => uint256) contributions;
  uint256 totalContributed;
  //mapping(uint256 => BonusInterval) bonusIntervals;

  function FixedPoolWithBonusTokenDistributionStrategy(ERC20 _token, uint256 _rate)
           TokenDistributionStrategy(_rate) public
  {
    token = _token;
  }


  // First period will go from crowdsale.start_date to bonusIntervals[0].end
  // Next intervals have to end after the previous ones
  // Last interval must end when the crowdsale ends
  // All intervals must have a positive bonus (penalizations are not contemplated)
  modifier validateIntervals {
    _;
    require(intervalsConfigured == false);
    intervalsConfigured = true;
    require(bonusIntervals.length > 0);
    for(uint i = 0; i < bonusIntervals.length; ++i) {
      require(bonusIntervals[i].bonus <= MAX_DISCOUNT);
      require(bonusIntervals[i].bonus >= 0);
      require(crowdsale.startTime() < bonusIntervals[i].endPeriod);
      require(bonusIntervals[i].endPeriod <= crowdsale.endTime());
      if (i != 0) {
        require(bonusIntervals[i-1].endPeriod < bonusIntervals[i].endPeriod);
      }
    }
  }

  // Init intervals
  function initIntervals() validateIntervals {
  }

  function calculateTokenAmount(uint256 _weiAmount, address beneficiary) view returns (uint256 tokens) {
    // calculate bonus in function of the time
    for (uint i = 0; i < bonusIntervals.length; i++) {
      if (now <= bonusIntervals[i].endPeriod) {
        // calculate token amount to be created
        tokens = _weiAmount.mul(rate);
        // OP : tokens + ((tokens * bonusIntervals[i].bonus) / 100)
        // BE CAREFULLY with decimals
        return tokens.add(tokens.mul(bonusIntervals[i].bonus).div(100));
      }
    }
    return _weiAmount.mul(rate);
  }

  function distributeTokens(address _beneficiary, uint256 _tokenAmount) onlyCrowdsale {
    contributions[_beneficiary] = contributions[_beneficiary].add(_tokenAmount);
    totalContributed = totalContributed.add(_tokenAmount);
    require(totalContributed <= token.balanceOf(this));
  }

  function compensate(address _beneficiary) {
    require(crowdsale.hasEnded());
    if (token.transfer(_beneficiary, contributions[_beneficiary])) {
      contributions[_beneficiary] = 0;
    }
  }

  function getTokenContribution(address _beneficiary) view returns(uint256){
    return contributions[_beneficiary];
  }

  function getToken() view returns(ERC20) {
    return token;
  }

  function getIntervals() view returns (uint256[] _endPeriods, uint256[] _bonuss) {
    uint256[] memory endPeriods = new uint256[](bonusIntervals.length);
    uint256[] memory bonuss = new uint256[](bonusIntervals.length);
    for (uint256 i=0; i<bonusIntervals.length; i++) {
      endPeriods[i] = bonusIntervals[i].endPeriod;
      bonuss[i] = bonusIntervals[i].bonus;
    }
    return (endPeriods, bonuss);
  }

}
