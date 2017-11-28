pragma solidity ^0.4.11;

import '../../contracts/crowdsale/CappedCompositeCrowdsale.sol';

contract CappedCompositeCrowdsaleImpl is CappedCompositeCrowdsale {

  function CappedCompositeCrowdsaleImpl (
    uint256 _startTime,
    uint256 _endTime,
    address _wallet,
    TokenDistributionStrategy _tokenDistribution,
    uint256 _cap
  )
    CompositeCrowdsale(_startTime, _endTime, _wallet, _tokenDistribution)
    CappedCompositeCrowdsale(_cap)
  {
  }

}
