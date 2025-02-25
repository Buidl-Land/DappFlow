// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import "../contracts/facets/TaskMarketFacet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock payment token for testing
contract MockUSDT is ERC20 {
    constructor() ERC20("Mock USDT", "USDT") {
        _mint(msg.sender, 1000000 * 10**decimals());
    }
}

contract TaskMarketFacetTest is Test {
    TaskMarketFacet public taskMarket;
    MockUSDT public usdt;
    address public projectOwner;
    address public worker1;
    address public worker2;

    uint256 public constant PROJECT_ID = 1;
    uint256 public constant TASK_REWARD = 1000e18; // 1000 USDT
    uint256 public constant TASK_DURATION = 7 days;

    event TaskCreated(
        uint256 indexed projectId,
        uint256 indexed taskId,
        string title,
        uint256 reward,
        string[] requiredSkills
    );
    event TaskAssigned(uint256 indexed projectId, uint256 indexed taskId, address indexed assignee);
    event TaskCompleted(uint256 indexed projectId, uint256 indexed taskId, address indexed assignee);
    event TaskVerified(uint256 indexed projectId, uint256 indexed taskId, uint256 reward);

    function setUp() public {
        projectOwner = makeAddr("projectOwner");
        worker1 = makeAddr("worker1");
        worker2 = makeAddr("worker2");

        // Deploy contracts
        usdt = new MockUSDT();
        taskMarket = new TaskMarketFacet();

        // Initialize task market
        vm.prank(projectOwner);
        taskMarket.initialize(address(usdt));

        // Mock project ownership
        vm.mockCall(
            address(taskMarket),
            abi.encodeWithSelector(TaskMarketFacet.isProjectOwner.selector, PROJECT_ID, projectOwner),
            abi.encode(true)
        );

        // Mock project funding status
        vm.mockCall(
            address(taskMarket),
            abi.encodeWithSelector(TaskMarketFacet.isFunded.selector, PROJECT_ID),
            abi.encode(true)
        );

        // Fund task market contract with USDT for rewards
        usdt.transfer(address(taskMarket), 10000e18);
    }

    function testCreateTask() public {
        string memory title = "Implement Smart Contract";
        string memory description = "Implement ERC20 token contract";
        string[] memory skills = new string[](2);
        skills[0] = "Solidity";
        skills[1] = "ERC20";

        vm.startPrank(projectOwner);

        vm.expectEmit(true, true, false, true);
        emit TaskCreated(PROJECT_ID, 0, title, TASK_REWARD, skills);

        uint256 taskId = taskMarket.createTask(
            PROJECT_ID,
            title,
            description,
            TASK_REWARD,
            block.timestamp + TASK_DURATION,
            skills,
            40 // 40 hours estimated
        );

        (
            string memory taskTitle,
            string memory taskDesc,
            uint256 reward,
            uint256 deadline,
            TaskMarketFacet.TaskStatus status,
            string[] memory requiredSkills,
            uint256 estimatedHours,
            address assignee,
            uint256 createdAt,
            uint256 completedAt
        ) = taskMarket.getTask(PROJECT_ID, taskId);

        assertEq(taskTitle, title, "Title mismatch");
        assertEq(taskDesc, description, "Description mismatch");
        assertEq(reward, TASK_REWARD, "Reward mismatch");
        assertEq(status, TaskMarketFacet.TaskStatus.Open, "Status should be Open");
        assertEq(requiredSkills.length, skills.length, "Skills length mismatch");
        assertEq(estimatedHours, 40, "Estimated hours mismatch");
        assertEq(assignee, address(0), "Should not have assignee");

        vm.stopPrank();
    }

    function testTaskApplication() public {
        uint256 taskId = _createTestTask();

        vm.startPrank(worker1);
        taskMarket.applyForTask(PROJECT_ID, taskId);

        bool hasApplied = taskMarket.hasApplied(PROJECT_ID, taskId, worker1);
        assertTrue(hasApplied, "Worker should be marked as applied");

        vm.stopPrank();
    }

    function testTaskAssignment() public {
        uint256 taskId = _createTestTask();

        // Worker applies
        vm.prank(worker1);
        taskMarket.applyForTask(PROJECT_ID, taskId);

        // Owner assigns
        vm.startPrank(projectOwner);
        vm.expectEmit(true, true, true, false);
        emit TaskAssigned(PROJECT_ID, taskId, worker1);

        taskMarket.assignTask(PROJECT_ID, taskId, worker1);

        (,,,,TaskMarketFacet.TaskStatus status,,,address assignee,uint256 createdAt,uint256 completedAt) = taskMarket.getTask(PROJECT_ID, taskId);

        assertEq(status, TaskMarketFacet.TaskStatus.Assigned, "Status should be Assigned");
        assertEq(assignee, worker1, "Wrong assignee");
        vm.stopPrank();
    }

    function testTaskCompletion() public {
        uint256 taskId = _createTestTask();

        // Setup: Apply and assign
        vm.prank(worker1);
        taskMarket.applyForTask(PROJECT_ID, taskId);

        vm.prank(projectOwner);
        taskMarket.assignTask(PROJECT_ID, taskId, worker1);

        // Start task
        vm.startPrank(worker1);
        taskMarket.startTask(PROJECT_ID, taskId);

        vm.expectEmit(true, true, true, false);
        emit TaskCompleted(PROJECT_ID, taskId, worker1);

        taskMarket.completeTask(PROJECT_ID, taskId);
        vm.stopPrank();

        (,,,,TaskMarketFacet.TaskStatus status,,,,,uint256 createdAt,uint256 completedAt) = taskMarket.getTask(PROJECT_ID, taskId);
        assertEq(status, TaskMarketFacet.TaskStatus.Completed, "Status should be Completed");
    }

    function testTaskVerificationAndReward() public {
        uint256 taskId = _createTestTask();

        // Setup: Complete task
        vm.prank(worker1);
        taskMarket.applyForTask(PROJECT_ID, taskId);

        vm.prank(projectOwner);
        taskMarket.assignTask(PROJECT_ID, taskId, worker1);

        vm.startPrank(worker1);
        taskMarket.startTask(PROJECT_ID, taskId);
        taskMarket.completeTask(PROJECT_ID, taskId);
        vm.stopPrank();

        // Verify and reward
        uint256 workerBalanceBefore = usdt.balanceOf(worker1);

        vm.startPrank(projectOwner);
        vm.expectEmit(true, true, false, true);
        emit TaskVerified(PROJECT_ID, taskId, TASK_REWARD);

        taskMarket.verifyTask(PROJECT_ID, taskId);
        vm.stopPrank();

        uint256 workerBalanceAfter = usdt.balanceOf(worker1);
        assertEq(workerBalanceAfter - workerBalanceBefore, TASK_REWARD, "Worker should receive reward");

        (,,,,TaskMarketFacet.TaskStatus status,,,,,uint256 createdAt,uint256 completedAt) = taskMarket.getTask(PROJECT_ID, taskId);
        assertEq(status, TaskMarketFacet.TaskStatus.Verified, "Status should be Verified");
    }

    function testTaskLifecycle() public {
        uint256 taskId = _createTestTask();

        // Check initial status
        (,,,,TaskMarketFacet.TaskStatus status,,,,,uint256 createdAt,uint256 completedAt) = taskMarket.getTask(PROJECT_ID, taskId);
        assertEq(status, TaskMarketFacet.TaskStatus.Open, "Initial status should be Open");

        // Application
        vm.prank(worker1);
        taskMarket.applyForTask(PROJECT_ID, taskId);
        assertTrue(taskMarket.hasApplied(PROJECT_ID, taskId, worker1), "Application not recorded");

        // Assignment
        vm.prank(projectOwner);
        taskMarket.assignTask(PROJECT_ID, taskId, worker1);
        (,,,,status,,,address assignee,uint256 createdAt,uint256 completedAt) = taskMarket.getTask(PROJECT_ID, taskId);
        assertEq(status, TaskMarketFacet.TaskStatus.Assigned, "Status should be Assigned");
        assertEq(assignee, worker1, "Wrong assignee");

        // Start work
        vm.prank(worker1);
        taskMarket.startTask(PROJECT_ID, taskId);
        (,,,,status,,,,,uint256 createdAt,uint256 completedAt) = taskMarket.getTask(PROJECT_ID, taskId);
        assertEq(status, TaskMarketFacet.TaskStatus.InProgress, "Status should be InProgress");

        // Complete work
        vm.prank(worker1);
        taskMarket.completeTask(PROJECT_ID, taskId);
        (,,,,status,,,,,uint256 createdAt,uint256 completedAt) = taskMarket.getTask(PROJECT_ID, taskId);
        assertEq(status, TaskMarketFacet.TaskStatus.Completed, "Status should be Completed");

        // Verify and reward
        vm.prank(projectOwner);
        taskMarket.verifyTask(PROJECT_ID, taskId);
        (,,,,status,,,,,uint256 createdAt,uint256 completedAt) = taskMarket.getTask(PROJECT_ID, taskId);
        assertEq(status, TaskMarketFacet.TaskStatus.Verified, "Final status should be Verified");
    }

    function _createTestTask() internal returns (uint256) {
        string memory title = "Test Task";
        string memory description = "Test Description";
        string[] memory skills = new string[](1);
        skills[0] = "test";

        vm.prank(projectOwner);
        return taskMarket.createTask(
            PROJECT_ID,
            title,
            description,
            TASK_REWARD,
            block.timestamp + TASK_DURATION,
            skills,
            40
        );
    }

    receive() external payable {}
}