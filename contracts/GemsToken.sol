// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GemsToken is ERC20, Ownable {
    // Exchange rate: 0.1 ETH = 500 GEMS
    // So 1 ETH = 5000 GEMS
    uint256 public constant GEMS_PER_ETH = 5000;
    
    // Events
    event GemsPurchased(address indexed buyer, uint256 ethAmount, uint256 gemsAmount);
    event FundsWithdrawn(address indexed owner, uint256 amount);

    constructor() ERC20("Cast Colony GEMS", "GEMS") Ownable(msg.sender) {
        // Initial supply can be 0, tokens will be minted by the game contract
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    // Purchase GEMS with ETH
    function buyGems() external payable {
        require(msg.value > 0, "Must send ETH to buy GEMS");
        
        // Calculate GEMS to mint: ETH amount * GEMS_PER_ETH
        uint256 gemsToMint = msg.value * GEMS_PER_ETH;
        
        // Mint GEMS to the buyer
        _mint(msg.sender, gemsToMint);
        
        // Emit event
        emit GemsPurchased(msg.sender, msg.value, gemsToMint);
    }

    // Owner can withdraw collected ETH
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner()).transfer(balance);
        emit FundsWithdrawn(owner(), balance);
    }

    // Get contract ETH balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Calculate how many GEMS you get for a given ETH amount
    function calculateGemsForEth(uint256 ethAmount) external pure returns (uint256) {
        return ethAmount * GEMS_PER_ETH;
    }

    // Override decimals to use 18 (standard)
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}