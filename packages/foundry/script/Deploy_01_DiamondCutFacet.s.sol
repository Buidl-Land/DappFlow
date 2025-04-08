// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeployHelpers.s.sol";
import "../contracts/facets/DiamondCutFacet.sol";

contract DeployDiamondCutFacet is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // Deploy DiamondCutFacet
        DiamondCutFacet diamondCutFacet = new DiamondCutFacet();
        console.log("DiamondCutFacet deployed at:", address(diamondCutFacet));
        
        // Save deployment
        deployments.push(Deployment("DiamondCutFacet", address(diamondCutFacet)));
    }
} 