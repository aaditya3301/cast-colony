'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, GameAction, TileData, ColonyData } from '@/types/game';

// Helper functions
const getTileKey = (x: number, y: number): string => `${x},${y}`;

// Initial state - clean map, no demo data
const createInitialTiles = (): Map<string, TileData> => {
    return new Map<string, TileData>();
};

// Load owned tiles - will be loaded from database
const loadOwnedTiles = (): TileData[] => {
    return []; // Clean start - tiles will be loaded from database
};

const initialState: AppState = {
    gameState: {
        currentRound: 1,
        currentPhase: 'COMMIT',
        phaseEndTime: Date.now() + 7 * 60 * 60 * 1000, // 7 hours from now
        mapSize: { width: 10, height: 10 },
        tiles: createInitialTiles(),
    },
    userState: {
        colony: null,
        treasury: 0,
        ownedTiles: loadOwnedTiles(),
        pendingMoves: [],
    },
    selectedTile: null,
    isLoading: false,
    error: null,
};

const isAdjacent = (x: number, y: number, ownedTiles: TileData[]): boolean => {
    if (ownedTiles.length === 0) return true; // First tile can be anywhere

    const adjacentPositions = [
        { x: x - 1, y },
        { x: x + 1, y },
        { x, y: y - 1 },
        { x, y: y + 1 },
    ];

    return ownedTiles.some(tile =>
        adjacentPositions.some(pos => pos.x === tile.x && pos.y === tile.y)
    );
};

const calculateGemsAccumulated = (tile: TileData): number => {
    const hoursSinceLastHarvest = (Date.now() - tile.lastHarvest) / (1000 * 60 * 60);
    return Math.floor(hoursSinceLastHarvest * 10); // 10 GEMS per hour
};

