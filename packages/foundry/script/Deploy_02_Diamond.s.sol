// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeployHelpers.s.sol";
import "../contracts/core/Diamond.sol";

contract DeployDiamond is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // 获取正确的部署者地址
        (, address deployerAddress,) = vm.readCallers();
        console.log("Deployer address:", deployerAddress);
        console.log("tx.origin:", tx.origin);
        console.log("msg.sender:", msg.sender);

        // 使用新部署的 DiamondCutFacet 地址
        address diamondCutFacet = 0x234DC1d8548655980055dCa81Bc3c0b4AadD3A68;
        console.log("Using DiamondCutFacet at:", diamondCutFacet);
        
        // 使用正确的 deployerAddress 部署 Diamond
        Diamond diamond = new Diamond(deployerAddress, diamondCutFacet);
        console.log("Diamond deployed at:", address(diamond));
        
        // Save deployment
        deployments.push(Deployment("Diamond", address(diamond)));
    }
} 