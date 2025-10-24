'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useGameWeb3 } from '@/hooks/useGameWeb3';
import { Coordinate } from '@/types/game';
import { LoadingSpinner } from './LoadingSpinner';

interface TileClaimingInterfaceProps {
  selectedTile: Coordinate | null;
  onClaimSuccess?: () => void;
}

export function TileClaimingInterface({ selectedTile, onClaimSuccess }: TileClaimingInterfaceProps) {
  const { state, dispatch, canClaimTile, getTileByCoordinate } = useGame();
  const { isConnected, claimTileOnChain, claimTile, currentTilePrice, gemsBalance } = useGameWeb3();
  const [isProcessing, setIsProcessing] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Watch for successful tile claim transaction
  useEffect(() => {
    if (claimTile.isConfirmed && !isProcessing) {
      // Transaction confirmed, let the database sync handle state updates
      console.log('Tile claim transaction confirmed');
      setIsProcessing(false);
      
      if (onClaimSuccess) {
        onClaimSuccess();
      }
    }
  }, [claimTile.isConfirmed, onClaimSuccess, isProcessing]);

  // Watch for transaction errors
  useEffect(() => {
    if (claimTile.error) {
      setClaimError(claimTile.error.message || 'Transaction failed');
      setIsProcessing(false);
    }
  }, [claimTile.error]);

  if (!selectedTile || !state.userState.colony) {
    return null;
  }

  const tile = getTileByCoordinate(selectedTile.x, selectedTile.y);
  const canClaim = canClaimTile(selectedTile.x, selectedTile.y);
  const tilePrice = isConnected ? currentTilePrice : 100;
  const currentBalance = isConnected ? parseInt(gemsBalance) : state.userState.treasury;
  const hasInsufficientFunds = currentBalance < tilePrice;

  const getClaimabilityStatus = () => {
    if (!isConnected) {
      return { canClaim: false, reason: 'Connect wallet to claim tiles' };
    }

    if (tile) {
      if (tile.owner === state.userState.colony?.owner) {
        return { canClaim: false, reason: 'You already own this tile' };
      }
      return { canClaim: false, reason: 'This tile is owned by another colony' };
    }

    // TESTING MODE: Skip insufficient funds check
    // if (hasInsufficientFunds) {
    //   return { canClaim: false, reason: `Insufficient GEMS (need ${tilePrice})` };
    // }

    if (state.userState.ownedTiles.length === 0) {
      return { canClaim: true, reason: 'First tile can be claimed anywhere' };
    }

    if (!canClaim) {
      return { canClaim: false, reason: 'Tile must be adjacent to your existing tiles' };
    }

    return { canClaim: true, reason: 'Ready to claim' };
  };

  const handleClaimTile = async () => {
    if (!canClaim || !state.userState.colony) return;

    setIsProcessing(true);
    setClaimError(null);

    try {
      if (isConnected) {
        // Use blockchain transaction
        await claimTileOnChain(selectedTile.x, selectedTile.y);
        // The rest will be handled by the useEffect watching for confirmation
      } else {
        // Require wallet connection for claiming
        setClaimError('Please connect your wallet to claim tiles');
        setIsProcessing(false);
        return;
      }
    } catch (error: any) {
      setClaimError(error.message || 'Failed to claim tile. Please try again.');
      setIsProcessing(false);
    }
  };

  const status = getClaimabilityStatus();

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Claim Tile ({selectedTile.x}, {selectedTile.y})
        </h3>
        <div className="text-2xl">
          {status.canClaim ? '🏗️' : '❌'}
        </div>
      </div>

      {/* Tile Status */}
      <div className="mb-4 p-3 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Status:</span>
          <span className={`text-sm font-semibold ${
            status.canClaim ? 'text-green-600' : 'text-red-600'
          }`}>
            {status.reason}
          </span>
        </div>

        {status.canClaim && (
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Your Balance:</span>
              <span className="font-medium text-green-600">
                {currentBalance} GEMS
              </span>
            </div>
            <div className="flex justify-between">
              <span>After Claiming:</span>
              <span className="font-medium text-green-600">
                {currentBalance} GEMS (No cost)
              </span>
            </div>
            {isConnected && (
              <div className="text-xs text-blue-600 mt-2">
                💡 Next tile will cost {tilePrice + 50} GEMS
              </div>
            )}
          </div>
        )}
      </div>

      {/* Adjacency Visualization */}
      {state.userState.ownedTiles.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Adjacent Tiles:</h4>
          <div className="grid grid-cols-3 gap-1 w-fit mx-auto">
            {[-1, 0, 1].map(dy => (
              [-1, 0, 1].map(dx => {
                const checkX = selectedTile.x + dx;
                const checkY = selectedTile.y + dy;
                const isCenter = dx === 0 && dy === 0;
                const isOwned = state.userState.ownedTiles.some(
                  t => t.x === checkX && t.y === checkY
                );
                
                return (
                  <div
                    key={`${dx}-${dy}`}
                    className={`w-8 h-8 border text-xs flex items-center justify-center ${
                      isCenter 
                        ? 'bg-blue-200 border-blue-400 font-bold' 
                        : isOwned 
                          ? 'bg-green-200 border-green-400' 
                          : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    {isCenter ? '?' : isOwned ? '✓' : ''}
                  </div>
                );
              })
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">
            Green tiles are yours, ? is the selected tile
          </p>
        </div>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <div className="mb-3 p-3 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-lg text-sm">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            Wallet not connected. Claims will be local only.
          </div>
        </div>
      )}

      {/* Transaction Status */}
      {(claimTile.isPending || claimTile.isConfirming) && (
        <div className="mb-3 p-3 bg-blue-100 border border-blue-300 text-blue-700 rounded-lg text-sm">
          <div className="flex items-center">
            <LoadingSpinner size="sm" className="mr-2" />
            {claimTile.isPending ? 'Sending transaction...' : 'Confirming transaction...'}
          </div>
          {claimTile.hash && (
            <div className="mt-1 text-xs">
              Hash: {claimTile.hash.slice(0, 10)}...{claimTile.hash.slice(-8)}
            </div>
          )}
        </div>
      )}

      {/* Claim Button */}
      <button
        onClick={handleClaimTile}
        disabled={!status.canClaim || isProcessing || claimTile.isPending || claimTile.isConfirming}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
          status.canClaim && !isProcessing && !claimTile.isPending && !claimTile.isConfirming
            ? 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isProcessing || claimTile.isPending || claimTile.isConfirming ? (
          <div className="flex items-center justify-center">
            <LoadingSpinner size="sm" color="white" className="mr-2" />
            {claimTile.isPending ? 'Sending Transaction...' : 
             claimTile.isConfirming ? 'Confirming...' : 'Claiming Tile...'}
          </div>
        ) : status.canClaim ? (
          isConnected ? `Claim Tile on Blockchain (${tilePrice} GEMS)` : `Claim Tile for ${tilePrice} GEMS`
        ) : (
          'Cannot Claim Tile'
        )}
      </button>

      {/* Error Display */}
      {claimError && (
        <div className="mt-3 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            {claimError}
          </div>
        </div>
      )}

      {/* Success Tips */}
      {status.canClaim && !isProcessing && (
        <div className="mt-3 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
          <div className="flex items-center">
            <span className="mr-2">💡</span>
            This tile will generate 10 GEMS per hour once claimed!
          </div>
        </div>
      )}
    </div>
  );
}