pragma solidity ^0.4.18;


import 'zeppelin-solidity/contracts/token/StandardToken.sol';

contract EthixToken is StandardToken {
  string public constant name = "EthixToken";
  string public constant symbol = "ETX";
  uint8 public constant decimals = 18;

  uint256 public constant INITIAL_SUPPLY = 10000 * (10 ** uint256(decimals));

  /**
   * @dev Constructor that gives msg.sender all of existing tokens.
   */
  function EthixToken() public {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }

}
