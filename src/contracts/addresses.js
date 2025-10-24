// Contract addresses - Will be updated after deployment
export const CONTRACTS = {
  // Base Sepolia Testnet
  baseSepolia: {
    GEMS_TOKEN: "0x5570495E9e6504369D13b5215d6dDC047D8b7F24",
    GAME_CONTRACT: "0xb46921A5D008Bd81b1eC30Bce231440671B072ff",
    chainId: 84532,
    rpcUrl: "https://sepolia.base.org"
  },

  // Base Mainnet (for later)
  base: {
    GEMS_TOKEN: "", // Will be deployed
    GAME_CONTRACT: "", // Will be deployed
    chainId: 8453,
    rpcUrl: "https://mainnet.base.org"
  }
};

// Current network (change this to switch networks)
export const CURRENT_NETWORK = "baseSepolia";

// Get current contract addresses
export const getCurrentContracts = () => CONTRACTS[CURRENT_NETWORK];