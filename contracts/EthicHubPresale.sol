pragma solidity ^0.4.18;

import './crowdsale/CompositeCrowdsale.sol';
import './crowdsale/CappedCompositeCrowdsale.sol';
import './crowdsale/RefundableCompositeCrowdsale.sol';
import './EthicHubTokenDistributionStrategy.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';
import './EthixToken.sol';

contract EthicHubPresale is Ownable, Pausable, CappedCompositeCrowdsale, RefundableCompositeCrowdsale {
  //TODO hardcoding of parameters
  uint256 public constant minimumBidAllowed = 0.25 ether;
  uint256 public constant maximumBidAllowed = 500 ether;

  uint public constant GAS_LIMIT_IN_WEI = 50000000000 wei; // limit gas price -50 Gwei wales stopper

  mapping(address=>uint) public participated;

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

  /**
   * We enforce a minimum purchase price and a maximum investemnt per wallet
   * @return valid
   */
  function buyTokens(address beneficiary) whenNotPaused payable {
    //require(tx.gasprice <= GAS_LIMIT_IN_WEI);
    require(msg.value >= minimumBidAllowed);
    require(participated[msg.sender].add(msg.value) <= maximumBidAllowed);
    participated[msg.sender] = participated[msg.sender].add(msg.value);

    super.buyTokens(beneficiary);
  }

  /**
  * Get user invested amount by his address, used to calculate user referral contribution
  * @return total invested amount
  */
  function getInvestedAmount(address investor) view public returns(uint investedAmount){
    investedAmount = participated[investor];
  }
}
