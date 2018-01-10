#!/bin/bash
SCRIPT_PATH="./scripts/test.sh"


mainmenu () {
  echo "-> Insert number of test suite:"
  echo "1 - EthicHubPresale"
  echo "2 - CappedCompositeCrowdsale"
  echo "3 - FixedPoolWithDiscountsTokenDistribution"
  echo "4 - FinalizableCompositeCrowdsale"
  echo "5 - FixedPoolWithDiscountsTokenDistribution"
  echo "6 - IntervalTokenVesting"
  echo "7 - RefundableCompositeCrowdsale"
  echo "8 - VestedTokenDistributionStrategy"
  echo "x - exit program"

  read  -n 1 -p "Input Selection:" mainmenuinput
  if [ "$mainmenuinput" = "1" ]; then
            bash $SCRIPT_PATH test/EthicHubPresale.js
        elif [ "$mainmenuinput" = "2" ]; then
            bash $SCRIPT_PATH test/CappedCompositeCrowdsale.js test/helpers/CappedCompositeCrowdsaleImpl.sol
        elif [ "$mainmenuinput" = "3" ]; then
            bash $SCRIPT_PATH test/FixedPoolWithDiscountsTokenDistribution.js test/helpers/FixedPoolWithDiscountsTokenDistributionMock.sol
        elif [ "$mainmenuinput" = "4" ]; then
            bash $SCRIPT_PATH test/FinalizableCompositeCrowdsale.js test/helpers/CappedCompositeCrowdsaleImpl.sol test/helpers/FinalizableCompositeCrowdsaleImpl.sol
        elif [ "$mainmenuinput" = "5" ]; then
            bash $SCRIPT_PATH test/FixedPoolWithDiscountsTokenDistribution.js test/helpers/FixedPoolWithDiscountsTokenDistributionMock.sol
        elif [ "$mainmenuinput" = "6" ];then
            bash $SCRIPT_PATH test/IntervalTokenVesting.js
        elif [ "$mainmenuinput" = "7" ];then
            bash $SCRIPT_PATH test/RefundableCompositeCrowdsale.js test/helpers/RefundableCompositeCrowdsaleImpl.sol
        elif [ "$mainmenuinput" = "8" ];then
            bash $SCRIPT_PATH test/VestedTokenDistributionStrategy.js
        elif [ "$mainmenuinput" = "x" ];then
            exit 0
        else
            echo "You have entered an invallid selection!"
            echo "Please try again!"
            echo ""
            echo "Press any key to continue..."
            read -n 1
            clear
            mainmenu
        fi
}

mainmenu