pragma solidity ^0.4.18;


import "minimetoken/contracts/MiniMeToken.sol";

contract EthixToken is MiniMeToken {
  string public constant name = "EthixToken";
  string public constant symbol = "ETX";
  uint8 public constant decimals = 18;

  //TODO set this
  uint256 public constant INITIAL_SUPPLY = 100000000 * (10 ** uint256(decimals));
  uint256 public totalSupply;

        tokenFactory = MiniMeTokenFactory(_tokenFactory);
        name = _tokenName;                                 // Set the name
        decimals = _decimalUnits;                          // Set the decimals
        symbol = _tokenSymbol;                             // Set the symbol
        parentToken = MiniMeToken(_parentToken);
        parentSnapShotBlock = _parentSnapShotBlock;
        transfersEnabled = _transfersEnabled;
        creationBlock = block.number;
  /**
   * @dev Constructor that gives msg.sender all of existing tokens.
   */
  function EthixToken() public {
    totalSupply = INITIAL_SUPPLY;
    balances[owner] = totalSupply;
  }

}
