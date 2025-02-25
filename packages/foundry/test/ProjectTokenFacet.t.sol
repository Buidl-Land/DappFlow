// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import "../contracts/facets/ProjectTokenFacet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ProjectTokenFacetTest is Test {
    ProjectTokenFacet public tokenFacet;
    address public owner;
    address public contributor1;
    address public contributor2;

    uint256 public constant PROJECT_ID = 1;
    uint256 public constant TOTAL_SUPPLY = 1000000e18; // 1 million tokens
    uint256 public constant VESTING_DURATION = 180 days;

    event ProjectTokenCreated(uint256 indexed projectId, address indexed tokenAddress, string name, string symbol);
    event TokensClaimed(uint256 indexed projectId, address indexed beneficiary, uint256 amount);

    function setUp() public {
        owner = address(this);
        contributor1 = makeAddr("contributor1");
        contributor2 = makeAddr("contributor2");

        tokenFacet = new ProjectTokenFacet();

        // Mock the token facet as a contributor
        vm.mockCall(
            address(tokenFacet),
            abi.encodeWithSelector(ProjectTokenFacet.getContribution.selector, PROJECT_ID, contributor1),
            abi.encode(50000e18) // 50,000 USDT contribution
        );
        vm.mockCall(
            address(tokenFacet),
            abi.encodeWithSelector(ProjectTokenFacet.getRaisedAmount.selector, PROJECT_ID),
            abi.encode(100000e18) // 100,000 USDT total raised
        );
    }

    function testCreateProjectToken() public {
        string memory name = "Test Project Token";
        string memory symbol = "TPT";

        vm.expectEmit(true, true, false, true);
        emit ProjectTokenCreated(PROJECT_ID, address(0), name, symbol);

        tokenFacet.createProjectToken(
            PROJECT_ID,
            name,
            symbol,
            TOTAL_SUPPLY
        );

        (
            address tokenAddress,
            uint256 totalSupply,
            uint256 crowdfundingPool,
            uint256 teamPool,
            uint256 ecosystemPool,
            ,

        ) = tokenFacet.getProjectToken(PROJECT_ID);

        assertTrue(tokenAddress != address(0), "Token address should not be zero");
        assertEq(totalSupply, TOTAL_SUPPLY, "Total supply mismatch");

        // Verify token distribution
        assertEq(crowdfundingPool, (TOTAL_SUPPLY * 60) / 100, "Crowdfunding pool should be 60%");
        assertEq(teamPool, (TOTAL_SUPPLY * 25) / 100, "Team pool should be 25%");
        assertEq(ecosystemPool, (TOTAL_SUPPLY * 15) / 100, "Ecosystem pool should be 15%");
    }

    function testTokenVesting() public {
        // Create token first
        tokenFacet.createProjectToken(
            PROJECT_ID,
            "Test Project Token",
            "TPT",
            TOTAL_SUPPLY
        );

        // Fast forward to various vesting points
        uint256[] memory vestingPoints = new uint256[](4);
        vestingPoints[0] = VESTING_DURATION / 4;     // 25% vested
        vestingPoints[1] = VESTING_DURATION / 2;     // 50% vested
        vestingPoints[2] = (VESTING_DURATION * 3) / 4; // 75% vested
        vestingPoints[3] = VESTING_DURATION;         // 100% vested

        for (uint256 i = 0; i < vestingPoints.length; i++) {
            vm.warp(block.timestamp + vestingPoints[i]);

            // Try claiming tokens
            vm.startPrank(contributor1);
            tokenFacet.claimTokens(PROJECT_ID);
            vm.stopPrank();

            uint256 expectedVested = (300000e18 * vestingPoints[i]) / VESTING_DURATION; // 60% of 500k tokens
            uint256 claimed = tokenFacet.getClaimedAmount(PROJECT_ID, contributor1);

            assertApproxEqRel(
                claimed,
                expectedVested,
                0.01e18, // 1% tolerance
                abi.encodePacked("Vesting calculation wrong at point ", vm.toString(i))
            );
        }
    }

    function testContributorClaimTokens() public {
        // Create token
        tokenFacet.createProjectToken(
            PROJECT_ID,
            "Test Project Token",
            "TPT",
            TOTAL_SUPPLY
        );

        // Initial claim
        vm.startPrank(contributor1);
        vm.expectEmit(true, true, false, true);
        emit TokensClaimed(PROJECT_ID, contributor1, 0); // Initial claim amount
        tokenFacet.claimTokens(PROJECT_ID);
        vm.stopPrank();

        // Fast forward halfway through vesting
        vm.warp(block.timestamp + VESTING_DURATION / 2);

        vm.startPrank(contributor1);
        tokenFacet.claimTokens(PROJECT_ID);
        vm.stopPrank();

        uint256 claimed = tokenFacet.getClaimedAmount(PROJECT_ID, contributor1);
        uint256 expectedHalfVested = (300000e18 * (VESTING_DURATION / 2)) / VESTING_DURATION;

        assertApproxEqRel(
            claimed,
            expectedHalfVested,
            0.01e18,
            "Claimed amount should be approximately half of total allocation"
        );
    }

    function testMultipleContributorsClaims() public {
        // Mock second contributor
        vm.mockCall(
            address(tokenFacet),
            abi.encodeWithSelector(ProjectTokenFacet.getContribution.selector, PROJECT_ID, contributor2),
            abi.encode(25000e18) // 25,000 USDT contribution
        );

        tokenFacet.createProjectToken(
            PROJECT_ID,
            "Test Project Token",
            "TPT",
            TOTAL_SUPPLY
        );

        // Fast forward to 50% vesting
        vm.warp(block.timestamp + VESTING_DURATION / 2);

        // Both contributors claim
        vm.startPrank(contributor1);
        tokenFacet.claimTokens(PROJECT_ID);
        vm.stopPrank();

        vm.startPrank(contributor2);
        tokenFacet.claimTokens(PROJECT_ID);
        vm.stopPrank();

        uint256 claimed1 = tokenFacet.getClaimedAmount(PROJECT_ID, contributor1);
        uint256 claimed2 = tokenFacet.getClaimedAmount(PROJECT_ID, contributor2);

        // Contributor1 should have claimed twice as much as contributor2
        assertApproxEqRel(
            claimed1,
            claimed2 * 2,
            0.01e18,
            "Contributor1 should have claimed twice as much as contributor2"
        );
    }

    function testFuzz_ClaimTimeline(uint256 timeElapsed) public {
        vm.assume(timeElapsed <= VESTING_DURATION);

        tokenFacet.createProjectToken(
            PROJECT_ID,
            "Test Project Token",
            "TPT",
            TOTAL_SUPPLY
        );

        vm.warp(block.timestamp + timeElapsed);

        vm.startPrank(contributor1);
        tokenFacet.claimTokens(PROJECT_ID);
        vm.stopPrank();

        uint256 claimed = tokenFacet.getClaimedAmount(PROJECT_ID, contributor1);
        uint256 expectedVested = (300000e18 * timeElapsed) / VESTING_DURATION;

        assertLe(claimed, expectedVested, "Claimed amount exceeds expected vested amount");
    }

    receive() external payable {}
}