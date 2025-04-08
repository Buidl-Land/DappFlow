// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeployHelpers.s.sol";
import "../contracts/libraries/LibDiamond.sol";
import "../contracts/facets/DiamondCutFacet.sol";
import "../contracts/facets/AccessControlFacet.sol";
import "../contracts/facets/ProjectFacet.sol";
import "../contracts/facets/CrowdfundingFacet.sol";
import "../contracts/facets/ProjectTokenFacet.sol";
import "../contracts/facets/TaskMarketFacet.sol";

contract AddFacets is ScaffoldETHDeploy {
    function run() external {
        uint256 deployerPrivateKey = 0x4daf99ce2de431296ebd88f3338eb59d8e1577bb20b747b542974f29af95b1b5;
        vm.startBroadcast(deployerPrivateKey);

        // 使用已部署的合约地址
        address diamond = 0x062618eCed9140c206f4240827440B53Ad1Bb230;
        address accessControlFacet = 0x230aD1a12896b29d009f8E5D452492b916635BA4;
        address projectFacet = 0x4842fF88AD518F272F095b947B74a55387D04890;
        address crowdfundingFacet = 0x187E34a55DC3aB19256B421Cd3d435a70B3F11f9;
        address projectTokenFacet = 0x8244f8E2ECE7D0761D9F778F08FA3602e7574608;
        address taskMarketFacet = 0x1e9227C2b2fbFd1b8DDb342eCAF8EEEA23e1D50d;
        
        console.log("Adding facets to Diamond at:", diamond);
        
        // Create arrays of function selectors for each facet
        bytes4[] memory accessControlSelectors = getAccessControlSelectors();
        bytes4[] memory projectSelectors = getProjectSelectors();
        bytes4[] memory crowdfundingSelectors = getCrowdfundingSelectors();
        bytes4[] memory projectTokenSelectors = getProjectTokenSelectors();
        bytes4[] memory taskMarketSelectors = getTaskMarketSelectors();

        // Create FacetCut array
        IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](5);

        cut[0] = IDiamondCut.FacetCut({
            facetAddress: accessControlFacet,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: accessControlSelectors
        });

        cut[1] = IDiamondCut.FacetCut({
            facetAddress: projectFacet,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: projectSelectors
        });

        cut[2] = IDiamondCut.FacetCut({
            facetAddress: crowdfundingFacet,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: crowdfundingSelectors
        });

        cut[3] = IDiamondCut.FacetCut({
            facetAddress: projectTokenFacet,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: projectTokenSelectors
        });

        cut[4] = IDiamondCut.FacetCut({
            facetAddress: taskMarketFacet,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: taskMarketSelectors
        });

        // Add facets to diamond
        DiamondCutFacet(diamond).diamondCut(cut, address(0), "");
        console.log("All facets added to Diamond successfully");

        vm.stopBroadcast();
    }

    // Define selectors for each facet
    function getAccessControlSelectors() internal pure returns (bytes4[] memory) {
        bytes4[] memory selectors = new bytes4[](12);
        selectors[0] = AccessControlFacet.initializeAccessControl.selector;
        selectors[1] = AccessControlFacet.hasRole.selector;
        selectors[2] = AccessControlFacet.isAdmin.selector;
        selectors[3] = AccessControlFacet.grantRole.selector;
        selectors[4] = AccessControlFacet.revokeRole.selector;
        selectors[5] = AccessControlFacet.addAdmin.selector;
        selectors[6] = AccessControlFacet.removeAdmin.selector;
        selectors[7] = bytes4(keccak256("ADMIN_ROLE()"));
        selectors[8] = bytes4(keccak256("PROJECT_CREATOR_ROLE()"));
        selectors[9] = bytes4(keccak256("TASK_CREATOR_ROLE()"));
        selectors[10] = bytes4(keccak256("FUNDING_MANAGER_ROLE()"));
        selectors[11] = bytes4(keccak256("AI_AGENT_ROLE()"));
        return selectors;
    }

    function getProjectSelectors() internal pure returns (bytes4[] memory) {
        bytes4[] memory selectors = new bytes4[](8);
        selectors[0] = ProjectFacet.createProject.selector;
        selectors[1] = ProjectFacet.updateProject.selector;
        selectors[2] = ProjectFacet.updateProjectMetadata.selector;
        selectors[3] = ProjectFacet.updateProjectStatus.selector;
        selectors[4] = ProjectFacet.isProjectOwner.selector;
        selectors[5] = ProjectFacet.getProject.selector;
        selectors[6] = ProjectFacet.getUserProjects.selector;
        selectors[7] = ProjectFacet.getProjectCount.selector;
        return selectors;
    }

    function getCrowdfundingSelectors() internal pure returns (bytes4[] memory) {
        bytes4[] memory selectors = new bytes4[](8);
        selectors[0] = CrowdfundingFacet.initializeFunding.selector;
        selectors[1] = CrowdfundingFacet.contribute.selector;
        selectors[2] = CrowdfundingFacet.claimRefund.selector;
        selectors[3] = CrowdfundingFacet.getFundingInfo.selector;
        selectors[4] = CrowdfundingFacet.getContribution.selector;
        selectors[5] = CrowdfundingFacet.getUserContributions.selector;
        selectors[6] = CrowdfundingFacet.isFunded.selector;
        selectors[7] = CrowdfundingFacet.getRaisedAmount.selector;
        return selectors;
    }

    function getProjectTokenSelectors() internal pure returns (bytes4[] memory) {
        bytes4[] memory selectors = new bytes4[](5);
        selectors[0] = ProjectTokenFacet.createProjectToken.selector;
        selectors[1] = ProjectTokenFacet.claimTokens.selector;
        selectors[2] = ProjectTokenFacet.getProjectToken.selector;
        selectors[3] = ProjectTokenFacet.getClaimedAmount.selector;
        selectors[4] = ProjectTokenFacet.getTokenContribution.selector;
        return selectors;
    }

    function getTaskMarketSelectors() internal pure returns (bytes4[] memory) {
        bytes4[] memory selectors = new bytes4[](11);
        selectors[0] = TaskMarketFacet.initialize.selector;
        selectors[1] = TaskMarketFacet.createTask.selector;
        selectors[2] = TaskMarketFacet.applyForTask.selector;
        selectors[3] = TaskMarketFacet.assignTask.selector;
        selectors[4] = TaskMarketFacet.startTask.selector;
        selectors[5] = TaskMarketFacet.completeTask.selector;
        selectors[6] = TaskMarketFacet.verifyTask.selector;
        selectors[7] = TaskMarketFacet.getTask.selector;
        selectors[8] = TaskMarketFacet.getProjectTaskCount.selector;
        selectors[9] = TaskMarketFacet.getUserTasks.selector;
        selectors[10] = TaskMarketFacet.hasApplied.selector;
        return selectors;
    }
} 