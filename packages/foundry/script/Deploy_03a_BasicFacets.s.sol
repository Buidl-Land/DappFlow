// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeployHelpers.s.sol";
import "../contracts/facets/AccessControlFacet.sol";
import "../contracts/facets/ProjectFacet.sol";

contract DeployBasicFacets is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // Deploy Basic Facets
        AccessControlFacet accessControlFacet = new AccessControlFacet();
        ProjectFacet projectFacet = new ProjectFacet();
        
        // Save deployments
        deployments.push(Deployment("AccessControlFacet", address(accessControlFacet)));
        deployments.push(Deployment("ProjectFacet", address(projectFacet)));
        
        console.log("AccessControlFacet deployed at:", address(accessControlFacet));
        console.log("ProjectFacet deployed at:", address(projectFacet));
    }
} 