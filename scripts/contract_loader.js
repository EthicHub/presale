'use-strict';
var temp = require("temp").track();
const path = require('path');



var Web3EthContract = require('web3-eth-contract');
module.exports = function(contractName, contractAddress, web3) {
    const jsonPath = path.join(__dirname,`../build/contracts/${contractName}.json`);
    const contract_data = require(jsonPath);
    if (contract_data === undefined) {
        throw Error(`No contract named ${contractName} in ${jsonPath}`);
    }
    Web3EthContract.setProvider(web3);
    return new Web3EthContract(contract_data.abi, contractAddress);
}
