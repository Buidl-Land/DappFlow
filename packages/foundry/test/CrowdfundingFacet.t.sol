// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import "../contracts/facets/CrowdfundingFacet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock USDT token for testing
contract MockUSDT is ERC20 {
    constructor() ERC20("Mock USDT", "USDT") {
        _mint(msg.sender, 1000000 * 10**decimals());
    }
}

contract CrowdfundingFacetTest is Test {
    CrowdfundingFacet public crowdfundingFacet;
    MockUSDT public usdt;
    address public owner;
    address public user1;
    address public user2;

    uint256 public constant PROJECT_ID = 1;
    uint256 public constant FUNDING_GOAL = 100000e18; // 100,000 USDT
    uint256 public constant DURATION = 30 days;

    event ContributionMade(uint256 indexed projectId, address indexed contributor, uint256 amount);
    event FundingSuccessful(uint256 indexed projectId, uint256 totalRaised);
    event FundingFailed(uint256 indexed projectId, uint256 totalRaised);
    event RefundClaimed(uint256 indexed projectId, address indexed contributor, uint256 amount);

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Deploy contracts
        usdt = new MockUSDT();
        crowdfundingFacet = new CrowdfundingFacet();

        // Initialize crowdfunding
        crowdfundingFacet.initializeFunding(
            PROJECT_ID,
            FUNDING_GOAL,
            DURATION,
            address(usdt)
        );

        // Fund test users
        usdt.transfer(user1, 50000e18);
        usdt.transfer(user2, 50000e18);
    }

    function testInitializeFunding() public {
        (
            uint256 fundingGoal,
            uint256 raisedAmount,
            uint256 startTime,
            uint256 endTime,
            bool isFunded,
            address paymentToken
        ) = crowdfundingFacet.getFundingInfo(PROJECT_ID);

        assertEq(fundingGoal, FUNDING_GOAL, "Funding goal mismatch");
        assertEq(raisedAmount, 0, "Initial raised amount should be 0");
        assertEq(endTime - startTime, DURATION, "Duration mismatch");
        assertEq(paymentToken, address(usdt), "Payment token mismatch");
        assertFalse(isFunded, "Should not be funded initially");
    }

    function testContribute() public {
        uint256 contribution = 1000e18;

        vm.startPrank(user1);
        usdt.approve(address(crowdfundingFacet), contribution);

        vm.expectEmit(true, true, false, true);
        emit ContributionMade(PROJECT_ID, user1, contribution);

        crowdfundingFacet.contribute(PROJECT_ID, contribution);
        vm.stopPrank();

        (,uint256 raisedAmount,,,,) = crowdfundingFacet.getFundingInfo(PROJECT_ID);
        assertEq(raisedAmount, contribution, "Raised amount mismatch");

        uint256 userContribution = crowdfundingFacet.getContribution(PROJECT_ID, user1);
        assertEq(userContribution, contribution, "User contribution mismatch");
    }

    function testSuccessfulFunding() public {
        vm.startPrank(user1);
        usdt.approve(address(crowdfundingFacet), FUNDING_GOAL);

        vm.expectEmit(true, false, false, true);
        emit FundingSuccessful(PROJECT_ID, FUNDING_GOAL);

        crowdfundingFacet.contribute(PROJECT_ID, FUNDING_GOAL);
        vm.stopPrank();

        (,,,, bool isFunded,) = crowdfundingFacet.getFundingInfo(PROJECT_ID);
        assertTrue(isFunded, "Project should be funded");
    }

    function testFundingFailure() public {
        uint256 partialAmount = FUNDING_GOAL / 2;

        vm.startPrank(user1);
        usdt.approve(address(crowdfundingFacet), partialAmount);
        crowdfundingFacet.contribute(PROJECT_ID, partialAmount);
        vm.stopPrank();

        // Fast forward past funding period
        vm.warp(block.timestamp + DURATION + 1);

        (,,,, bool isFunded,) = crowdfundingFacet.getFundingInfo(PROJECT_ID);
        assertFalse(isFunded, "Project should not be funded");
    }

    function testRefund() public {
        uint256 contribution = 1000e18;

        // Make contribution
        vm.startPrank(user1);
        usdt.approve(address(crowdfundingFacet), contribution);
        crowdfundingFacet.contribute(PROJECT_ID, contribution);

        // Fast forward past funding period
        vm.warp(block.timestamp + DURATION + 1);

        uint256 balanceBefore = usdt.balanceOf(user1);

        vm.expectEmit(true, true, false, true);
        emit RefundClaimed(PROJECT_ID, user1, contribution);

        crowdfundingFacet.claimRefund(PROJECT_ID);
        vm.stopPrank();

        uint256 balanceAfter = usdt.balanceOf(user1);
        assertEq(balanceAfter - balanceBefore, contribution, "Refund amount mismatch");

        uint256 remainingContribution = crowdfundingFacet.getContribution(PROJECT_ID, user1);
        assertEq(remainingContribution, 0, "Contribution should be cleared after refund");
    }

    function testMultipleContributors() public {
        uint256 contribution1 = FUNDING_GOAL / 2;
        uint256 contribution2 = FUNDING_GOAL / 2;

        // First contributor
        vm.startPrank(user1);
        usdt.approve(address(crowdfundingFacet), contribution1);
        crowdfundingFacet.contribute(PROJECT_ID, contribution1);
        vm.stopPrank();

        // Second contributor
        vm.startPrank(user2);
        usdt.approve(address(crowdfundingFacet), contribution2);
        crowdfundingFacet.contribute(PROJECT_ID, contribution2);
        vm.stopPrank();

        (,uint256 raisedAmount,,,,) = crowdfundingFacet.getFundingInfo(PROJECT_ID);
        assertEq(raisedAmount, FUNDING_GOAL, "Total raised amount mismatch");
    }

    function testFuzz_Contribute(uint256 amount) public {
        vm.assume(amount > 0 && amount <= FUNDING_GOAL);

        vm.startPrank(user1);
        usdt.approve(address(crowdfundingFacet), amount);
        crowdfundingFacet.contribute(PROJECT_ID, amount);
        vm.stopPrank();

        uint256 contribution = crowdfundingFacet.getContribution(PROJECT_ID, user1);
        assertEq(contribution, amount, "Contribution amount mismatch");
    }

    // Additional test for contribution timeline
    function testContributionTimeline() public {
        // Test contribution during valid period
        uint256 contribution = 1000e18;
        vm.startPrank(user1);
        usdt.approve(address(crowdfundingFacet), contribution);
        crowdfundingFacet.contribute(PROJECT_ID, contribution);
        vm.stopPrank();

        // Fast forward to just before end
        vm.warp(block.timestamp + DURATION - 1);

        // Should still be able to contribute
        vm.startPrank(user2);
        usdt.approve(address(crowdfundingFacet), contribution);
        crowdfundingFacet.contribute(PROJECT_ID, contribution);
        vm.stopPrank();

        // Fast forward past end
        vm.warp(block.timestamp + 2);

        // Should fail to contribute after end
        vm.startPrank(user1);
        usdt.approve(address(crowdfundingFacet), contribution);
        vm.expectRevert("Funding period ended");
        crowdfundingFacet.contribute(PROJECT_ID, contribution);
        vm.stopPrank();
    }
}