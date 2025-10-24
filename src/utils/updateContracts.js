// Helper function to update contract addresses after deployment
// Run this in the browser console after deploying contracts

export const updateContractAddresses = (gemsAddress, landAddress) => {
  const contractsCode = `// Contract addresses - Updated after Thirdweb deployment
export const CONTRACTS = {
  // Base Sepolia Testnet
  baseSepolia: {
    GEMS_TOKEN: "${gemsAddress}",
    LAND_NFT: "${landAddress}",
    chainId: 84532,
    rpcUrl: "https://sepolia.base.org"
  },
  
  // Base Mainnet (for later)
  base: {
    GEMS_TOKEN: "", // Will be filled after deployment
    LAND_NFT: "",   // Will be filled after deployment
    chainId: 8453,
    rpcUrl: "https://mainnet.base.org"
  }
};

// Current network (change this to switch networks)
export const CURRENT_NETWORK = "baseSepolia";

// Get current contract addresses
export const getCurrentContracts = () => CONTRACTS[CURRENT_NETWORK];`;

  console.log('Copy this code to src/contracts/addresses.js:');
  console.log(contractsCode);
  
  return contractsCode;
};

// Example usage:
// updateContractAddresses("0x1234...gems", "0x5678...land");