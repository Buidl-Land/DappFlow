// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeployHelpers.s.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock token for testing purposes
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "mUSDC") {
        _mint(msg.sender, 1000000 * 10**18);
    }
}

contract DeployMockToken is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // Deploy mock USDC for testing
        MockUSDC mockUSDC = new MockUSDC();
        
        // Save deployment
        deployments.push(Deployment("MockUSDC", address(mockUSDC)));
        
        console.log("MockUSDC deployed at:", address(mockUSDC));
    }
} 