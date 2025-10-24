'use client';

import { useGame } from '@/context/GameContext';
import { TileData, Coordinate } from '@/types/game';

interface GameMapProps {
  onTileClick?: (coordinate: Coordinate) => void;
}

export function GameMap({ onTileClick }: GameMapProps) {
  const { state, dispatch, getTileByCoordinate, canClaimTile } = useGame();
  const { gameState, userState, selectedTile } = state;

  const handleTileClick = (x: number, y: number) => {
    const coordinate = { x, y };

    // Set selected tile
    dispatch({
      type: 'SET_SELECTED_TILE',
      payload: coordinate,
    });

    // Call optional callback
    if (onTileClick) {
      onTileClick(coordinate);
    }
  };

  const getTileStatus = (x: number, y: number) => {
    const tile = getTileByCoordinate(x, y);

    if (!tile) {
      return canClaimTile(x, y) ? 'claimable' : 'empty';
    }

    if (tile.owner === userState.colony?.owner) {
      return 'owned';
    }

    return 'enemy';
  };

  const getTileColor = (status: string, isSelected: boolean) => {
    const baseClasses = 'transition-all duration-200 border-2';

    if (isSelected) {
      return `${baseClasses} border-yellow-400 ring-2 ring-yellow-300 ring-opacity-50`;
    }

    switch (status) {
      case 'owned':
        return `${baseClasses} bg-green-500 border-green-600 hover:bg-green-400`;
      case 'enemy':
        return `${baseClasses} bg-red-500 border-red-600 hover:bg-red-400`;
      case 'claimable':
        return `${baseClasses} bg-blue-200 border-blue-300 hover:bg-blue-300 cursor-pointer`;
      case 'empty':
      default:
        return `${baseClasses} bg-gray-200 border-gray-300 hover:bg-gray-300 cursor-pointer`;
    }
  };

  const getTileContent = (x: number, y: number, status: string) => {
    const tile = getTileByCoordinate(x, y);

    if (status === 'owned' && tile) {
      const gemsAccumulated = Math.floor((Date.now() - tile.lastHarvest) / (1000 * 60 * 60));
      return (
        <div className="text-center">
          <div className="text-xs font-bold text-black">
            {gemsAccumulated}
          </div>
          <div className="text-xs text-black">GEMS</div>
        </div>
      );
    }

    if (status === 'enemy' && tile) {
      return (
        <div className="text-center">
          <div className="text-xs font-bold text-black">⚔️</div>
        </div>
      );
    }

    if (status === 'claimable') {
      return (
        <div className="text-center">
          <div className="text-xs font-bold text-blue-700">+</div>
          <div className="text-xs text-blue-600">100</div>
        </div>
      );
    }

    return (
      <div className="text-center">
        <div className="text-xs text-gray-500">
          {x},{y}
        </div>
      </div>
    );
  };

  const renderGrid = () => {
    const tiles = [];

    for (let y = 0; y < gameState.mapSize.height; y++) {
      for (let x = 0; x < gameState.mapSize.width; x++) {
        const status = getTileStatus(x, y);
        const isSelected = selectedTile?.x === x && selectedTile?.y === y;

        tiles.push(
          <div
            key={`${x}-${y}`}
            className={`
              aspect-square flex items-center justify-center text-xs font-medium
              ${getTileColor(status, isSelected)}
              ${status === 'claimable' || status === 'empty' ? 'hover:scale-105' : ''}
            `}
            onClick={() => handleTileClick(x, y)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTileClick(x, y);
              }
            }}
            aria-label={`Tile at ${x}, ${y}. ${status === 'owned' ? 'Your territory' :
              status === 'enemy' ? 'Enemy territory' :
                status === 'claimable' ? 'Available to claim' :
                  'Empty tile'
              }`}
          >
            {getTileContent(x, y, status)}
          </div>
        );
      }
    }

    return tiles;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Map Header */}
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Territory Map</h2>
        <div className="flex justify-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 border border-green-600 rounded mr-2"></div>
            <span className="text-black font-medium">Your Tiles</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 border border-red-600 rounded mr-2"></div>
            <span className="text-black font-medium">Enemy Tiles</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-200 border border-blue-300 rounded mr-2"></div>
            <span className="text-black font-medium">Claimable</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded mr-2"></div>
            <span className="text-black font-medium">Empty</span>
            <span className="text-black font-medium">Empty</span>
          </div>
        </div>
      </div>

      {/* Game Map Grid */}
      <div
        className="grid gap-1 bg-gray-100 p-2 rounded-lg shadow-inner"
        style={{
          gridTemplateColumns: `repeat(${gameState.mapSize.width}, minmax(0, 1fr))`,
        }}
      >
        {renderGrid()}
      </div>

      {/* Selected Tile Info */}
      {selectedTile && (
        <div className="mt-4 p-3 bg-white rounded-lg shadow border">
          <h3 className="font-semibold text-gray-800 mb-2">
            Selected Tile ({selectedTile.x}, {selectedTile.y})
          </h3>
          {(() => {
            const tile = getTileByCoordinate(selectedTile.x, selectedTile.y);
            const status = getTileStatus(selectedTile.x, selectedTile.y);

            if (status === 'owned' && tile) {
              const gemsAccumulated = Math.floor((Date.now() - tile.lastHarvest) / (1000 * 60 * 60));
              return (
                <div className="text-sm text-gray-600">
                  <p>Status: <span className="text-green-600 font-medium">Owned by you</span></p>
                  <p>GEMS Available: <span className="font-medium">{gemsAccumulated}</span></p>
                  <p>Last Harvest: {new Date(tile.lastHarvest).toLocaleTimeString()}</p>
                </div>
              );
            }

            if (status === 'enemy' && tile) {
              return (
                <div className="text-sm text-gray-600">
                  <p>Status: <span className="text-red-600 font-medium">Enemy territory</span></p>
                  <p>Owner: {tile.owner}</p>
                </div>
              );
            }

            if (status === 'claimable') {
              return (
                <div className="text-sm text-gray-600">
                  <p>Status: <span className="text-blue-600 font-medium">Available to claim</span></p>
                  <p>Cost: <span className="font-medium">100 GEMS</span></p>
                  <p className="text-green-600">Adjacent to your territory</p>
                </div>
              );
            }

            return (
              <div className="text-sm text-gray-600">
                <p>Status: <span className="text-gray-500 font-medium">Empty</span></p>
                <p className="text-orange-600">Must be adjacent to your tiles to claim</p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}