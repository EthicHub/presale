import '../../contracts/crowdsale/FixedPoolWithBonusTokenDistributionStrategy.sol';

contract FixedPoolWithBonusTokenDistributionMock is FixedPoolWithBonusTokenDistributionStrategy {


  function FixedPoolWithBonusTokenDistributionMock(ERC20 _token, uint256 _rate)
           FixedPoolWithBonusTokenDistributionStrategy(_token,_rate)
  {
  }

  function addInterval(uint256 _end, uint256 _bonus) {
    bonusIntervals.push(BonusInterval(_end,_bonus));
  }

}
