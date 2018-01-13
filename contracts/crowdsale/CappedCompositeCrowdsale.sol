pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './CompositeCrowdsale.sol';

/**
 * @title CappedCompositeCrowdsale
 * @dev Extension of CompositeCrowdsale with a max amount of funds raised
 */
contract CappedCompositeCrowdsale is CompositeCrowdsale {
  using SafeMath for uint256;

  uint256 public cap;

  function CappedCompositeCrowdsale(uint256 _cap) public {
    require(_cap > 0);
    cap = _cap;
  }

  // overriding Crowdsale#validPurchase to add extra cap logic
  // @return true if investors can buy at the moment
  function validPurchase() internal view returns (bool) {
    bool withinCap = weiRaised.add(msg.value) <= cap;
    return withinCap && super.validPurchase();
  }

  // overriding Crowdsale#hasEnded to add cap logic
  // @return true if crowdsale event has ended
  function hasEnded() public view returns (bool) {
    bool capReached = weiRaised >= cap;
    return super.hasEnded() || capReached;
  }

}
