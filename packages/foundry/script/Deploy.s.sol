// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeployHelpers.s.sol";
import "../contracts/core/Diamond.sol";
import "../contracts/facets/DiamondCutFacet.sol";
import "../contracts/facets/AccessControlFacet.sol";
import "../contracts/facets/ProjectFacet.sol";
import "../contracts/facets/CrowdfundingFacet.sol";
import "../contracts/facets/ProjectTokenFacet.sol";
import "../contracts/facets/TaskMarketFacet.sol";
import "../contracts/libraries/LibDiamond.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock token for testing purposes
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "mUSDC") {
        _mint(msg.sender, 1000000 * 10**18);
    }
}

/**
 * @notice Main deployment script for all contracts
 * @dev Run this when you want to deploy multiple contracts at once
 *
 * Example: yarn deploy # runs this script(without`--file` flag)
 */
contract DeployScript is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // Get deployer address from vm
        (, address deployerAddress,) = vm.readCallers();
        console.log("Deployer address:", deployerAddress);
        console.log("tx.origin:", tx.origin);
        console.log("msg.sender:", msg.sender);

        // Deploy DiamondCutFacet
        DiamondCutFacet diamondCutFacet = new DiamondCutFacet();
        deployments.push(Deployment("DiamondCutFacet", address(diamondCutFacet)));

        // Deploy Diamond with DiamondCutFacet
        Diamond diamond = new Diamond(deployerAddress, address(diamondCutFacet));
        deployments.push(Deployment("Diamond", address(diamond)));

        console.log("Diamond deployed at:", address(diamond));
        console.log("DiamondCutFacet deployed at:", address(diamondCutFacet));

        // Deploy Facets
        AccessControlFacet accessControlFacet = new AccessControlFacet();
        ProjectFacet projectFacet = new ProjectFacet();
        CrowdfundingFacet crowdfundingFacet = new CrowdfundingFacet();
        ProjectTokenFacet projectTokenFacet = new ProjectTokenFacet();
        TaskMarketFacet taskMarketFacet = new TaskMarketFacet();

        // Deploy mock USDC for testing
        MockUSDC mockUSDC = new MockUSDC();
        deployments.push(Deployment("MockUSDC", address(mockUSDC)));
        
        console.log("Mock USDC deployed at:", address(mockUSDC));

        // Record deployments
        deployments.push(Deployment("AccessControlFacet", address(accessControlFacet)));
        deployments.push(Deployment("ProjectFacet", address(projectFacet)));
        deployments.push(Deployment("CrowdfundingFacet", address(crowdfundingFacet)));
        deployments.push(Deployment("ProjectTokenFacet", address(projectTokenFacet)));
        deployments.push(Deployment("TaskMarketFacet", address(taskMarketFacet)));

        // Add facets to diamond
        console.log("Adding facets to diamond...");
        addFacets(
            address(diamond),
            address(accessControlFacet),
            address(projectFacet),
            address(crowdfundingFacet),
            address(projectTokenFacet),
            address(taskMarketFacet)
        );
        console.log("Facets added successfully");

        // Initialize AccessControl with both tx.origin and deployerAddress as admin
        console.log("Initializing AccessControl...");
        try AccessControlFacet(address(diamond)).initializeAccessControl(deployerAddress) {
            console.log("AccessControl initialized with deployerAddress");
        } catch Error(string memory reason) {
            console.log("Failed to initialize AccessControl with deployerAddress:", reason);
            
            // Try to initialize with tx.origin
            try AccessControlFacet(address(diamond)).initializeAccessControl(tx.origin) {
                console.log("AccessControl initialized with tx.origin");
            } catch Error(string memory reason) {
                console.log("Failed to initialize AccessControl with tx.origin:", reason);
            }
        }

        // Ensure tx.origin is also an admin
        if (tx.origin != deployerAddress) {
            console.log("tx.origin and deployerAddress are different, adding tx.origin as admin");
            try AccessControlFacet(address(diamond)).addAdmin(tx.origin) {
                console.log("tx.origin added as admin");
            } catch Error(string memory reason) {
                console.log("Failed to add tx.origin as admin:", reason);
            }
        }

        // Grant roles to both deployerAddress and tx.origin
        bytes32 PROJECT_CREATOR_ROLE = AccessControlFacet(address(diamond)).PROJECT_CREATOR_ROLE();
        bytes32 TASK_CREATOR_ROLE = AccessControlFacet(address(diamond)).TASK_CREATOR_ROLE();
        bytes32 FUNDING_MANAGER_ROLE = AccessControlFacet(address(diamond)).FUNDING_MANAGER_ROLE();

        console.log("Granting roles to deployerAddress...");
        try AccessControlFacet(address(diamond)).grantRole(PROJECT_CREATOR_ROLE, deployerAddress) {
            console.log("PROJECT_CREATOR_ROLE granted to deployerAddress");
        } catch Error(string memory reason) {
            console.log("Failed to grant PROJECT_CREATOR_ROLE to deployerAddress:", reason);
        }

        try AccessControlFacet(address(diamond)).grantRole(TASK_CREATOR_ROLE, deployerAddress) {
            console.log("TASK_CREATOR_ROLE granted to deployerAddress");
        } catch Error(string memory reason) {
            console.log("Failed to grant TASK_CREATOR_ROLE to deployerAddress:", reason);
        }

        try AccessControlFacet(address(diamond)).grantRole(FUNDING_MANAGER_ROLE, deployerAddress) {
            console.log("FUNDING_MANAGER_ROLE granted to deployerAddress");
        } catch Error(string memory reason) {
            console.log("Failed to grant FUNDING_MANAGER_ROLE to deployerAddress:", reason);
        }

        // If tx.origin and deployerAddress are different, also grant roles to tx.origin
        if (tx.origin != deployerAddress) {
            console.log("Granting roles to tx.origin...");
            try AccessControlFacet(address(diamond)).grantRole(PROJECT_CREATOR_ROLE, tx.origin) {
                console.log("PROJECT_CREATOR_ROLE granted to tx.origin");
            } catch Error(string memory reason) {
                console.log("Failed to grant PROJECT_CREATOR_ROLE to tx.origin:", reason);
            }

            try AccessControlFacet(address(diamond)).grantRole(TASK_CREATOR_ROLE, tx.origin) {
                console.log("TASK_CREATOR_ROLE granted to tx.origin");
            } catch Error(string memory reason) {
                console.log("Failed to grant TASK_CREATOR_ROLE to tx.origin:", reason);
            }

            try AccessControlFacet(address(diamond)).grantRole(FUNDING_MANAGER_ROLE, tx.origin) {
                console.log("FUNDING_MANAGER_ROLE granted to tx.origin");
            } catch Error(string memory reason) {
                console.log("Failed to grant FUNDING_MANAGER_ROLE to tx.origin:", reason);
            }
        }

        // Initialize TaskMarket
        console.log("Initializing TaskMarket...");
        try TaskMarketFacet(address(diamond)).initialize(address(mockUSDC)) {
            console.log("TaskMarket initialized");
        } catch Error(string memory reason) {
            console.log("Failed to initialize TaskMarket:", reason);
        }

        console.log("All facets deployed and initialized");
    }

    function addFacets(
        address _diamond,
        address _accessControlFacet,
        address _projectFacet,
        address _crowdfundingFacet,
        address _projectTokenFacet,
        address _taskMarketFacet
    ) internal {
        // Create arrays of function selectors for each facet
        bytes4[] memory accessControlSelectors = getAccessControlSelectors();
        bytes4[] memory projectSelectors = getProjectSelectors();
        bytes4[] memory crowdfundingSelectors = getCrowdfundingSelectors();
        bytes4[] memory projectTokenSelectors = getProjectTokenSelectors();
        bytes4[] memory taskMarketSelectors = getTaskMarketSelectors();

        // Create FacetCut array
        IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](5);

        cut[0] = IDiamondCut.FacetCut({
            facetAddress: _accessControlFacet,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: accessControlSelectors
        });

        cut[1] = IDiamondCut.FacetCut({
            facetAddress: _projectFacet,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: projectSelectors
        });

        cut[2] = IDiamondCut.FacetCut({
            facetAddress: _crowdfundingFacet,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: crowdfundingSelectors
        });

        cut[3] = IDiamondCut.FacetCut({
            facetAddress: _projectTokenFacet,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: projectTokenSelectors
        });

        cut[4] = IDiamondCut.FacetCut({
            facetAddress: _taskMarketFacet,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: taskMarketSelectors
        });

        // Add facets to diamond
        DiamondCutFacet(_diamond).diamondCut(cut, address(0), "");
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
