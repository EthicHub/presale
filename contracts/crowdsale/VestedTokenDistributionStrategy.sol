pragma solidity ^0.4.18;

import './FixedPoolWithDiscountsTokenDistributionStrategy.sol';
import 'zeppelin-solidity/contracts/token/ERC20.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

/**
 * @title VestedTokenDistributionStrategy
 * @dev Strategy that distributes a fixed number of tokens among the contributors.
 * It's done in two steps. First, it registers all of the contributions while the sale is active.
 * After the crowdsale has ended the contract compensate buyers proportionally to their contributions.
 */
contract VestedTokenDistributionStrategy is Ownable, FixedPoolWithDiscountsTokenDistributionStrategy {


  event Released(address beneficiary, uint256 amount);
  event Log(string message);
  event Duration(string message, uint256 amount);
  //Time after which is allowed to compensates
  uint256 public vestingStart;
  bool public vestingConfigured = false;
  uint256 public vestingDuration;

  mapping (address => uint256) public released;


  modifier vestingPeriodStarted {
    require(crowdsale.hasEnded());
    require(vestingConfigured == true);
    require(now > vestingStart);
    _;
  }

  function VestedTokenDistributionStrategy(ERC20 _token, uint256 _rate)
            FixedPoolWithDiscountsTokenDistributionStrategy(_token, _rate) {

  }

  /**
   * set the parameters for the compensation. Required to call before compensation
   * @dev WARNING, ONE TIME OPERATION
   * @param _vestingStart we start allowing  the return of tokens after this
   * @param _vestingDuration percent each day (1 is 1% each day, 2 is % each 2 days, max 100)
   */
  function configureVesting(uint256 _vestingStart, uint256 _vestingDuration) onlyOwner {
    require(vestingConfigured == false);
    require(_vestingStart > crowdsale.endTime());
    require(_vestingDuration > 0);
    vestingStart = _vestingStart;
    vestingDuration = _vestingDuration;
    vestingConfigured = true;
  }

  /**
   * Will transfer the tokens vested until now to the beneficiary, if the vestingPeriodStarted
   * and there is an amount left to transfer
   * @param  _beneficiary crowdsale contributor
   */
   function compensate(address _beneficiary) public onlyOwner vestingPeriodStarted {
     uint256 unreleased = releasableAmount(_beneficiary);

     require(unreleased > 0);

     released[_beneficiary] = released[_beneficiary].add(unreleased);

     require(token.transfer(_beneficiary, unreleased));
     Released(_beneficiary,unreleased);

   }

  /**
   * Calculates how many tokens the beneficiary should get taking in account already
   * released
   * @param  _beneficiary the contributor
   * @return token number
   */
   function releasableAmount(address _beneficiary) public view returns (uint256) {
     return vestedAmount(_beneficiary).sub(released[_beneficiary]);
   }

  /**
   * Calculates how many tokens the beneficiary have vested
   * vested = how many does she have according to the time
   * @param  _beneficiary address of the contributor that needs the tokens
   * @return token
   */
  function vestedAmount(address _beneficiary) public view returns (uint256) {
    uint256 totalBalance = contributions[_beneficiary];
    //uint256 currentBalance = totalBalance.sub(released[_beneficiary]);
    //Duration("after",vestingStart.add(vestingDuration));
    if (now < vestingStart || vestingConfigured == false) {
      return 0;
    } else if (now >= vestingStart.add(vestingDuration)) {
      return totalBalance;
    } else {
      return totalBalance.mul(now.sub(vestingStart)).div(vestingDuration);
    }
  }

  function getReleased(address _beneficiary) public view returns (uint256) {
    return released[_beneficiary];
  }

}
