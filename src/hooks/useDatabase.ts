'use client';

import { useState, useEffect } from 'react';

export interface PlayerData {
  wallet_address: string;
  colony_name?: string;
  has_received_airdrop: boolean;
  gems_balance: number;
  total_tiles_owned: number;
  is_new_player?: boolean;
}

export interface TileData {
  id?: number;
  x: number;
  y: number;
  owner_address: string;
  last_harvest: string;
  gems_accumulated: number;
  claimed_at?: string;
}

export function useDatabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch player data
  const getPlayer = async (address: string): Promise<PlayerData | null> => {
    if (!address) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/player/${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch player data');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update player data
  const updatePlayer = async (address: string, data: Partial<PlayerData>): Promise<PlayerData | null> => {
    if (!address) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/player/${address}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update player data');
      }
      
      const result = await response.json();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get player's tiles
  const getPlayerTiles = async (address: string): Promise<TileData[]> => {
    if (!address) return [];
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/tiles/${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tiles');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get all tiles for map
  const getAllTiles = async (): Promise<TileData[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/tiles/all');
      if (!response.ok) {
        throw new Error('Failed to fetch all tiles');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Claim a tile
  const claimTile = async (x: number, y: number, ownerAddress: string, transactionHash?: string): Promise<TileData | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/tiles/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          x,
          y,
          owner_address: ownerAddress,
          transaction_hash: transactionHash,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to claim tile');
      }
      
      const result = await response.json();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Harvest tiles
  const harvestTiles = async (playerAddress: string, tileIds: number[], transactionHash?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/tiles/harvest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player_address: playerAddress,
          tile_ids: tileIds,
          transaction_hash: transactionHash,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to harvest tiles');
      }
      
      const result = await response.json();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getPlayer,
    updatePlayer,
    getPlayerTiles,
    getAllTiles,
    claimTile,
    harvestTiles,
  };
}