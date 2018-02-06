const EthixToken = artifacts.require('EthixToken.sol');


const configurations = {
  rinkeby: {
    wallet: "0xD2E416f6cCe2beb363A04B4d947213DdCa757EA0",
  },
  develop: {
    wallet: "0x821aea9a577a9b44299b9c15c88cf3087f3b5544",

  },
  deploy: {
    wallet: "",
  }
}


module.exports = function(deployer,network, accounts) {
  console.log("--> Retrieving token");
  if (network === "development") {
      network = "develop";
      console.log("TestRPC/Ganache network, not deploying for tests");
      return;
  }
  EthixToken.deployed().then(function(token) {
    token.balanceOf(accounts[0]).then((restOfTheTokens) => {
      console.log("--> Transfering the remaining "+restOfTheTokens+" to multisig");
      token.transfer(config.wallet, restOfTheTokens).then( () => {
        console.log("--> Tokens secured");
      });
    });
  });
};


