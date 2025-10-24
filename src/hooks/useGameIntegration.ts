'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useGame } from '@/context/GameContext';
import { useGameWeb3 } from './useGameWeb3';
import { useDatabase } from './useDatabase';

export function useGameIntegration() {
  const { address, isConnected } = useAccount();
  const { state, dispatch } = useGame();
  const web3 = useGameWeb3();
  const db = useDatabase();
  
  const [isLoading, setIsLoading] = useState(false);
  const [farcasterAddress, setFarcasterAddress] = useState<string | null>(null);

  // Check for Farcaster wallet
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

  // Load player data when wallet connects
  useEffect(() => {
    if (currentAddress && currentIsConnected) {
      console.log('Wallet connected, loading territory data for:', currentAddress);
      loadPlayerData();
    }
  }, [currentAddress, currentIsConnected]);

  // Also refresh when blockchain balance changes (indicates new transactions)
  useEffect(() => {
    if (currentAddress && currentIsConnected && web3.gemsBalance) {
      console.log('GEMS balance changed, refreshing territory data...');
      // Small delay to let database sync
      setTimeout(() => {
        loadPlayerData();
      }, 1000);
    }
  }, [web3.gemsBalance, currentAddress, currentIsConnected]);

  const loadPlayerData = async () => {
    if (!currentAddress) return;

    setIsLoading(true);
    try {
      // Get player data from database
      const playerData = await db.getPlayer(currentAddress);
      
      if (playerData) {
        // Check blockchain for actual airdrop status
        const blockchainAirdropStatus = Boolean(web3.hasReceivedAirdrop);
        
        // Sync database with blockchain if different
        if (playerData.has_received_airdrop !== blockchainAirdropStatus) {
          await db.updatePlayer(currentAddress, {
            has_received_airdrop: blockchainAirdropStatus
          });
          playerData.has_received_airdrop = blockchainAirdropStatus;
        }

        // Get player's tiles from database
        const playerTiles = await db.getPlayerTiles(currentAddress);
        console.log('Player tiles from database:', playerTiles);
        
        // Load all tiles for map
        const allTiles = await db.getAllTiles();
        console.log('All tiles from database:', allTiles.length, 'total tiles');
        console.log('Player owns', playerTiles.length, 'tiles');

        // Update game state with database data
        dispatch({
          type: 'LOAD_PLAYER_DATA',
          payload: { playerData, tiles: allTiles }
        });
        
        console.log('Territory data loaded - Player should own', playerTiles.length, 'tiles');

        // Create or update colony with saved name
        if (playerData.colony_name && !state.userState.colony) {
          dispatch({
            type: 'CREATE_COLONY',
            payload: {
              name: playerData.colony_name,
              owner: currentAddress
            }
          });
        }
      }
    } catch (error) {
      console.error('Error loading player data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create colony and save to database
  const createColony = async (name: string) => {
    if (!currentAddress) return;

    try {
      // Save colony name to database
      await db.updatePlayer(currentAddress, {
        colony_name: name
      });

      // Update local state
      dispatch({
        type: 'CREATE_COLONY',
        payload: {
          name,
          owner: currentAddress
        }
      });
    } catch (error) {
      console.error('Error creating colony:', error);
    }
  };

  // Store pending tile claim coordinates
  const [pendingTileClaim, setPendingTileClaim] = useState<{x: number, y: number} | null>(null);

  // Claim tile - blockchain first, then database
  const claimTile = async (x: number, y: number) => {
    if (!currentAddress) throw new Error('Wallet not connected');

    try {
      // Store coordinates for when transaction confirms
      setPendingTileClaim({ x, y });
      
      // First, execute blockchain transaction
      await web3.claimTileOnChain(x, y);
      
      // Wait for confirmation, then update database
      // This will be handled by the transaction confirmation effect
    } catch (error) {
      console.error('Error claiming tile:', error);
      setPendingTileClaim(null); // Clear on error
      throw error;
    }
  };

  // Harvest tiles - blockchain first, then database
  const harvestTiles = async (tileIds: number[]) => {
    if (!currentAddress) throw new Error('Wallet not connected');

    try {
      // First, execute blockchain transaction
      await web3.harvestGemsOnChain(tileIds);
      
      // Wait for confirmation, then update database
      // This will be handled by the transaction confirmation effect
    } catch (error) {
      console.error('Error harvesting tiles:', error);
      throw error;
    }
  };

  // Claim airdrop - blockchain first, then database
  const claimAirdrop = async () => {
    console.log('claimAirdrop called, currentAddress:', currentAddress);
    console.log('currentIsConnected:', currentIsConnected);
    console.log('web3.airdrop state:', web3.airdrop);
    
    if (!currentAddress) throw new Error('Wallet not connected');

    try {
      // Execute blockchain transaction
      console.log('Calling web3.claimAirdrop()...');
      web3.claimAirdrop();
      
      // Database will be updated when transaction confirms
    } catch (error) {
      console.error('Error claiming airdrop:', error);
      throw error;
    }
  };

  // Buy GEMS with ETH
  const buyGems = async (ethAmount: string) => {
    console.log('buyGems called, ethAmount:', ethAmount, 'currentAddress:', currentAddress);
    
    if (!currentAddress) throw new Error('Wallet not connected');
    if (!ethAmount || parseFloat(ethAmount) <= 0) throw new Error('Invalid ETH amount');

    try {
      // Execute blockchain transaction
      console.log('Calling web3.buyGems()...');
      web3.buyGems(ethAmount);
      
      // Balance will be updated when transaction confirms
    } catch (error) {
      console.error('Error buying GEMS:', error);
      throw error;
    }
  };

  // Handle transaction confirmations
  useEffect(() => {
    const handleTileClaimConfirmation = async () => {
      if (web3.claimTile.isConfirmed && currentAddress && web3.claimTile.hash && pendingTileClaim) {
        console.log('Tile claim confirmed, updating database...', pendingTileClaim);
        
        try {
          // Small delay to ensure blockchain state is fully updated
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Add tile to database
          await db.claimTile(
            pendingTileClaim.x, 
            pendingTileClaim.y, 
            currentAddress, 
            web3.claimTile.hash
          );
          
          // Clear pending claim
          setPendingTileClaim(null);
          
          // Refresh all data
          await loadPlayerData();
          
          console.log('Tile successfully added to database and game state updated');
        } catch (error) {
          console.error('Error adding tile to database:', error);
          // Retry once after a longer delay
          setTimeout(async () => {
            try {
              await db.claimTile(
                pendingTileClaim.x, 
                pendingTileClaim.y, 
                currentAddress, 
                web3.claimTile.hash
              );
              setPendingTileClaim(null);
              await loadPlayerData();
              console.log('Tile successfully added to database on retry');
            } catch (retryError) {
              console.error('Retry failed:', retryError);
            }
          }, 5000);
        }
      }
    };
    
    handleTileClaimConfirmation();
  }, [web3.claimTile.isConfirmed, currentAddress, web3.claimTile.hash, pendingTileClaim]);

  useEffect(() => {
    if (web3.airdrop.isConfirmed && currentAddress) {
      // Airdrop confirmed - refresh data and force balance sync
      console.log('Airdrop confirmed, refreshing all data...');
      web3.syncWithBlockchain();
      loadPlayerData();
    }
  }, [web3.airdrop.isConfirmed, currentAddress]);

  useEffect(() => {
    if (web3.buyGemsTransaction.isConfirmed && currentAddress) {
      // GEMS purchase confirmed - refresh data and force balance sync
      console.log('GEMS purchase confirmed, refreshing all data...');
      web3.syncWithBlockchain();
      loadPlayerData();
    }
  }, [web3.buyGemsTransaction.isConfirmed, currentAddress]);

  useEffect(() => {
    if (web3.harvest.isConfirmed && currentAddress) {
      // Harvest confirmed - refresh data
      loadPlayerData();
    }
  }, [web3.harvest.isConfirmed, currentAddress]);

  useEffect(() => {
    if (web3.airdrop.isConfirmed && currentAddress) {
      // Airdrop confirmed - update database
      db.updatePlayer(currentAddress, {
        has_received_airdrop: true,
        gems_balance: 100 // Initial airdrop amount
      });
      loadPlayerData();
    }
  }, [web3.airdrop.isConfirmed, currentAddress]);

  return {
    // Connection status
    isConnected: currentIsConnected,
    address: currentAddress,
    isLoading,

    // Player data (from database, synced with blockchain)
    playerData: state.userState,
    hasReceivedAirdrop: web3.hasReceivedAirdrop,
    gemsBalance: web3.gemsBalance,
    currentTilePrice: web3.currentTilePrice,

    // Actions (blockchain-first)
    createColony,
    claimTile,
    harvestTiles,
    claimAirdrop,
    buyGems,
    loadPlayerData,
    syncWithBlockchain: web3.syncWithBlockchain,
    
    // Exchange rate info
    gemsPerEth: web3.gemsPerEth,

    // Transaction states
    transactions: {
      claimTile: web3.claimTile,
      harvest: web3.harvest,
      airdrop: web3.airdrop,
      buyGems: web3.buyGemsTransaction,
    },

    // Database operations
    database: db,
  };
}