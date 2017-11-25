pragma solidity 0.4.15;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

/**
 * @title WhitelistedCrowdsale
 * @dev This is an extension to add whitelist to a crowdsale
 *
 */
contract WhitelistedCrowdsale is Ownable {
    
    mapping(address=>uint) public registeredAmount;

    event RegistrationStatusChanged(address target, bool isRegistered);

    /**
     * @dev Changes registration status of an address for participation.
     * @param target Address that will be registered/deregistered.
     * @param amount the amount of eht to invest for a investor discount.
     */
    function changeRegistrationStatus(address target, uint256 amount)
        public
        onlyOwner
    {
        registered[target] = amount;
        if (amount > 0){
            RegistrationStatusChanged(target, true);
        }else{
            RegistrationStatusChanged(target, false);
        }
    }

    /**
     * @dev Changes registration statuses of addresses for participation.
     * @param targets Addresses that will be registered/deregistered.
     * @param amounts the list of amounts of eth for every investor to invest for a investor discount.
     */
    function changeRegistrationStatuses(address[] targets, uint256[] amounts )
        public
        onlyOwner
    {
        for (uint i = 0; i < targets.length; i++) {
            changeRegistrationStatus(targets[i], amounts[i]);
        }
    }

    /**
     * @dev overriding Crowdsale#getRage for whilelist investors
     * @return discounted rate if it applies fot the investor
     * WIP
     * WIP
     */

    function calculateTokenAmount(uint256 _weiAmount, uint256 _rate) constant returns (uint256 tokens) {
        if (registered[msg.sender] > 0){
            tokens = _weiAmount.mul(_rate).mul(RATE_FOR_INVESTOR);
        }else{
            tokens = _weiAmount.mul(_rate);
        }
    }
}
