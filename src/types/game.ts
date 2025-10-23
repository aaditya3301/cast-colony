// Core game types for Cast Colony

export interface Coordinate {
  x: number;
  y: number;
}

export interface TileData {
  x: number;
  y: number;
  owner: string | null;
  gemsAccumulated: number;
  lastHarvest: number;
}

export interface ColonyData {
  name: string;
  owner: string;
  createdAt: number;
  totalTiles: number;
}

export interface BattleMove {
  targetX: number;
  targetY: number;
  gemsCommitted: number;
  commitment: string;
  revealed: boolean;
}

export type GamePhase = 'COMMIT' | 'REVEAL' | 'RESOLUTION';

export interface GameState {
  currentRound: number;
  currentPhase: GamePhase;
  phaseEndTime: number;
  mapSize: { width: number; height: number };
  tiles: Map<string, TileData>; // key: "x,y"
}

export interface UserState {
  colony: ColonyData | null;
  treasury: number;
  ownedTiles: TileData[];
  pendingMoves: BattleMove[];
}

// Game action types
export type GameAction =
  | { type: 'CREATE_COLONY'; payload: { name: string; owner: string } }
  | { type: 'CLAIM_TILE'; payload: { x: number; y: number; owner: string } }
  | { type: 'HARVEST_GEMS'; payload: { tileKeys: string[] } }
  | { type: 'UPDATE_GEMS_ACCUMULATION' }
  | { type: 'SET_SELECTED_TILE'; payload: Coordinate | null }
  | { type: 'COMMIT_ATTACK'; payload: BattleMove }
  | { type: 'REVEAL_ATTACK'; payload: { targetX: number; targetY: number } }
  | { type: 'RESOLVE_BATTLE'; payload: { targetX: number; targetY: number; attackerGems: number; defenderGems: number; attacker: string } }
  | { type: 'ADVANCE_PHASE' }
  | { type: 'RESET_GAME' };

// Combined app state
export interface AppState {
  gameState: GameState;
  userState: UserState;
  selectedTile: Coordinate | null;
  isLoading: boolean;
  error: string | null;
}