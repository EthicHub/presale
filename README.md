
# NOTE: These contracts are in the auditing proccess, the presale or whitelist are not yet active.


# EthicHub 1st Token Sale (presale.)

These contracts model the presale of the ETX token to be used as the future mean to finance positive impact projects in the [Ethic Hub](https://ethichub.com) decentralized crowdlending platform.


There are 4 planed token sales. 15% of the tokens are planned to be sold in each Token Sale, 13% for Investors and 2% for Bounties.
Tokens not sold on each Token Sale will be sold in following ---> Token Sales or kept as . <--
Price for the 2nd Token Sale will be 4x the price of the presale or 1st Token Sale.
Tokens of presale or 1st Token Sale and 2nd Token Sale will be gradually realesed after 2nd Token Sale.
3rd and 4th Token Sales price will be set up by [Vitalik Butterin Interactive Coin Offering Mechanism](https://drive.google.com/viewerng/viewer?url=https://people.cs.uchicago.edu/~teutsch/papers/ico.pdf).

# KYC

_In order to receive the tokens_, investors will have to pass a KYC proccess.

# Dates:
The presale or 1st Token sale will
- Start accepting purchases in {PRESALE_START}
- Stop in {PRESALE_START + 30 days} date.
-

# Milestones:
- The minimum amount of funds needed to consider the presale valid is 1250 ETH
If this value is not reached before the presale end date, the funds will be claimable by the investors and they will be refunded.

- The presale's hard cap is 2.750 ETH. If that amount is reached the presale will be considered finished and no more purchases will be accepted.



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

- For the Presale of 1st Token Sale the rate will be of 4000 tokens per ether.

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

There will be a whitelist period open from {WHITELIST_PERIOD}.
The whitelist will finish in {PRESALE_START - 2 days}.
If the whitelist reached an exected investment amount of {GOAL}, the presale list will close.

Investors that register will provide.
- Valid email.
- Amount to invest in ethers.

After that, they will have to pass the KYC proccess in order to receive the tokens and register an ERC20 token compatible wallet.

When the 1st token sale starts, if the investors buy tokens with the same wallet registered in the presale sending an equal or higher amount of ethers than stated previously, _they will get a 20% discount purchasing tokens_ (not accumulable with they day discounts described previously).

<a name="token vesting"> # Token vesting </a>

- Ethix Tokens will not be sent to the investors wallet inmediately after purchase.
-The vesting period for the tokens sold during the presale or 1st Token Sale will start when the next token sale or 2nd Token Sale ends.
- 2nd Token sale will start about 200 days after the end of the presale or 1st Token Sale.
The vesting period will end 100 days after.


The vesting sschedule will be..
{{VESTING_SCHEDULE TBD , pending cost analysis of sending tokens}}

- After a vesting period, and deppending on the ether price, the investors will receive {{TOKEN_FREQUENCY}}



# Project Promoters Tokens

The Ethic Hub team will have 2 years vesting of their tokens with 6 months cliffs.

# Security considerations:

The smart contracts are audited by:
-
...


The funds will be stored in a [Gnosis multisig wallet](https://wallet-website.gnosis.pm/) if the minimum amount of funds is reached.

In case we don't reach the minimum amount, the funds will be stored in an [OpenZeppelin's RefundVault smart contract](https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/crowdsale/RefundVault.sol)

If the token sale ends without reaching the minimum goal, the funds will be refundable.

The _ONLY VALID ETHEREUM ADDRESS_ to send funds to is the one showed the presale website after the KYC proccess is completed. Don't send Ether to any other address.
