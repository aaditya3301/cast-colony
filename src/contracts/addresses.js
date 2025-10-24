// Contract addresses - Will be updated after deployment
export const CONTRACTS = {
  // Base Sepolia Testnet
  baseSepolia: {
    GEMS_TOKEN: "0xCB073288Acb084820B3FFB0E0f7b22c37F5a074b",
    GAME_CONTRACT: "0x2bc9418D9b507D6F803895a2F4E5F4aE51087864",
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