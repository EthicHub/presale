pragma solidity ^0.4.18;

import './crowdsale/CappedCompositeCrowdsale.sol';
import './crowdsale/RefundableCompositeCrowdsale.sol';
import './EthicHubTokenDistributionStrategy.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './EthixToken.sol';

contract EthicHubPresale is CappedCompositeCrowdsale,RefundableCompositeCrowdsale {
  //TODO hardcoding of parameters
  /**
   * @dev since our wei/token conversion rate is different, we implement it separatedly
   *      from Crowdsale
   * [EthicHubPresale description]
   * @param       _startTime start time in unix timestamp format
   * @param       _endTime time in unix timestamp format
   * @param       _goal minimum wei amount to consider the project funded.
   * @param       _cap maximum amount the crowdsale will accept.
   * @param       _wallet where funds are collected.
   * @param       _tokenDistribution Strategy to distributed tokens.
   */
  function EthicHubPresale(uint256 _startTime, uint256 _endTime, uint256 _goal, uint256 _cap, address _wallet, EthicHubTokenDistributionStrategy _tokenDistribution)
    CompositeCrowdsale(_startTime, _endTime, _wallet, _tokenDistribution)
    CappedCompositeCrowdsale(_cap)
    RefundableCompositeCrowdsale(_goal)
  {

    //As goal needs to be met for a successful crowdsale
    //the value needs to less or equal than a cap which is limit for accepted funds
    require(_goal <= _cap);
  }

  function claimRefund() public {
    super.claimRefund();
  }



}
