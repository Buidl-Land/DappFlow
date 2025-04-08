// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeployHelpers.s.sol";
import "../contracts/facets/AccessControlFacet.sol";

contract GrantRoles is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // Get deployer address from vm
        (, address deployerAddress,) = vm.readCallers();
        console.log("Deployer address:", deployerAddress);
        
        // Get Diamond address
        address diamond = 0x062618eCed9140c206f4240827440B53Ad1Bb230;
        require(diamond != address(0), "Diamond not deployed");
        
        // Check admin status
        bool isAdmin = AccessControlFacet(diamond).isAdmin(deployerAddress);
        console.log("Is deployer admin?", isAdmin);
        require(isAdmin, "Deployer must be admin");
        
        // Set up roles
        bytes32 PROJECT_CREATOR_ROLE = AccessControlFacet(diamond).PROJECT_CREATOR_ROLE();
        bytes32 TASK_CREATOR_ROLE = AccessControlFacet(diamond).TASK_CREATOR_ROLE();
        bytes32 FUNDING_MANAGER_ROLE = AccessControlFacet(diamond).FUNDING_MANAGER_ROLE();
        
        // Grant roles to deployer
        try AccessControlFacet(diamond).grantRole(PROJECT_CREATOR_ROLE, deployerAddress) {
            console.log("PROJECT_CREATOR_ROLE granted to deployer");
        } catch Error(string memory reason) {
            console.log("Failed to grant PROJECT_CREATOR_ROLE:", reason);
        }
        
        try AccessControlFacet(diamond).grantRole(TASK_CREATOR_ROLE, deployerAddress) {
            console.log("TASK_CREATOR_ROLE granted to deployer");
        } catch Error(string memory reason) {
            console.log("Failed to grant TASK_CREATOR_ROLE:", reason);
        }
        
        try AccessControlFacet(diamond).grantRole(FUNDING_MANAGER_ROLE, deployerAddress) {
            console.log("FUNDING_MANAGER_ROLE granted to deployer");
        } catch Error(string memory reason) {
            console.log("Failed to grant FUNDING_MANAGER_ROLE:", reason);
        }
    }
} 