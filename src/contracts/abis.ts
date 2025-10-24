// ABIs for our game contracts

export const GEMS_TOKEN_ABI = [
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{"name": "owner", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      {"name": "to", "type": "address", "internalType": "address"},
      {"name": "amount", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "buyGems",
    "inputs": [],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "calculateGemsForEth",
    "inputs": [{"name": "ethAmount", "type": "uint256", "internalType": "uint256"}],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "GEMS_PER_ETH",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "GemsPurchased",
    "inputs": [
      {"name": "buyer", "type": "address", "indexed": true, "internalType": "address"},
      {"name": "ethAmount", "type": "uint256", "indexed": false, "internalType": "uint256"},
      {"name": "gemsAmount", "type": "uint256", "indexed": false, "internalType": "uint256"}
    ],
    "anonymous": false
  }
];

export const GAME_CONTRACT_ABI = [
  {
    "type": "function",
    "name": "claimTile",
    "inputs": [
      {"name": "x", "type": "uint256", "internalType": "uint256"},
      {"name": "y", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "harvestTiles",
    "inputs": [
      {"name": "tileIds", "type": "uint256[]", "internalType": "uint256[]"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getTilePrice",
    "inputs": [{"name": "player", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPlayerTileCount",
    "inputs": [{"name": "player", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTileOwner",
    "inputs": [
      {"name": "x", "type": "uint256", "internalType": "uint256"},
      {"name": "y", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [{"name": "", "type": "address", "internalType": "address"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "airdropNewPlayer",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "hasReceivedAirdrop",
    "inputs": [{"name": "player", "type": "address", "internalType": "address"}],
    "outputs": [{"name": "", "type": "bool", "internalType": "bool"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getHarvestableGems",
    "inputs": [
      {"name": "x", "type": "uint256", "internalType": "uint256"},
      {"name": "y", "type": "uint256", "internalType": "uint256"}
    ],
    "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
    "stateMutability": "view"
  }
];