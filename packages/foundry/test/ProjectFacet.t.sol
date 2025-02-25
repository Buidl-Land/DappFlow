// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import "../contracts/facets/ProjectFacet.sol";

contract ProjectFacetTest is Test {
    ProjectFacet public projectFacet;
    address public owner;
    address public user1;
    address public user2;

    event ProjectCreated(
        uint256 indexed projectId,
        address indexed creator,
        string title,
        uint256 timestamp
    );

    event ProjectStatusChanged(
        uint256 indexed projectId,
        ProjectStatus oldStatus,
        ProjectStatus newStatus
    );

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        projectFacet = new ProjectFacet();

        // Fund test users
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
    }

    function testCreateProject() public {
        string memory title = "Test Project";
        string memory description = "Test Description";
        string[] memory tags = new string[](2);
        tags[0] = "web3";
        tags[1] = "defi";

        ProjectFacet.ProjectMetadata memory metadata = ProjectFacet.ProjectMetadata({
            aiEvaluation: "High potential",
            marketScore: 8,
            techFeasibility: "A",
            minValuation: 1e6,
            maxValuation: 2e6
        });

        vm.expectEmit(true, true, false, true);
        emit ProjectCreated(1, address(this), title, block.timestamp);

        uint256 projectId = projectFacet.createProject(title, description, tags, metadata);
        assertEq(projectId, 1, "Project ID should be 1");

        (
            uint256 id,
            address creator,
            string memory projectTitle,
            string memory projectDesc,
            string[] memory projectTags,
            ProjectFacet.ProjectMetadata memory projectMetadata,
            ProjectFacet.ProjectStatus status,
            uint256 createdAt,
            uint256 updatedAt
        ) = projectFacet.getProject(projectId);

        assertEq(id, projectId, "Project ID mismatch");
        assertEq(creator, address(this), "Creator mismatch");
        assertEq(projectTitle, title, "Title mismatch");
        assertEq(projectDesc, description, "Description mismatch");
        assertEq(projectTags.length, tags.length, "Tags length mismatch");
        assertEq(status, ProjectFacet.ProjectStatus.Draft, "Status should be Draft");
        assertEq(projectMetadata.marketScore, metadata.marketScore, "Market score mismatch");
    }

    function testUpdateProject() public {
        // First create a project
        uint256 projectId = _createTestProject();

        string memory newTitle = "Updated Project";
        string memory newDescription = "Updated Description";
        string[] memory newTags = new string[](1);
        newTags[0] = "updated";

        projectFacet.updateProject(projectId, newTitle, newDescription, newTags);

        (
            ,
            ,
            string memory projectTitle,
            string memory projectDesc,
            string[] memory projectTags,
            ,
            ,
            ,

        ) = projectFacet.getProject(projectId);

        assertEq(projectTitle, newTitle, "Title not updated");
        assertEq(projectDesc, newDescription, "Description not updated");
        assertEq(projectTags.length, 1, "Tags not updated");
        assertEq(projectTags[0], "updated", "Tag content not updated");
    }

    function testUpdateProjectMetadata() public {
        uint256 projectId = _createTestProject();

        ProjectFacet.ProjectMetadata memory newMetadata = ProjectFacet.ProjectMetadata({
            aiEvaluation: "Updated evaluation",
            marketScore: 9,
            techFeasibility: "A+",
            minValuation: 2e6,
            maxValuation: 3e6
        });

        projectFacet.updateProjectMetadata(projectId, newMetadata);

        (
            ,
            ,
            ,
            ,
            ,
            ProjectFacet.ProjectMetadata memory projectMetadata,
            ,
            ,

        ) = projectFacet.getProject(projectId);

        assertEq(projectMetadata.marketScore, newMetadata.marketScore, "Market score not updated");
        assertEq(projectMetadata.minValuation, newMetadata.minValuation, "Min valuation not updated");
    }

    function testUpdateProjectStatus() public {
        uint256 projectId = _createTestProject();

        vm.expectEmit(true, false, false, true);
        emit ProjectStatusChanged(
            projectId,
            ProjectFacet.ProjectStatus.Draft,
            ProjectFacet.ProjectStatus.Active
        );

        projectFacet.updateProjectStatus(projectId, ProjectFacet.ProjectStatus.Active);

        (
            ,
            ,
            ,
            ,
            ,
            ,
            ProjectFacet.ProjectStatus status,
            ,

        ) = projectFacet.getProject(projectId);

        assertEq(uint256(status), uint256(ProjectFacet.ProjectStatus.Active), "Status not updated");
    }

    function testOnlyCreatorCanUpdate() public {
        uint256 projectId = _createTestProject();

        vm.startPrank(user1);
        vm.expectRevert("Not project creator");
        projectFacet.updateProject("Hack", "Hack", new string[](0));

        vm.expectRevert("Not project creator");
        projectFacet.updateProjectStatus(projectId, ProjectFacet.ProjectStatus.Active);
        vm.stopPrank();
    }

    function testGetUserProjects() public {
        uint256 projectId1 = _createTestProject();
        uint256 projectId2 = _createTestProject();

        uint256[] memory userProjects = projectFacet.getUserProjects(address(this));
        assertEq(userProjects.length, 2, "Should have 2 projects");
        assertEq(userProjects[0], projectId1, "First project ID mismatch");
        assertEq(userProjects[1], projectId2, "Second project ID mismatch");
    }

    function _createTestProject() internal returns (uint256) {
        string memory title = "Test Project";
        string memory description = "Test Description";
        string[] memory tags = new string[](1);
        tags[0] = "test";

        ProjectFacet.ProjectMetadata memory metadata = ProjectFacet.ProjectMetadata({
            aiEvaluation: "Test evaluation",
            marketScore: 5,
            techFeasibility: "B",
            minValuation: 1e6,
            maxValuation: 2e6
        });

        return projectFacet.createProject(title, description, tags, metadata);
    }

    // Fuzz testing
    function testFuzz_CreateProject(
        string calldata title,
        string calldata description,
        uint256 marketScore,
        uint256 minValuation,
        uint256 maxValuation
    ) public {
        vm.assume(bytes(title).length > 0 && bytes(title).length <= 100);
        vm.assume(bytes(description).length <= 1000);
        vm.assume(marketScore <= 10);
        vm.assume(minValuation <= maxValuation);

        string[] memory tags = new string[](1);
        tags[0] = "fuzz";

        ProjectFacet.ProjectMetadata memory metadata = ProjectFacet.ProjectMetadata({
            aiEvaluation: "Fuzz test",
            marketScore: marketScore,
            techFeasibility: "C",
            minValuation: minValuation,
            maxValuation: maxValuation
        });

        uint256 projectId = projectFacet.createProject(title, description, tags, metadata);
        assertTrue(projectId > 0, "Project ID should be positive");
    }
}