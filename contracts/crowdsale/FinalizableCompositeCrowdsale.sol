pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './CompositeCrowdsale.sol';

/**
 * @title FinalizableCompositeCrowdsale
 * @dev Extension of CompositeCrowdsale where an owner can do extra work
 * after finishing.
 */
contract FinalizableCompositeCrowdsale is CompositeCrowdsale {
  using SafeMath for uint256;

  bool public isFinalized = false;

  event Finalized();

  /**
   * @dev Must be called after crowdsale ends, to do some extra finalization
   * work. Calls the contract's finalization function.
   */
  function finalize() onlyOwner public {
    require(!isFinalized);
    require(hasEnded());

    finalization();
    Finalized();

    isFinalized = true;
  }

  /**
   * @dev Can be overridden to add finalization logic. The overriding function
   * should call super.finalization() to ensure the chain of finalization is
   * executed entirely.
   */
  function finalization() internal {
    this.tokenDistribution.disposeOfUnsoldTokens();
  }
}
