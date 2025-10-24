'use client';

import { useAccount } from 'wagmi';
import { useGame } from '@/context/GameContext';
import { 
  useGemsBalance, 
  useTilePrice,
  usePlayerTileCount,
  useHasReceivedAirdrop,
  useClaimTile,
  useHarvestTiles,
  useAirdropNewPlayer,
  formatGemsBalance 
} from './useWeb3Contracts';
import { useEffect, useState } from 'react';

export function useGameWeb3() {
  const { address, isConnected } = useAccount();
  const { state, dispatch } = useGame();
  
  // Check for Farcaster wallet
  const [farcasterAddress, setFarcasterAddress] = useState<string | null>(null);
  
  useEffect(() => {
    const checkFarcasterWallet = () => {
      const sdk = (window as any).farcaster || (window as any).farcasterSdk;
      if (sdk && sdk.context && sdk.context.wallet) {
        setFarcasterAddress(sdk.context.wallet.address);
      }
    };
    
    checkFarcasterWallet();
    const timer = setInterval(checkFarcasterWallet, 2000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Use Farcaster address if available, otherwise wagmi address
  const currentAddress = farcasterAddress || address;
  const currentIsConnected = !!farcasterAddress || isConnected;

  // Get on-chain data (use current address)
  const { data: gemsBalance, refetch: refetchGems } = useGemsBalance(currentAddress as `0x${string}`);
  const { data: tilePrice, refetch: refetchTilePrice } = useTilePrice(currentAddress as `0x${string}`);
  const { data: playerTileCount } = usePlayerTileCount(currentAddress as `0x${string}`);
  const { data: hasReceivedAirdrop } = useHasReceivedAirdrop(currentAddress as `0x${string}`);

  // Contract interaction hooks
  const tileClaimHook = useClaimTile();
  const harvestHook = useHarvestTiles();
  const airdropHook = useAirdropNewPlayer();

  // Sync on-chain GEMS balance with game state
  useEffect(() => {
    if (gemsBalance && currentIsConnected && typeof gemsBalance === 'bigint') {
      const formattedBalance = parseInt(formatGemsBalance(gemsBalance));
      
      // Update local state to match on-chain balance
      if (Math.abs(formattedBalance - state.userState.treasury) > 0) {
        dispatch({
          type: 'SYNC_WALLET_BALANCE',
          payload: { balance: formattedBalance }
        });
      }
    }
  }, [gemsBalance, currentIsConnected, state.userState.treasury, dispatch]);

  // Sync tiles when tile claim is confirmed
  useEffect(() => {
    if (tileClaimHook.isConfirmed) {
      console.log('Tile claim confirmed, syncing balances...');
      syncWithBlockchain();
    }
  }, [tileClaimHook.isConfirmed]);

  // Sync balances when harvest is confirmed
  useEffect(() => {
    if (harvestHook.isConfirmed) {
      console.log('Harvest confirmed, syncing balances...');
      syncWithBlockchain();
    }
  }, [harvestHook.isConfirmed]);

  // Auto-claim airdrop for new players
  useEffect(() => {
    if (currentIsConnected && hasReceivedAirdrop === false && !airdropHook.isPending) {
      console.log('New player detected, claiming airdrop...');
      airdropHook.claimAirdrop();
    }
  }, [currentIsConnected, hasReceivedAirdrop, airdropHook]);

  // Claim tile function that interacts with blockchain
  const claimTileOnChain = async (x: number, y: number) => {
    if (!currentIsConnected || !currentAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const currentPrice = tilePrice && typeof tilePrice === 'bigint' ? parseInt(formatGemsBalance(tilePrice)) : 100;
      const currentBalance = gemsBalance && typeof gemsBalance === 'bigint' ? parseInt(formatGemsBalance(gemsBalance)) : 0;
      
      if (currentBalance < currentPrice) {
        throw new Error(`Insufficient GEMS (need ${currentPrice})`);
      }

      // Claim the tile on-chain
      tileClaimHook.claimTile(x, y);

      return tileClaimHook;
    } catch (error) {
      console.error('Error claiming tile on-chain:', error);
      throw error;
    }
  };

  // Harvest GEMS function
  const harvestGemsOnChain = async (tileIds: number[]) => {
    if (!currentIsConnected || !currentAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      harvestHook.harvestTiles(tileIds);
      return harvestHook;
    } catch (error) {
      console.error('Error harvesting GEMS:', error);
      throw error;
    }
  };

  // Get current tile price
  const getCurrentTilePrice = () => {
    if (tilePrice && typeof tilePrice === 'bigint') {
      return parseInt(formatGemsBalance(tilePrice));
    }
    return 100; // Default price
  };

  // Load player's tiles from blockchain
  const loadPlayerTilesFromBlockchain = async () => {
    if (!currentIsConnected || !currentAddress) return [];

    try {
      const tileCount = playerTileCount ? parseInt(playerTileCount.toString()) : 0;
      console.log(`Loading ${tileCount} tiles for player from blockchain...`);
      
      const tiles: any[] = [];
      
      // Scan a reasonable area to find player's tiles
      // In production, you'd use events or maintain a mapping
      for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 50; y++) {
          try {
            // Check if this tile is owned by the current player
            // const owner = await getTileOwner(x, y); // TODO: Implement this function
            // if (owner && owner.toLowerCase() === address.toLowerCase()) {
            //   tiles.push({
            //     x,
            //     y,
            //     owner: address,
            //     gemsAccumulated: 0, // Will be calculated from contract
            //     lastHarvest: Date.now(), // Approximate
            //   });
              
            //   if (tiles.length >= tileCount) break;
            // }
          } catch (error) {
            // Tile doesn't exist or error reading - continue
          }
        }
        if (tiles.length >= tileCount) break;
      }

      console.log(`Found ${tiles.length} tiles on blockchain`);
      return tiles;
    } catch (error) {
      console.error('Error loading player tiles:', error);
      return [];
    }
  };

  // Sync function to refresh all balances
  const syncWithBlockchain = async () => {
    if (currentIsConnected) {
      await Promise.all([
        refetchGems(),
        refetchTilePrice(),
      ]);
    }
  };

  return {
    // Connection status
    isConnected: currentIsConnected,
    address: currentAddress,

    // Balances and game state
    gemsBalance: gemsBalance && typeof gemsBalance === 'bigint' ? formatGemsBalance(gemsBalance) : '0',
    currentTilePrice: getCurrentTilePrice(),
    playerTileCount: playerTileCount?.toString() || '0',
    hasReceivedAirdrop: hasReceivedAirdrop || false,

    // Contract interactions
    claimTileOnChain,
    harvestGemsOnChain,
    syncWithBlockchain,

    // Transaction states
    claimTile: {
      isPending: tileClaimHook.isPending,
      isConfirming: tileClaimHook.isConfirming,
      isConfirmed: tileClaimHook.isConfirmed,
      error: tileClaimHook.error,
      hash: tileClaimHook.hash,
    },

    harvest: {
      isPending: harvestHook.isPending,
      isConfirming: harvestHook.isConfirming,
      isConfirmed: harvestHook.isConfirmed,
      error: harvestHook.error,
      hash: harvestHook.hash,
    },

    airdrop: {
      isPending: airdropHook.isPending,
      isConfirming: airdropHook.isConfirming,
      isConfirmed: airdropHook.isConfirmed,
      error: airdropHook.error,
      hash: airdropHook.hash,
    },

    // Utility functions
    refetchBalances: () => Promise.all([refetchGems(), refetchTilePrice()]),
  };
}