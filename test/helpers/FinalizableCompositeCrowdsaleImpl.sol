pragma solidity ^0.4.11;


import '../../contracts/crowdsale/FinalizableCompositeCrowdsale.sol';


contract FinalizableCompositeCrowdsaleImpl is FinalizableCompositeCrowdsale {

  function FinalizableCompositeCrowdsaleImpl (
    uint256 _startTime,
    uint256 _endTime,
    address _wallet,
    TokenDistributionStrategy _tokenDistribution
  )
    CompositeCrowdsale(_startTime, _endTime, _wallet, _tokenDistribution)
    FinalizableCompositeCrowdsale()
  {
  }

}
