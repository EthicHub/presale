# We moved to gitlab. [Check us here!](https://gitlab.com/EthicHub)



# EthicHub 1st Token Sale (presale.)

These contracts model the presale of the ETHIX token to be used as the future mean to finance positive impact projects in the [Ethic Hub](https://ethichub.com) decentralized crowdlending platform.


There are 4 planed token sales. 15% of the tokens are planned to be sold in each Token Sale, 13% for Investors and 2% for Bounties.
Tokens not sold on each Token Sale will be sold in following token sales.
Price for the 2nd Token Sale will be 4x the price of the presale or 1st Token Sale.
Tokens of presale or 1st Token Sale and 2nd Token Sale will be gradually realesed after 2nd Token Sale.
3rd and 4th Token Sales price will be set up by [Vitalik Butterin Interactive Coin Offering Mechanism](https://drive.google.com/viewerng/viewer?url=https://people.cs.uchicago.edu/~teutsch/papers/ico.pdf).

# KYC

_In order to receive the tokens_, investors will have to pass a KYC proccess.

# Dates:
The presale or 1st Token sale will
- Start accepting whitelisted purchases on Wednesday, 7th of February, 14:00 CET (UTC+1h)
- Start accepting all purchases in Thursday, 8th of February, 14:00 CET (UTC+1h)
- Stop in Saturday, 10th of March, 14:00 CET (UTC+1h) (30 days after start date) or when the hardcap reached.


# Milestones:
- The minimum amount of funds needed to consider the presale valid is 500 ETH
If this value is not reached before the presale end date, the funds will be claimable by the investors and they will be refunded.

- The presale's hard cap is 2000 ETH. If that amount is reached the presale will be considered finished and no more purchases will be accepted.



# Token

#### Ethix Token (ETX)

- A finite number of 100,000,000 ETX will be minted.
- There will be no more ETX tokens created.
- The ETX will be ERC20 compatible.
- The ETX token will have 18 decimals.

_The tokens will be sent to the investors AFTER the end of the 1st Token Sale date, and not before_, following a gradual release schedule explained in the correspondent section.


#### Distribution

- 13% of total tokens will be sold in the presale or 1st Token Sale:

|                   | Presale |
|-------------------|---------|
| Investors         | 13%     |
| Reserve           | 20%     |
| Promoters (team)  | 20%     |
| Bounties          | 2%      |
| For next sales    | 45%     |


#### Price

- For the Presale of 1st Token Sale the rate will be of 5000 tokens per ether.

There will be a discount for early purchases, following this table:

| Days after presale start | Discount |
|--------------------------|----------|
| 1                        | 10%      |
| 2                        | 8%       |
| 3                        | 6%       |
| 4                        | 4%       |
| 5                        | 2%       |

After the 5th day, there will be no discount.

If included in the

#### Whitelists

Whitelist closed.

Investors that register will provide.
- Valid email.
- Amount to invest in ethers.

After that, they will have to pass the KYC proccess in order to receive the tokens and register an ERC20 token compatible wallet.

When the 1st token sale starts, if the investors buy tokens with the same wallet registered in the presale sending an equal or higher amount of ethers than stated previously, _they will get a 30% discount purchasing tokens_ (not accumulable with they day discounts described previously).

The crowdsale contracts will accept only whitelisted purchases from Wednesday, 7th of February, 14:00 CET (UTC+1h) for 24h. After that all purchases will be allowed.

Joining the whitelist does not mean the tokens are reserved.

<a name="token vesting"> # Token vesting </a>

- Ethix Tokens will not be sent to the investors wallet inmediately after purchase.
-The vesting period for the tokens sold during the presale or 1st Token Sale after the presale will start when the next token sale or 2nd Token Sale ends.
- 2nd Token sale will start in Q3 2018.
The vesting period will end 100 days after 2nd Token Sale ends


The token release schedule will be 100 days long with 10 token sending events, corresponding to :

```
TokensReceivedInEvent = (totalTokensBought * ( eventTime - tokenVestingStart ) / 100) - tokensAlreadySentToBuyer
```




# Project Promoters Tokens

The Ethic Hub team will have 2 years vesting of their tokens with 6 months cliffs.

# Security considerations:

The smart contracts are audited by:
- [Jakub Wojciechowski](https://www.linkedin.com/in/jakub-wojciechowski-5901b68)



The funds will be stored in a [Gnosis multisig wallet](https://wallet-website.gnosis.pm/) if the minimum amount of funds is reached.

In case we don't reach the minimum amount, the funds will be stored in an [OpenZeppelin's RefundVault smart contract](https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/crowdsale/RefundVault.sol)

If the token sale ends without reaching the minimum goal, the funds will be refundable.

The _ONLY VALID ETHEREUM ADDRESS_ to send funds to is the one showed the presale website after the KYC proccess is completed. Don't send Ether to any other address.
