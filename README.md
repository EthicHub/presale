# presale
Smart contracts and audits for presale token.

## Install

1. Install node
```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.6/install.sh | bash
```
2. Install truffle
```
npm install -g truffle
```
3. Install an ethereum client:

### TestRPC (for faster testing)
```
npm install -g ethereumjs-testrpc
```

### Full client (for example geth)
```
sudo apt-get install software-properties-common
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install ethereum
```

## User stories:
![Trello](https://trello.com/b/AUWDp2a0/devpresale)

## Modus operandi

We are going to follow DRY principles and use proven, tested and audited code when we can and makes sense.

![Open Zeppelin](https://github.com/OpenZeppelin/zeppelin-solidity) offers a collection of base contracts for crowdsale and tokens.

We will study using ![Minime token] (https://github.com/Giveth/minime) for our ERC20 token (for its cloneable/ updatable capabilities).
