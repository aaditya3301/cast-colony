'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useGameWeb3 } from '@/hooks/useGameWeb3';
import { TileData } from '@/types/game';
import { LoadingSpinner } from './LoadingSpinner';

interface HarvestingInterfaceProps {
  onHarvestSuccess?: (gemsHarvested: number) => void;
}

export function HarvestingInterface({ onHarvestSuccess }: HarvestingInterfaceProps) {
  const { state, dispatch, getTotalHarvestableGems } = useGame();
  const { isConnected, harvestGemsOnChain, harvest, gemsBalance } = useGameWeb3();
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [harvestingTiles, setHarvestingTiles] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second for real-time GEMS display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
      dispatch({ type: 'UPDATE_GEMS_ACCUMULATION' });
    }, 1000);

    return () => clearInterval(interval);
  }, [dispatch]);

  if (!state.userState.colony || state.userState.ownedTiles.length === 0) {
    return null;
  }

  const calculateTileGems = (tile: TileData): number => {
    return Math.floor((currentTime - tile.lastHarvest) / (1000 * 60 * 60));
  };

  const formatTimeUntilNextGem = (tile: TileData): string => {
    const timeSinceHarvest = currentTime - tile.lastHarvest;
    const timeUntilNext = (60 * 60 * 1000) - (timeSinceHarvest % (60 * 60 * 1000));
    const minutes = Math.floor(timeUntilNext / (1000 * 60));
    const seconds = Math.floor((timeUntilNext % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleHarvestTile = async (tile: TileData) => {
    const tileKey = `${tile.x},${tile.y}`;
    const gemsToHarvest = calculateTileGems(tile);
    
    if (gemsToHarvest === 0) return;

    setHarvestingTiles(prev => new Set(prev).add(tileKey));

    try {
      if (isConnected) {
        // Use blockchain transaction
        const tokenId = tile.x * 1000 + tile.y;
        await harvestGemsOnChain([tokenId]);
        
        // Wait for transaction confirmation
        // The balance will be updated automatically via useGameWeb3
      } else {
        // Fallback to local state
        await new Promise(resolve => setTimeout(resolve, 500));

        dispatch({
          type: 'HARVEST_GEMS',
          payload: { tileKeys: [tileKey] },
        });
      }

      if (onHarvestSuccess) {
        onHarvestSuccess(gemsToHarvest);
      }
    } catch (error) {
      console.error('Error harvesting tile:', error);
    } finally {
      setHarvestingTiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(tileKey);
        return newSet;
      });
    }
  };

  const handleHarvestAll = async () => {
    const harvestableTiles = state.userState.ownedTiles.filter(tile => calculateTileGems(tile) > 0);
    if (harvestableTiles.length === 0) return;

    setIsHarvesting(true);
    const totalGems = harvestableTiles.reduce((sum, tile) => sum + calculateTileGems(tile), 0);

    try {
      if (isConnected) {
        // Use blockchain transaction
        const tokenIds = harvestableTiles.map(tile => tile.x * 1000 + tile.y);
        await harvestGemsOnChain(tokenIds);
        
        // Wait for transaction confirmation
        // The balance will be updated automatically via useGameWeb3
      } else {
        // Fallback to local state
        await new Promise(resolve => setTimeout(resolve, 800));

        const tileKeys = harvestableTiles.map(tile => `${tile.x},${tile.y}`);
        dispatch({
          type: 'HARVEST_GEMS',
          payload: { tileKeys },
        });
      }

      if (onHarvestSuccess) {
        onHarvestSuccess(totalGems);
      }
    } catch (error) {
      console.error('Error harvesting all tiles:', error);
    } finally {
      setIsHarvesting(false);
    }
  };

  const totalHarvestable = getTotalHarvestableGems();
  const harvestableTiles = state.userState.ownedTiles.filter(tile => calculateTileGems(tile) > 0);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Resource Harvesting</h3>
        <div className="text-2xl">🌾</div>
      </div>

      {/* Harvest Summary */}
      <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Total Harvestable:</span>
          <span className="text-2xl font-bold text-yellow-600">{totalHarvestable} 💎</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
          <span>Production Rate:</span>
          <span>{state.userState.ownedTiles.length} GEMS/hour</span>
        </div>
        {isConnected && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>On-chain Balance:</span>
            <span>{gemsBalance} GEMS</span>
          </div>
        )}
      </div>

      {/* Harvest All Button */}
      <button
        onClick={handleHarvestAll}
        disabled={totalHarvestable === 0 || isHarvesting}
        className={`w-full py-3 px-4 rounded-lg font-semibold mb-4 transition-all duration-200 ${
          totalHarvestable > 0 && !isHarvesting
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white transform hover:scale-105'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isHarvesting ? (
          <div className="flex items-center justify-center">
            <LoadingSpinner size="sm" color="white" className="mr-2" />
            Harvesting All...
          </div>
        ) : (
          `Harvest All (${totalHarvestable} GEMS)`
        )}
      </button>

      {/* Individual Tiles */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Individual Tiles:</h4>
        <div className="max-h-60 overflow-y-auto space-y-2">
          {state.userState.ownedTiles.map((tile, index) => {
            const tileKey = `${tile.x},${tile.y}`;
            const gemsAvailable = calculateTileGems(tile);
            const isHarvestingThis = harvestingTiles.has(tileKey);
            const timeUntilNext = formatTimeUntilNextGem(tile);

            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">
                      Tile ({tile.x}, {tile.y})
                    </span>
                    <span className="text-lg font-bold text-yellow-600">
                      {gemsAvailable} 💎
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {gemsAvailable > 0 ? (
                      `Ready to harvest`
                    ) : (
                      `Next GEM in ${timeUntilNext}`
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleHarvestTile(tile)}
                  disabled={gemsAvailable === 0 || isHarvestingThis}
                  className={`ml-3 px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                    gemsAvailable > 0 && !isHarvestingThis
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isHarvestingThis ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" color="white" className="mr-1" />
                      ...
                    </div>
                  ) : gemsAvailable > 0 ? (
                    'Harvest'
                  ) : (
                    'Wait'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-700 font-medium">💡 Production Info:</span>
        </div>
        <ul className="text-xs text-blue-600 mt-2 space-y-1">
          <li>• Each tile generates 10 GEMS per hour</li>
          <li>• GEMS accumulate automatically while you're away</li>
          <li>• Harvest regularly to maximize your treasury</li>
          <li>• Use GEMS to claim new tiles and battle enemies</li>
        </ul>
      </div>
    </div>
  );
}