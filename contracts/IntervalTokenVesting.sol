pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/ERC20Basic.sol';
import 'zeppelin-solidity/contracts/token/SafeERC20.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

/**
 * @title IntervalTokenVesting
 * @dev A token holder contract that can release its token balance gradually like a
 * typical vesting scheme, with a period duration and number of periods. Optionally revocable by the
 * owner.
 */
contract IntervalTokenVesting is Ownable {
  using SafeMath for uint256;
  using SafeERC20 for ERC20Basic;

  event Released(uint256 amount);
  event Revoked();

  // beneficiary of tokens after they are released
  address public beneficiary;

  uint256 public start;
  uint256 public periodDuration;
  uint256 public numPeriods;

  bool public revocable;

  mapping (address => uint256) public released;
  mapping (address => bool) public revoked;

  /**
   * @dev Creates a vesting contract that vests its balance of any ERC20 token to the
   * _beneficiary, gradually in a linear fashion until _start + _duration. By then all
   * of the balance will have vested.
   * @param _beneficiary address of the beneficiary to whom vested tokens are transferred
   * @param _periodDuration duration in seconds of a period in which the tokens will vest
   * @param _numPeriods number of periods in which the tokens will vest
   * @param _revocable whether the vesting is revocable or not
   */
  function TokenVesting(address _beneficiary, uint256 _start, uint256 _periodDuration, uint256 _numPeriods, bool _revocable) {
    require(_beneficiary != address(0));
    require(_periodDuration > 0);
    require(_numPeriods > 0 );

    beneficiary = _beneficiary;
    revocable = _revocable;
    periodDuration = _periodDuration;
    numPeriods = _numPeriods;
    start = _start;
  }

  /**
   * @notice Transfers vested tokens to beneficiary.
   * @param token ERC20 token which is being vested
   */
  function release(ERC20Basic token) public {
    uint256 unreleased = releasableAmount(token);

    require(unreleased > 0);

    released[token] = released[token].add(unreleased);

    token.safeTransfer(beneficiary, unreleased);

    Released(unreleased);
  }

  /**
   * @notice Allows the owner to revoke the vesting. Tokens already vested
   * remain in the contract, the rest are returned to the owner.
   * @param token ERC20 token which is being vested
   */
  function revoke(ERC20Basic token) public onlyOwner {
    require(revocable);
    require(!revoked[token]);

    uint256 balance = token.balanceOf(this);

    uint256 unreleased = releasableAmount(token);
    uint256 refund = balance.sub(unreleased);

    revoked[token] = true;

    token.safeTransfer(owner, refund);

    Revoked();
  }

  /**
   * @dev Calculates the amount that has already vested but hasn't been released yet.
   * @param token ERC20 token which is being vested
   */
  function releasableAmount(ERC20Basic token) public constant returns (uint256) {
    return vestedAmount(token).sub(released[token]);
  }

  /**
   * @dev Calculates the amount that has already vested.
   * @param token ERC20 token which is being vested
   */
  function vestedAmount(ERC20Basic token) public constant returns (uint256) {
    uint256 currentBalance = token.balanceOf(this);
    uint256 totalBalance = currentBalance.add(released[token]);
    uint256 vestedPeriods = 0;
    if (revoked[token]){
        return totalBalance;
    }
    for(uint i=numPeriods; i>=1; i--){
        if (now >= start + periodDuration.mul(i)){
            vestedPeriods = i;
            break;
        }
    }
    return totalBalance.mul(vestedPeriods).div(numPeriods);
  }
}
