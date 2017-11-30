pragma solidity ^0.4.18;

import './crowdsale/CappedCompositeCrowdsale.sol';
import './crowdsale/RefundableCompositeCrowdsale.sol';
import './EthicHubTokenDistributionStrategy.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


contract EthicHubPresale is RefundableCompositeCrowdsale, CappedCompositeCrowdsale {

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
    Ownable()
    RefundableCompositeCrowdsale(_goal)
    CappedCompositeCrowdsale(_cap)
    CompositeCrowdsale(_startTime, _endTime, _wallet, _tokenDistribution)
  {

    //As goal needs to be met for a successful crowdsale
    //the value needs to less or equal than a cap which is limit for accepted funds
    require(_goal <= _cap);
  }

  //function configurePresale () {
    //uint256 startTime = now;
    //uint256 endTime = startTime + 40 days);
    //uint256 rate = 4;
    //uint256 cap = 30;
    //uint256 goal = 8;
    //SimpleToken fixedPoolToken = new SimpleToken();
    //uint256 totalSupply = fixedPoolToken.totalSupply;
    //EthicHubTokenDistributionStrategy tokenDistribution;

    //tokenDistribution = new TokenDistribution(fixedPoolToken.address,rate);
    //tokenDistribution = new TokenDistribution(fixedPoolToken.address,rate);

    //EthicHubPresale = new EthicHubPresale(startTime, endTime, goal, cap, wallet, tokenDistribution.address);
  //}
 //tokenDis = Ethi
 //ethic= EthicHubPresale(Ethi)
 //ethic.initIn



}