// Reducer function
function gameReducer(state: AppState, action: GameAction): AppState {
    switch (action.type) {
        case 'CREATE_COLONY': {
            const { name, owner } = action.payload;
            const newColony: ColonyData = {
                name,
                owner,
                createdAt: Date.now(),
                totalTiles: 0,
            };

            return {
                ...state,
                userState: {
                    ...state.userState,
                    colony: newColony,
                    treasury: 0, // No starter GEMS - must claim airdrop
                },
                error: null,
            };
        }

        case 'CLAIM_TILE': {
            const { x, y, owner } = action.payload;
            const tileKey = getTileKey(x, y);

            // Validation checks
            if (state.gameState.tiles.has(tileKey)) {
                return {
                    ...state,
                    error: 'Tile is already claimed',
                };
            }

            // Create new tile
            const newTile: TileData = {
                x,
                y,
                owner,
                gemsAccumulated: 0,
                lastHarvest: Date.now(),
            };

            // Update state
            const newTiles = new Map(state.gameState.tiles);
            newTiles.set(tileKey, newTile);

            const updatedOwnedTiles = [...state.userState.ownedTiles, newTile];
            
            const newState = {
                ...state,
                gameState: {
                    ...state.gameState,
                    tiles: newTiles,
                },
                userState: {
                    ...state.userState,
                    ownedTiles: updatedOwnedTiles,
                    colony: state.userState.colony ? {
                        ...state.userState.colony,
                        totalTiles: state.userState.colony.totalTiles + 1,
                    } : null,
                },
                selectedTile: null,
                error: null,
            };

            // Data will be persisted to database via API calls

            return newState;
        }

        case 'HARVEST_GEMS': {
            const { tileKeys } = action.payload;
            let totalHarvested = 0;
            const updatedTiles = new Map(state.gameState.tiles);
            const updatedOwnedTiles = [...state.userState.ownedTiles];

            tileKeys.forEach(tileKey => {
                const tile = updatedTiles.get(tileKey);
                if (tile && tile.owner === state.userState.colony?.owner) {
                    const gemsToHarvest = calculateGemsAccumulated(tile);
                    totalHarvested += gemsToHarvest;

                    // Update tile
                    const updatedTile = {
                        ...tile,
                        gemsAccumulated: 0,
                        lastHarvest: Date.now(),
                    };
                    updatedTiles.set(tileKey, updatedTile);

                    // Update owned tiles array
                    const ownedIndex = updatedOwnedTiles.findIndex(t => t.x === tile.x && t.y === tile.y);
                    if (ownedIndex !== -1) {
                        updatedOwnedTiles[ownedIndex] = updatedTile;
                    }
                }
            });

            return {
                ...state,
                gameState: {
                    ...state.gameState,
                    tiles: updatedTiles,
                },
                userState: {
                    ...state.userState,
                    treasury: state.userState.treasury + totalHarvested,
                    ownedTiles: updatedOwnedTiles,
                },
                error: null,
            };
        }

        case 'UPDATE_GEMS_ACCUMULATION': {
            const updatedTiles = new Map(state.gameState.tiles);
            const updatedOwnedTiles = [...state.userState.ownedTiles];

            // Update accumulation for all tiles
            updatedTiles.forEach((tile, key) => {
                const gemsAccumulated = calculateGemsAccumulated(tile);
                if (gemsAccumulated > tile.gemsAccumulated) {
                    const updatedTile = { ...tile, gemsAccumulated };
                    updatedTiles.set(key, updatedTile);

                    // Update owned tiles if this tile belongs to current user
                    if (tile.owner === state.userState.colony?.owner) {
                        const ownedIndex = updatedOwnedTiles.findIndex(t => t.x === tile.x && t.y === tile.y);
                        if (ownedIndex !== -1) {
                            updatedOwnedTiles[ownedIndex] = updatedTile;
                        }
                    }
                }
            });

            return {
                ...state,
                gameState: {
                    ...state.gameState,
                    tiles: updatedTiles,
                },
                userState: {
                    ...state.userState,
                    ownedTiles: updatedOwnedTiles,
                },
            };
        }

        case 'SET_SELECTED_TILE': {
            return {
                ...state,
                selectedTile: action.payload,
                error: null,
            };
        }

        case 'COMMIT_ATTACK': {
            const battleMove = action.payload;

            if (state.userState.treasury < battleMove.gemsCommitted) {
                return {
                    ...state,
                    error: 'Insufficient GEMS for attack',
                };
            }

            return {
                ...state,
                userState: {
                    ...state.userState,
                    treasury: state.userState.treasury - battleMove.gemsCommitted,
                    pendingMoves: [...state.userState.pendingMoves, battleMove],
                },
                error: null,
            };
        }

        case 'REVEAL_ATTACK': {
            const { targetX, targetY } = action.payload;
            const updatedMoves = state.userState.pendingMoves.map(move =>
                move.targetX === targetX && move.targetY === targetY
                    ? { ...move, revealed: true }
                    : move
            );

            return {
                ...state,
                userState: {
                    ...state.userState,
                    pendingMoves: updatedMoves,
                },
            };
        }

        case 'RESOLVE_BATTLE': {
            const { targetX, targetY, attackerGems, defenderGems, attacker } = action.payload;
            const tileKey = getTileKey(targetX, targetY);
            const targetTile = state.gameState.tiles.get(tileKey);

            if (!targetTile) {
                return {
                    ...state,
                    error: 'Target tile not found',
                };
            }

            // Simple battle resolution: higher GEMS wins
            const attackerWins = attackerGems > defenderGems;
            const updatedTiles = new Map(state.gameState.tiles);
            let updatedOwnedTiles = [...state.userState.ownedTiles];
            let updatedTreasury = state.userState.treasury;

            if (attackerWins) {
                // Attacker wins - transfer tile ownership
                const newTile = {
                    ...targetTile,
                    owner: attacker,
                    gemsAccumulated: 0,
                    lastHarvest: Date.now(),
                };
                updatedTiles.set(tileKey, newTile);

                // If current user is the attacker, add to owned tiles
                if (attacker === state.userState.colony?.owner) {
                    updatedOwnedTiles.push(newTile);
                } else {
                    // Remove from owned tiles if current user was the defender
                    updatedOwnedTiles = updatedOwnedTiles.filter(
                        tile => !(tile.x === targetX && tile.y === targetY)
                    );
                }
            } else {
                // Defender wins - attacker loses GEMS but tile stays with defender
                // GEMS were already deducted when attack was committed
            }

            // Remove the resolved battle from pending moves
            const updatedPendingMoves = state.userState.pendingMoves.filter(
                move => !(move.targetX === targetX && move.targetY === targetY)
            );

            return {
                ...state,
                gameState: {
                    ...state.gameState,
                    tiles: updatedTiles,
                },
                userState: {
                    ...state.userState,
                    treasury: updatedTreasury,
                    ownedTiles: updatedOwnedTiles,
                    pendingMoves: updatedPendingMoves,
                    colony: state.userState.colony ? {
                        ...state.userState.colony,
                        totalTiles: updatedOwnedTiles.length,
                    } : null,
                },
                error: null,
            };
        }

        case 'ADVANCE_PHASE': {
            let newPhase: 'COMMIT' | 'REVEAL' | 'RESOLUTION' = state.gameState.currentPhase;
            let newRound = state.gameState.currentRound;
            let newPhaseEndTime = state.gameState.phaseEndTime;

            switch (state.gameState.currentPhase) {
                case 'COMMIT':
                    newPhase = 'REVEAL';
                    newPhaseEndTime = Date.now() + 60 * 60 * 1000; // 1 hour
                    break;
                case 'REVEAL':
                    newPhase = 'RESOLUTION';
                    newPhaseEndTime = Date.now() + 5 * 60 * 1000; // 5 minutes
                    break;
                case 'RESOLUTION':
                    newPhase = 'COMMIT';
                    newRound += 1;
                    newPhaseEndTime = Date.now() + 7 * 60 * 60 * 1000; // 7 hours
                    break;
            }

            return {
                ...state,
                gameState: {
                    ...state.gameState,
                    currentPhase: newPhase,
                    currentRound: newRound,
                    phaseEndTime: newPhaseEndTime,
                },
            };
        }

        case 'SYNC_WALLET_BALANCE': {
            return {
                ...state,
                userState: {
                    ...state.userState,
                    treasury: action.payload.balance,
                },
            };
        }

        case 'LOAD_PLAYER_DATA': {
            const { playerData, tiles } = action.payload;
            
            // Convert database tiles to game tiles
            const gameStateMap = new Map<string, TileData>();
            const ownedTiles: TileData[] = [];
            
            tiles.forEach((tile: any) => {
                const tileKey = getTileKey(tile.x, tile.y);
                const gameTile: TileData = {
                    x: tile.x,
                    y: tile.y,
                    owner: tile.owner_address,
                    gemsAccumulated: tile.gems_accumulated || 0,
                    lastHarvest: new Date(tile.last_harvest).getTime(),
                };
                
                gameStateMap.set(tileKey, gameTile);
                
                // Add to owned tiles if this player owns it
                if (state.userState.colony && tile.owner_address === state.userState.colony.owner) {
                    ownedTiles.push(gameTile);
                }
            });

            return {
                ...state,
                gameState: {
                    ...state.gameState,
                    tiles: gameStateMap,
                },
                userState: {
                    ...state.userState,
                    treasury: playerData.gems_balance || 0,
                    ownedTiles,
                    colony: state.userState.colony ? {
                        ...state.userState.colony,
                        totalTiles: playerData.total_tiles_owned || 0,
                    } : null,
                },
            };
        }

        case 'RESET_GAME': {
            return initialState;
        }

        default:
            return state;
    }
}

