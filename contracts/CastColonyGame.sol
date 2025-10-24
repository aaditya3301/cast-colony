// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GemsToken.sol";

contract CastColonyGame {
    GemsToken public gemsToken;
    
    // Game constants
    uint256 public constant INITIAL_AIRDROP = 100 * 10**18; // 100 GEMS
    uint256 public constant BASE_TILE_PRICE = 100 * 10**18; // 100 GEMS
    uint256 public constant PRICE_INCREASE = 50 * 10**18; // 50 GEMS increase per tile
    uint256 public constant GEMS_PER_HOUR = 10 * 10**18; // 10 GEMS per hour
    
    // Game state
    mapping(address => bool) public hasReceivedAirdrop;
    mapping(address => uint256) public playerTileCount;
    mapping(uint256 => mapping(uint256 => address)) public tileOwners; // x => y => owner
    mapping(uint256 => mapping(uint256 => uint256)) public tileLastHarvest; // x => y => timestamp
    
    // Events
    event TileClaimed(address indexed player, uint256 x, uint256 y, uint256 price);
    event TilesHarvested(address indexed player, uint256[] tileIds, uint256 totalGems);
    event AirdropClaimed(address indexed player, uint256 amount);
    
    constructor(address _gemsToken) {
        gemsToken = GemsToken(_gemsToken);
    }
    
    // Airdrop 100 GEMS to new players
    function airdropNewPlayer() external {
        require(!hasReceivedAirdrop[msg.sender], "Already received airdrop");
        
        hasReceivedAirdrop[msg.sender] = true;
        gemsToken.mint(msg.sender, INITIAL_AIRDROP);
        
        emit AirdropClaimed(msg.sender, INITIAL_AIRDROP);
    }
    
    // Get current tile price for a player (increases with each tile owned)
    function getTilePrice(address player) external view returns (uint256) {
        return BASE_TILE_PRICE + (playerTileCount[player] * PRICE_INCREASE);
    }
    
    // Get player's tile count
    function getPlayerTileCount(address player) external view returns (uint256) {
        return playerTileCount[player];
    }
    
    // Get tile owner
    function getTileOwner(uint256 x, uint256 y) external view returns (address) {
        return tileOwners[x][y];
    }
    
    // Claim a tile
    function claimTile(uint256 x, uint256 y) external {
        require(tileOwners[x][y] == address(0), "Tile already owned");
        
        uint256 price = BASE_TILE_PRICE + (playerTileCount[msg.sender] * PRICE_INCREASE);
        
        // Burn GEMS from player
        gemsToken.burn(msg.sender, price);
        
        // Assign tile to player
        tileOwners[x][y] = msg.sender;
        tileLastHarvest[x][y] = block.timestamp;
        playerTileCount[msg.sender]++;
        
        emit TileClaimed(msg.sender, x, y, price);
    }
    
    // Harvest GEMS from tiles (simplified - using tileIds as x*1000+y)
    function harvestTiles(uint256[] calldata tileIds) external {
        uint256 totalGems = 0;
        
        for (uint256 i = 0; i < tileIds.length; i++) {
            uint256 tileId = tileIds[i];
            uint256 x = tileId / 1000;
            uint256 y = tileId % 1000;
            
            require(tileOwners[x][y] == msg.sender, "Not your tile");
            
            uint256 timeSinceHarvest = block.timestamp - tileLastHarvest[x][y];
            uint256 hoursElapsed = timeSinceHarvest / 3600; // 3600 seconds = 1 hour
            uint256 gemsToMint = hoursElapsed * GEMS_PER_HOUR;
            
            if (gemsToMint > 0) {
                totalGems += gemsToMint;
                tileLastHarvest[x][y] = block.timestamp;
            }
        }
        
        if (totalGems > 0) {
            gemsToken.mint(msg.sender, totalGems);
        }
        
        emit TilesHarvested(msg.sender, tileIds, totalGems);
    }
    
    // Get harvestable GEMS for a tile
    function getHarvestableGems(uint256 x, uint256 y) external view returns (uint256) {
        if (tileOwners[x][y] == address(0)) return 0;
        
        uint256 timeSinceHarvest = block.timestamp - tileLastHarvest[x][y];
        uint256 hoursElapsed = timeSinceHarvest / 3600;
        return hoursElapsed * GEMS_PER_HOUR;
    }
}