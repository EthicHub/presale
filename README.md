# EthicHub presale

These contracts model the presale of the ETX token to be used as the future mean to finance projects in the [Ethic Hub](https://ethichub.com) crowdlending platform.

# Dates:
The presale will
- Start accepting purchases in NNNNNN date, ZZZZ timezone.
- Stop in ZZZ date.
- The vesting period for the tokens will start when the next token sale after this ends.
- The vesting period will end 100 days after.

# Milestones:
- The minimum amount of funds needed to consider the presale valid is 1500 ethers. If this value is not reached before the presale end date, the funds will be claimable by the investores and they will be refunded.

- The presale's hard cap is 6000 ethers. If that amount is reached the presale will be considered finished and no more purchases will be accepted.


# Token

#### Ethix Token (ETX)

- A finite number of XXXXX ETX will be pre-minted.
- There will be no more ETX tokens created.
- The ETX will be ERC20 compatible.
- The ETX token will have 18 decimals.
- _The tokens will be sent to the investors AFTER the 1st ICO date, and not before_, folloring a gradual release explained in the correspondent section.

#### Distribution

- YY% of XXXX tokens will be sold in the presale:

|            | Presale |
|------------|---------|
| Investors  | 13%     |
| To be sold | 45%     |
| Reserve    | 20%     |
| Promoters  | 20%     |
| Bounties   | 2%      |

#### Price

- The rate will be of ZZZZ tokens per ether.
- There will be a discount for early purchases, following this table:
| Days after presale start | Discount |
|--------------------------|----------|
| 1                        | 10%      |
| 2                        | 8%       |
| 3                        | 6%       |
| 4                        | 4%       |
| 5                        | 2%       |

After the 5th day, there will be no discount.

#### Whitelists

- Purchases done through a whitelisted wallet will have a discount of 20%.
- The manager of the wallet will receive a 5% token comission.
- To open a whitelist the wallet will have to do a deposit of 5 ethers.

# Token vesting

- Ethix Tokens will not be sent to the investors wallet inmediately after purchase.
- The vesting sschedule will be..
|
|
------
- After a vesting period, and deppending on the ether price, the investors will receive ///once a day\\\


# Security considerations

The smart contracts are audited by:
-
-
...

The funds will be stored in a [Gnosis multisig wallet](https://wallet-website.gnosis.pm/) if the minimum amount of funds is reached. If not, the funds will be stored in an [OpenZeppelin's RefundVault smart contract](https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/crowdsale/RefundVault.sol)





[Open Zeppelin](https://github.com/OpenZeppelin/zeppelin-solidity) offers a collection of base contracts for crowdsale and tokens.

We will study using [Minime token](https://github.com/Giveth/minime) for our ERC20 token (for its cloneable/ updatable capabilities).
