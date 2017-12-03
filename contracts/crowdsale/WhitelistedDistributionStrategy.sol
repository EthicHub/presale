pragma solidity 0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './VestedTokenDistributionStrategy.sol';

/**
 * @title WhitelistedDistributionStrategy
 * @dev This is an extension to add whitelist to a token distributionStrategy
 *
 */
contract WhitelistedDistributionStrategy is Ownable, VestedTokenDistributionStrategy {
    uint256 rate_for_investor;
    mapping(address=>uint) public registeredAmount;

    event RegistrationStatusChanged(address target, bool isRegistered);

    function WhitelistedDistributionStrategy(ERC20 _token, uint256 _rate, uint256 _rate_for_investor)
              VestedTokenDistributionStrategy(_token,_rate){
        rate_for_investor = _rate_for_investor;
    }

    /**
     * @dev Changes registration status of an address for participation.
     * @param target Address that will be registered/deregistered.
     * @param amount the amount of eht to invest for a investor discount.
     */
    function changeRegistrationStatus(address target, uint256 amount)
        public
        onlyOwner
    {
        registeredAmount[target] = amount;
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
    function changeRegistrationStatuses(address[] targets, uint256[] amounts)
        public
        onlyOwner
    {
        for (uint i = 0; i < targets.length; i++) {
            changeRegistrationStatus(targets[i], amounts[i]);
        }
    }

    /**
     * @dev overriding calculateTokenAmount for whilelist investors
     * @return discounted rate if it applies for the investor,
     * otherwise, return token amount according to super class
     */

    function calculateTokenAmount(uint256 _weiAmount) view returns (uint256 tokens) {
        if (_weiAmount >= registeredAmount[msg.sender] && registeredAmount[msg.sender] > 0 ){
            tokens = _weiAmount.mul(rate_for_investor);
        } else{
            tokens = super.calculateTokenAmount(_weiAmount);
        }
    }
}
