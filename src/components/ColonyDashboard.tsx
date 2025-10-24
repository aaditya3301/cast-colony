'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useGameIntegration } from '@/hooks/useGameIntegration';
import { WalletConnection } from './WalletConnection';
import { BuyGemsModal } from './BuyGemsModal';

interface ColonyDashboardProps {
  onHarvestAll?: (gemsHarvested: number) => void;
  onClaimTile?: () => void;
}

export function ColonyDashboard({ onHarvestAll, onClaimTile }: ColonyDashboardProps) {
  const { state, dispatch, getTotalHarvestableGems, canClaimTile } = useGame();
  const gameIntegration = useGameIntegration();
  const { userState, selectedTile } = state;
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showBuyGemsModal, setShowBuyGemsModal] = useState(false);

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
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 sm:p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{userState.colony.name}</h1>
            <p className="text-purple-100 text-sm">
              Founded {formatTimeAgo(userState.colony.createdAt)}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="text-2xl sm:text-3xl font-bold">
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
            <div className="text-purple-100 text-sm">
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

        {/* Combined Production & Harvest Stats */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Production</h3>
            <span className="text-2xl">⚡</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-xl font-bold text-yellow-600">
                {userState.colony.totalTiles}
              </div>
              <div className="text-xs text-gray-600">GEMS/Hour</div>
            </div>
            <div className="border-t pt-2">
              <div className="text-xl font-bold text-blue-600">
                {harvestableGems}
              </div>
              <div className="text-xs text-gray-600">Ready to Harvest</div>
            </div>
          </div>
        </div>

        {/* Buy GEMS Card */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800">Buy GEMS</h3>
          </div>
          <div className="text-center">
            <button
              onClick={() => setShowBuyGemsModal(true)}
              disabled={!gameIntegration.isConnected}
              className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {gameIntegration.isConnected ? 'Buy with ETH' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </div>

      {/* Wallet Connection */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="font-semibold text-gray-800 mb-4">Wallet</h3>
        <WalletConnection />
      </div>

      {/* Actions */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="font-semibold text-gray-800 mb-4">Actions</h3>
        <div className="flex gap-3">

          {/* Claim Tile Button */}
          <button
            onClick={() => {
              if (!selectedTile) {
                alert('Please select a tile on the map first');
                return;
              }
              if (!userState.colony) {
                alert('No colony found');
                return;
              }

              dispatch({
                type: 'CLAIM_TILE',
                payload: {
                  x: selectedTile.x,
                  y: selectedTile.y,
                  owner: userState.colony.owner
                }
              });
            }}
            disabled={!selectedTile || !userState.colony}
            className="flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
          >
            <span className="mr-2">🏗️</span>
            {selectedTile ? `Claim Tile (${selectedTile.x}, ${selectedTile.y})` : 'Select Tile to Claim'}
          </button>

          {/* Harvest Button */}
          <button
            onClick={handleHarvestAll}
            disabled={harvestableGems === 0}
            className="flex items-center px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
          >
            <span className="mr-2">🌾</span>
            Harvest All ({harvestableGems} GEMS)
          </button>
        </div>
      </div>



      {/* Your Tiles */}
      {userState.ownedTiles.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold text-gray-800 mb-4">Your Tiles</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto">
            {userState.ownedTiles.map((tile, index) => {
              const gemsAccumulated = Math.floor((currentTime - tile.lastHarvest) / (1000 * 60 * 60));
              return (
                <div
                  key={index}
                  className="p-3 bg-green-50 rounded-lg border border-green-200 text-center"
                >
                  <div className="font-medium text-gray-800 mb-1">
                    ({tile.x}, {tile.y})
                  </div>
                  <div className="text-green-600 font-bold">
                    {gemsAccumulated} 💎
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}



      {/* Buy GEMS Modal */}
      <BuyGemsModal
        isOpen={showBuyGemsModal}
        onClose={() => setShowBuyGemsModal(false)}
      />
    </div>
  );
}