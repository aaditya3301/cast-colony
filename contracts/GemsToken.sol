// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GemsToken is ERC20, Ownable {
    constructor() ERC20("Cast Colony GEMS", "GEMS") Ownable(msg.sender) {
        // Initial supply can be 0, tokens will be minted by the game contract
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    // Override decimals to use 18 (standard)
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}