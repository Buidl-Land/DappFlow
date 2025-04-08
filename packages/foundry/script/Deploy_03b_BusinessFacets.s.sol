// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeployHelpers.s.sol";
import "../contracts/facets/CrowdfundingFacet.sol";
import "../contracts/facets/ProjectTokenFacet.sol";
import "../contracts/facets/TaskMarketFacet.sol";

contract DeployBusinessFacets is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // Deploy Business Facets
        CrowdfundingFacet crowdfundingFacet = new CrowdfundingFacet();
        ProjectTokenFacet projectTokenFacet = new ProjectTokenFacet();
        TaskMarketFacet taskMarketFacet = new TaskMarketFacet();
        
        // Save deployments
        deployments.push(Deployment("CrowdfundingFacet", address(crowdfundingFacet)));
        deployments.push(Deployment("ProjectTokenFacet", address(projectTokenFacet)));
        deployments.push(Deployment("TaskMarketFacet", address(taskMarketFacet)));
        
        console.log("CrowdfundingFacet deployed at:", address(crowdfundingFacet));
        console.log("ProjectTokenFacet deployed at:", address(projectTokenFacet));
        console.log("TaskMarketFacet deployed at:", address(taskMarketFacet));
    }
} 