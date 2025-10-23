'use client';

import { useGame } from '@/context';

export function GameStateDemo() {
  const { state, dispatch, canClaimTile, getTotalHarvestableGems } = useGame();
  
  const handleCreateColony = () => {
    dispatch({
      type: 'CREATE_COLONY',
      payload: {
        name: 'Test Colony',
        owner: 'user123',
      },
    });
  };
  
  const handleClaimTile = (x: number, y: number) => {
    if (state.userState.colony && canClaimTile(x, y)) {
      dispatch({
        type: 'CLAIM_TILE',
        payload: {
          x,
          y,
          owner: state.userState.colony.owner,
        },
      });
    }
  };
  
  const handleHarvestAll = () => {
    const tileKeys = state.userState.ownedTiles.map(tile => `${tile.x},${tile.y}`);
    if (tileKeys.length > 0) {
      dispatch({
        type: 'HARVEST_GEMS',
        payload: { tileKeys },
      });
    }
  };
  
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cast Colony - Game State Demo</h1>
      
      {/* Colony Status */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Colony Status</h2>
        {state.userState.colony ? (
          <div>
            <p><strong>Name:</strong> {state.userState.colony.name}</p>
            <p><strong>Owner:</strong> {state.userState.colony.owner}</p>
            <p><strong>Treasury:</strong> {state.userState.treasury} GEMS</p>
            <p><strong>Tiles Owned:</strong> {state.userState.colony.totalTiles}</p>
            <p><strong>Harvestable GEMS:</strong> {getTotalHarvestableGems()}</p>
          </div>
        ) : (
          <div>
            <p>No colony created yet</p>
            <button
              onClick={handleCreateColony}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Create Colony
            </button>
          </div>
        )}
      </div>
      
      {/* Game Actions */}
      {state.userState.colony && (
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Actions</h2>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleClaimTile(0, 0)}
              disabled={!canClaimTile(0, 0)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
            >
              Claim Tile (0,0)
            </button>
            <button
              onClick={() => handleClaimTile(1, 0)}
              disabled={!canClaimTile(1, 0)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
            >
              Claim Tile (1,0)
            </button>
            <button
              onClick={handleHarvestAll}
              disabled={getTotalHarvestableGems() === 0}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-300"
            >
              Harvest All
            </button>
          </div>
        </div>
      )}
      
      {/* Game State Info */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Game State</h2>
        <p><strong>Round:</strong> {state.gameState.currentRound}</p>
        <p><strong>Phase:</strong> {state.gameState.currentPhase}</p>
        <p><strong>Map Size:</strong> {state.gameState.mapSize.width}x{state.gameState.mapSize.height}</p>
        <p><strong>Total Tiles Claimed:</strong> {state.gameState.tiles.size}</p>
      </div>
      
      {/* Owned Tiles */}
      {state.userState.ownedTiles.length > 0 && (
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Owned Tiles</h2>
          <div className="grid grid-cols-2 gap-2">
            {state.userState.ownedTiles.map((tile, index) => (
              <div key={index} className="p-2 bg-gray-100 rounded">
                <p><strong>Position:</strong> ({tile.x}, {tile.y})</p>
                <p><strong>GEMS:</strong> {tile.gemsAccumulated}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {state.error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {state.error}
        </div>
      )}
    </div>
  );
}