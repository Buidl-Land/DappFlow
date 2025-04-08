// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeployHelpers.s.sol";
import "../contracts/facets/TaskMarketFacet.sol";

contract InitTaskMarket is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // Get deployer address from vm
        (, address deployerAddress,) = vm.readCallers();
        console.log("Deployer address:", deployerAddress);
        
        // Get Diamond address
        address diamond = 0x062618eCed9140c206f4240827440B53Ad1Bb230;
        require(diamond != address(0), "Diamond not deployed");
        
        // Initialize TaskMarket with Mock USDC
        address mockUSDC = 0xFd96B9fe317Dc8C2f9aE99a8aCB436EFBBAfe39E;
        require(mockUSDC != address(0), "MockUSDC not deployed");
        
        console.log("Initializing TaskMarket with Mock USDC:", mockUSDC);
        
        try TaskMarketFacet(diamond).initialize(mockUSDC) {
            console.log("TaskMarket initialized successfully");
        } catch Error(string memory reason) {
            console.log("Failed to initialize TaskMarket:", reason);
        }
    }
} 