pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/RefundableCrowdsale.sol';


contract EthicHubPresale is CappedCrowdsale, RefundableCrowdsale {

  /**
   * @dev since our wei/token conversion rate is different, we implement it separatedly
   *      from Crowdsale
   * [EthicHubPresale description]
   * @param       {[type]} uint256 start time in unix timestamp format
   * @param       {[type]} uint256 end time in unix timestamp format
   * @param       {[type]} uint256 minimum wei amount to consider the project funded.
   * @param       {[type]} uint256 maximum amount the crowdsale will accept.
   * @param       {[type]} address where funds are collected
   * @constructor
   */
  function EthicHubPresale(uint256 _startTime, uint256 _endTime, uint256 _goal, uint256 _cap, address _wallet)
    CappedCrowdsale(_cap)
    FinalizableCrowdsale()
    RefundableCrowdsale(_goal)
    Crowdsale(_startTime, _endTime, 0, _wallet)
  {
    //As goal needs to be met for a successful crowdsale
    //the value needs to less or equal than a cap which is limit for accepted funds
    require(_goal <= _cap);
  }

  /**
   * @dev Finalization logic
   */
  function finalization() internal {
    super.finalization();
  }
}
