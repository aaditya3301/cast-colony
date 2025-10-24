'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useGameIntegration } from '@/hooks/useGameIntegration';
import { WalletConnection } from './WalletConnection';

interface ColonyDashboardProps {
  onHarvestAll?: (gemsHarvested: number) => void;
  onClaimTile?: () => void;
}

export function ColonyDashboard({ onHarvestAll, onClaimTile }: ColonyDashboardProps) {
  const { state, dispatch, getTotalHarvestableGems, canClaimTile } = useGame();
  const gameIntegration = useGameIntegration();
  const { userState, selectedTile } = state;
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every minute to refresh GEMS display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
      // Update gems accumulation in the game state
      dispatch({ type: 'UPDATE_GEMS_ACCUMULATION' });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleHarvestAll = () => {
    const tileKeys = userState.ownedTiles.map(tile => `${tile.x},${tile.y}`);
    const harvestableGems = getTotalHarvestableGems();
    
    if (tileKeys.length > 0 && harvestableGems > 0) {
      dispatch({
        type: 'HARVEST_GEMS',
        payload: { tileKeys },
      });
      
      if (onHarvestAll) {
        onHarvestAll(harvestableGems);
      }
    }
  };

  const handleClaimSelectedTile = () => {
    if (selectedTile && userState.colony && canClaimTile(selectedTile.x, selectedTile.y)) {
      dispatch({
        type: 'CLAIM_TILE',
        payload: {
          x: selectedTile.x,
          y: selectedTile.y,
          owner: userState.colony.owner,
        },
      });
      
      if (onClaimTile) {
        onClaimTile();
      }
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((currentTime - timestamp) / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (!userState.colony) {
    return null;
  }

  const harvestableGems = getTotalHarvestableGems();
  const canClaimSelected = selectedTile && canClaimTile(selectedTile.x, selectedTile.y);
  const hasInsufficientFunds = userState.treasury < 100;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Colony Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{userState.colony.name}</h1>
            <p className="text-purple-100">
              Founded {formatTimeAgo(userState.colony.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <div className="text-3xl font-bold">
                {gameIntegration.isConnected ? parseInt(gameIntegration.gemsBalance) : userState.treasury}
              </div>
              {gameIntegration.isConnected && (
                <button
                  onClick={() => {
                    console.log('Refreshing balance...');
                    gameIntegration.syncWithBlockchain();
                  }}
                  className="p-1 text-purple-200 hover:text-white hover:bg-purple-600 rounded transition-colors"
                  title="Refresh balance"
                >
                  🔄
                </button>
              )}
            </div>
            <div className="text-purple-100">
              GEMS {gameIntegration.isConnected && '(On-chain)'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Territory Stats */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Territory</h3>
            <span className="text-2xl">🏰</span>
          </div>
          <div className="text-2xl font-bold text-green-600 mb-1">
            {userState.colony.totalTiles}
          </div>
          <div className="text-sm text-gray-600">Tiles Owned</div>
        </div>

        {/* Production Stats */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Production</h3>
            <span className="text-2xl">⚡</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600 mb-1">
            {userState.colony.totalTiles}
          </div>
          <div className="text-sm text-gray-600">GEMS/Hour</div>
        </div>

        {/* Harvestable GEMS */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Ready to Harvest</h3>
            <span className="text-2xl">💎</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {harvestableGems}
          </div>
          <div className="text-sm text-gray-600">GEMS Available</div>
        </div>
      </div>

      {/* Wallet Connection */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="font-semibold text-gray-800 mb-4">Web3 Integration</h3>
        <WalletConnection />
        
        {/* Airdrop Status */}
        {gameIntegration.isConnected && (
          <div className="mt-4 p-3 rounded-lg border">
            {gameIntegration.transactions.airdrop.isPending || gameIntegration.transactions.airdrop.isConfirming ? (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm">
                  {gameIntegration.transactions.airdrop.isPending ? 'Claiming airdrop...' : 'Confirming airdrop...'}
                </span>
              </div>
            ) : gameIntegration.hasReceivedAirdrop ? (
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                <span className="text-sm">Airdrop received (100 GEMS)</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-yellow-600">
                  <span className="mr-2">🎁</span>
                  <span className="text-sm">New player airdrop available</span>
                </div>
                <button
                  onClick={() => {
                    console.log('Manual airdrop claim triggered');
                    gameIntegration.claimAirdrop();
                  }}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
                >
                  Claim 100 GEMS
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Pricing Info */}
        {gameIntegration.isConnected && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <div className="flex justify-between">
                <span>Next tile cost:</span>
                <span className="font-medium">{gameIntegration.currentTilePrice} GEMS</span>
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Price increases by 50 GEMS per tile owned
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="font-semibold text-gray-800 mb-4">Actions</h3>
        <div className="flex flex-wrap gap-3">
          {/* Harvest Button */}
          <button
            onClick={handleHarvestAll}
            disabled={harvestableGems === 0}
            className="flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
          >
            <span className="mr-2">🌾</span>
            Harvest All ({harvestableGems} GEMS)
          </button>

          {/* Claim Tile Button */}
          {selectedTile && (
            <button
              onClick={handleClaimSelectedTile}
              disabled={!canClaimSelected || hasInsufficientFunds}
              className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              <span className="mr-2">🏗️</span>
              Claim Tile ({selectedTile.x}, {selectedTile.y})
              {hasInsufficientFunds && (
                <span className="ml-2 text-xs">(Need 100 GEMS)</span>
              )}
            </button>
          )}
        </div>

        {/* Error Messages */}
        {state.error && (
          <div className="mt-3 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {state.error}
            </div>
          </div>
        )}
      </div>

      {/* Owned Tiles List */}
      {userState.ownedTiles.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold text-gray-800 mb-4">Your Territories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
            {userState.ownedTiles.map((tile, index) => {
              const gemsAccumulated = Math.floor((currentTime - tile.lastHarvest) / (1000 * 60 * 60));
              return (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded border hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">
                      ({tile.x}, {tile.y})
                    </span>
                    <span className="text-green-600 font-bold">
                      {gemsAccumulated} 💎
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last harvest: {formatTimeAgo(tile.lastHarvest)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Game Phase Info */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-800">
              Round {state.gameState.currentRound} - {state.gameState.currentPhase} Phase
            </h4>
            <p className="text-blue-600 text-sm">
              Phase ends: {new Date(state.gameState.phaseEndTime).toLocaleString()}
            </p>
          </div>
          <div className="text-blue-600">
            {state.gameState.currentPhase === 'COMMIT' && '⚔️'}
            {state.gameState.currentPhase === 'REVEAL' && '👁️'}
            {state.gameState.currentPhase === 'RESOLUTION' && '⚖️'}
          </div>
        </div>
      </div>
    </div>
  );
}