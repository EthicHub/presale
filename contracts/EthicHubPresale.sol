pragma solidity ^0.4.15;

import './IntervalTokenVesting.sol';
import 'zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


contract EthicHubPresale is CappedCrowdsale, Ownable {

  // vesting constants
  uint256 constant vestingNumPeriods = 4;
  uint256 constant vestingPeriodDuration = 26 weeks;
  bool constant vestingRevocable = true;

  /**
   * @dev since our wei/token conversion rate is different, we implement it separatedly
   *      from Crowdsale
   * [EthicHubPresale description]
   * @param       _startTime start time in unix timestamp format
   * @param       _endTime time in unix timestamp format
   * @param       _goal minimum wei amount to consider the project funded.
   * @param       _cap maximum amount the crowdsale will accept.
   * @param       _wallet where funds are collected
   */
  function EthicHubPresale(uint256 _startTime, uint256 _endTime, uint256 _goal, uint256 _cap, address _wallet)
    Ownable()
    CappedCrowdsale(_cap)
    Crowdsale(_startTime, _endTime, 1, _wallet)
  {

    //As goal needs to be met for a successful crowdsale
    //the value needs to less or equal than a cap which is limit for accepted funds
    require(_goal <= _cap);
  }

  function createVesting(address beneficiary, uint256 startTime) external onlyOwner {
    new IntervalTokenVesting(beneficiary, startTime, vestingNumPeriods, vestingPeriodDuration, vestingRevocable);
  }

  function revoceVesting (address vestingAddress){
    IntervalTokenVesting vestingContract = IntervalTokenVesting(vestingAddress);
    vestingContract.revoke(token);
  }
}
