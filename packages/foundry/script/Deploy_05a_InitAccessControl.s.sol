// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeployHelpers.s.sol";
import "../contracts/facets/AccessControlFacet.sol";
import "../contracts/libraries/LibDiamond.sol";

contract InitAccessControl is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // 获取正确的部署者地址
        (, address deployerAddress,) = vm.readCallers();
        console.log("Deployer address:", deployerAddress);
        
        // Diamond 合约地址
        address diamond = 0x062618eCed9140c206f4240827440B53Ad1Bb230;
        require(diamond != address(0), "Diamond not deployed");
        
        console.log("Initializing AccessControl at Diamond:", diamond);
        
        // 检查是否已初始化
        bool isAdmin = AccessControlFacet(diamond).isAdmin(deployerAddress);
        console.log("Is deployer admin?", isAdmin);
        
        if (!isAdmin) {
            // 初始化 AccessControl
            try AccessControlFacet(diamond).initializeAccessControl(deployerAddress) {
                console.log("AccessControl initialized with deployerAddress");
                isAdmin = AccessControlFacet(diamond).isAdmin(deployerAddress);
                console.log("Is deployer admin now?", isAdmin);
            } catch Error(string memory reason) {
                console.log("Failed to initialize AccessControl:", reason);
                revert(reason);
            }
        } else {
            console.log("AccessControl already initialized");
        }
    }
} 