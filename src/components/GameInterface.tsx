'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { GameMap } from './GameMap';
import { ColonyDashboard } from './ColonyDashboard';
import { WelcomeScreen } from './WelcomeScreen';
import { TileClaimingInterface } from './TileClaimingInterface';
import { HarvestingInterface } from './HarvestingInterface';
import { BattleInterface } from './BattleInterface';
import { LoadingSpinner } from './LoadingSpinner';

export function GameInterface() {
  const { state, getTileByCoordinate } = useGame();
  const [activeTab, setActiveTab] = useState<'harvest' | 'claim' | 'battle'>('harvest');
  const [notification, setNotification] = useState<{
    type: 'success' | 'info' | 'warning';
    message: string;
  } | null>(null);

  // Show welcome screen if no colony exists
  if (!state.userState.colony) {
    return <WelcomeScreen onColonyCreated={() => {}} />;
  }

  // Show loading overlay for global loading states
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Game...</h2>
          <p className="text-gray-600">Please wait while we set up your colony.</p>
        </div>
      </div>
    );
  }

  const selectedTile = state.selectedTile;
  const selectedTileData = selectedTile ? getTileByCoordinate(selectedTile.x, selectedTile.y) : null;

  const getTileActionType = () => {
    if (!selectedTile) return null;
    
    if (!selectedTileData) {
      return 'claim'; // Empty tile
    }
    
    if (selectedTileData.owner === state.userState.colony?.owner) {
      return 'harvest'; // Own tile
    }
    
    return 'battle'; // Enemy tile
  };

  const showNotification = (type: 'success' | 'info' | 'warning', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleTileAction = (actionType: string, coordinate: { x: number; y: number }, tileData?: any) => {
    switch (actionType) {
      case 'claim':
        setActiveTab('claim');
        showNotification('info', `Selected empty tile (${coordinate.x}, ${coordinate.y})`);
        break;
      case 'harvest':
        setActiveTab('harvest');
        showNotification('info', `Selected your tile (${coordinate.x}, ${coordinate.y})`);
        break;
      case 'battle':
        setActiveTab('battle');
        showNotification('warning', `Selected enemy tile (${coordinate.x}, ${coordinate.y})`);
        break;
    }
  };

  const actionType = getTileActionType();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 overflow-x-hidden">
      {/* Simple Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border max-w-sm ${
          notification.type === 'success' ? 'bg-green-100 border-green-300 text-green-800' :
          notification.type === 'warning' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
          'bg-blue-100 border-blue-300 text-blue-800'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {notification.type === 'success' ? '✅' : 
               notification.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <span className="text-sm">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        {/* Colony Dashboard */}
        <div className="mb-6">
          <ColonyDashboard 
            onHarvestAll={(gems) => showNotification('success', `Harvested ${gems} GEMS!`)}
            onClaimTile={() => showNotification('success', 'Tile claimed!')}
          />
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Game Map */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            <GameMap 
              onTileClick={(coordinate) => {
                const tileData = getTileByCoordinate(coordinate.x, coordinate.y);
                if (!tileData) {
                  handleTileAction('claim', coordinate);
                } else if (tileData.owner === state.userState.colony?.owner) {
                  handleTileAction('harvest', coordinate, tileData);
                } else {
                  handleTileAction('battle', coordinate, tileData);
                }
              }}
            />
          </div>

          {/* Action Panel */}
          <div className="space-y-3 sm:space-y-4 order-2 lg:order-2">
            {/* Tab Navigation */}
            {selectedTile && (
              <div className="bg-white rounded-lg shadow border">
                <div className="flex border-b">
                  <button
                    onClick={() => setActiveTab('harvest')}
                    className={`flex-1 py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-medium smooth-transition touch-button ${
                      activeTab === 'harvest' 
                        ? 'bg-yellow-500 text-white' 
                        : 'text-gray-600 hover:text-gray-800 active:bg-gray-100'
                    }`}
                  >
                    <span className="block sm:inline">🌾</span>
                    <span className="hidden sm:inline ml-1">Harvest</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('claim')}
                    className={`flex-1 py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-medium smooth-transition touch-button ${
                      activeTab === 'claim' 
                        ? 'bg-green-500 text-white' 
                        : 'text-gray-600 hover:text-gray-800 active:bg-gray-100'
                    }`}
                  >
                    <span className="block sm:inline">🏗️</span>
                    <span className="hidden sm:inline ml-1">Claim</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('battle')}
                    className={`flex-1 py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-medium smooth-transition touch-button ${
                      activeTab === 'battle' 
                        ? 'bg-red-500 text-white' 
                        : 'text-gray-600 hover:text-gray-800 active:bg-gray-100'
                    }`}
                  >
                    <span className="block sm:inline">⚔️</span>
                    <span className="hidden sm:inline ml-1">Battle</span>
                  </button>
                </div>
              </div>
            )}

            {/* Action Interfaces */}
            {selectedTile ? (
              <div className="space-y-4">
                {/* Tile Claiming Interface */}
                {(activeTab === 'claim' || actionType === 'claim') && (
                  <TileClaimingInterface 
                    selectedTile={selectedTile}
                    onClaimSuccess={() => {
                      showNotification('success', `Tile (${selectedTile.x}, ${selectedTile.y}) claimed!`);
                      setActiveTab('harvest');
                    }}
                  />
                )}

                {/* Battle Interface */}
                {(activeTab === 'battle' || actionType === 'battle') && selectedTileData?.owner !== state.userState.colony?.owner && (
                  <BattleInterface 
                    selectedTile={selectedTile}
                    onBattleComplete={(result) => {
                      if (result === 'victory') {
                        showNotification('success', `Victory! Tile (${selectedTile.x}, ${selectedTile.y}) captured!`);
                        setActiveTab('harvest');
                      } else {
                        showNotification('warning', `Defeat! Attack failed.`);
                      }
                    }}
                  />
                )}

                {/* Show message for own tiles when battle tab is selected */}
                {activeTab === 'battle' && selectedTileData?.owner === state.userState.colony?.owner && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-2">ℹ️</span>
                      <span className="text-blue-800">You cannot battle your own tiles. Try harvesting instead!</span>
                    </div>
                  </div>
                )}

                {/* Show message for empty tiles when battle tab is selected */}
                {activeTab === 'battle' && !selectedTileData && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-2">ℹ️</span>
                      <span className="text-blue-800">Empty tiles cannot be battled. Try claiming instead!</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* No tile selected */
              <div className="bg-gray-50 border border-gray-200 p-4 sm:p-6 rounded-lg text-center">
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🗺️</div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Select a Tile</h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Tap any tile in the map to claim territory, harvest resources, or battle enemies.
                </p>
              </div>
            )}

            {/* Always show harvesting interface */}
            {(activeTab === 'harvest' || !selectedTile) && (
              <HarvestingInterface 
                onHarvestSuccess={(gems) => {
                  showNotification('success', `Harvested ${gems} GEMS!`);
                }}
              />
            )}
          </div>
        </div>


      </div>
    </div>
  );
}