// Context
interface GameContextType {
    state: AppState;
    dispatch: React.Dispatch<GameAction>;
    // Helper functions
    getTileByCoordinate: (x: number, y: number) => TileData | undefined;
    canClaimTile: (x: number, y: number) => boolean;
    getTotalHarvestableGems: () => number;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
interface GameProviderProps {
    children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    // Helper functions
    const getTileByCoordinate = (x: number, y: number): TileData | undefined => {
        return state.gameState.tiles.get(getTileKey(x, y));
    };

    const canClaimTile = (x: number, y: number): boolean => {
        const tileKey = getTileKey(x, y);
        return (
            !state.gameState.tiles.has(tileKey) &&
            state.userState.treasury >= 100 &&
            isAdjacent(x, y, state.userState.ownedTiles) &&
            x >= 0 && x < state.gameState.mapSize.width &&
            y >= 0 && y < state.gameState.mapSize.height
        );
    };

    const getTotalHarvestableGems = (): number => {
        return state.userState.ownedTiles.reduce((total, tile) => {
            return total + calculateGemsAccumulated(tile);
        }, 0);
    };

    const contextValue: GameContextType = {
        state,
        dispatch,
        getTileByCoordinate,
        canClaimTile,
        getTotalHarvestableGems,
    };

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    );
}

// Hook to use the game context
export function useGame(): GameContextType {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}