# Cast Colony - Design Document

## Overview

Cast Colony is a Farcaster Mini App built with Next.js that implements a multiplayer strategy game on Base chain. The application uses a simple, mobile-first design optimized for Farcaster clients with proper Mini App integration including manifest, embeds, and SDK ready() calls.

## Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context + useState for game state
- **Web3 Integration**: wagmi + viem for Base chain interactions
- **Mini App SDK**: @farcaster/miniapp-sdk for proper integration

### Backend Architecture
- **Smart Contracts**: Deployed on Base chain
  - `LandTileNFT.sol`: ERC-721 for land ownership
  - `GemsToken.sol`: ERC-20 for in-game currency
  - `GameLogic.sol`: Core game mechanics and battle system
- **API Routes**: Next.js API routes for game state queries
- **Database**: Not required - all state stored on-chain

### Blockchain Integration
- **Network**: Base (Ethereum L2)
- **Wallet**: Coinbase Smart Wallet integration
- **Gas Optimization**: Batch transactions where possible
- **Error Handling**: Graceful fallbacks for failed transactions

## Components and Interfaces

### Core Components

#### 1. Mini App Shell (`app/layout.tsx`)
```typescript
interface MiniAppLayoutProps {
  children: React.ReactNode;
}

// Handles:
// - Farcaster SDK initialization
// - sdk.actions.ready() call after DOM load
// - Global state providers
// - Meta tags for embeds
```

#### 2. Game Map (`components/GameMap.tsx`)
```typescript
interface GameMapProps {
  tiles: TileData[];
  selectedTile: Coordinate | null;
  onTileClick: (coordinate: Coordinate) => void;
}

interface TileData {
  x: number;
  y: number;
  owner: string | null;
  gemsAccumulated: number;
  lastHarvest: number;
}
```

#### 3. Colony Dashboard (`components/ColonyDashboard.tsx`)
```typescript
interface ColonyDashboardProps {
  colony: ColonyData;
  treasury: number;
  ownedTiles: TileData[];
}

interface ColonyData {
  name: string;
  owner: string;
  createdAt: number;
  totalTiles: number;
}
```

#### 4. Battle Interface (`components/BattleInterface.tsx`)
```typescript
interface BattleInterfaceProps {
  targetTile: TileData;
  currentPhase: 'COMMIT' | 'REVEAL' | 'RESOLUTION';
  phaseEndTime: number;
  onCommitAttack: (gems: number) => void;
  onRevealMove: () => void;
}
```

### Smart Contract Interfaces

#### LandTileNFT Contract
```solidity
interface ILandTileNFT {
  function claimTile(uint256 x, uint256 y) external;
  function getTileOwner(uint256 x, uint256 y) external view returns (address);
  function getAccumulatedGems(uint256 x, uint256 y) external view returns (uint256);
  function harvestGems(uint256[] calldata tokenIds) external;
}
```

#### GemsToken Contract
```solidity
interface IGemsToken {
  function mint(address to, uint256 amount) external;
  function burn(uint256 amount) external;
  function balanceOf(address account) external view returns (uint256);
}
```

#### GameLogic Contract
```solidity
interface IGameLogic {
  function commitAttack(uint256 x, uint256 y, bytes32 commitment) external;
  function revealAttack(uint256 x, uint256 y, uint256 gems, uint256 nonce) external;
  function getCurrentRound() external view returns (uint256, uint256, uint8);
  function resolveRound() external;
}
```

## Data Models

### Game State Model
```typescript
interface GameState {
  currentRound: number;
  currentPhase: 'COMMIT' | 'REVEAL' | 'RESOLUTION';
  phaseEndTime: number;
  mapSize: { width: number; height: number };
  tiles: Map<string, TileData>; // key: "x,y"
}

interface UserState {
  colony: ColonyData | null;
  treasury: number;
  ownedTiles: TileData[];
  pendingMoves: BattleMove[];
}

interface BattleMove {
  targetX: number;
  targetY: number;
  gemsCommitted: number;
  commitment: string;
  revealed: boolean;
}
```

## Error Handling

### Transaction Errors
- **Gas Estimation Failures**: Show estimated gas and allow user adjustment
- **Insufficient Balance**: Clear messaging with current balance display
- **Network Issues**: Retry mechanism with exponential backoff
- **Contract Reverts**: Parse revert reasons and show user-friendly messages

### Mini App Errors
- **SDK Not Available**: Graceful fallback for non-Farcaster environments
- **Authentication Failures**: Clear login prompts and retry options
- **Loading States**: Skeleton screens and progress indicators
- **Offline Handling**: Cache game state and sync when reconnected

## Testing Strategy

### Unit Tests
- Smart contract functions (Foundry)
- React component rendering (Jest + React Testing Library)
- Utility functions and game logic
- Web3 integration helpers

### Integration Tests
- End-to-end game flows (Playwright)
- Smart contract interactions on testnet
- Mini App SDK integration
- Wallet connection flows

### Manual Testing
- Test in Farcaster clients (Warpcast mobile/desktop)
- Verify embed previews and sharing
- Check responsive design on various screen sizes
- Validate game mechanics and edge cases

## Mini App Specific Implementation

### Manifest Configuration (`public/.well-known/farcaster.json`)
```json
{
  "name": "Cast Colony",
  "subtitle": "Multiplayer Strategy Game",
  "description": "Claim territory, harvest resources, and battle for onchain pixel art supremacy",
  "iconUrl": "https://cast-colony.vercel.app/assets/icon-1024x1024.png",
  "homeUrl": "https://cast-colony.vercel.app",
  "splashImageUrl": "https://cast-colony.vercel.app/assets/splash-200x200.png",
  "splashBackgroundColor": "#1a1a2e",
  "primaryCategory": "game",
  "tags": ["strategy", "nft", "web3", "multiplayer", "base"]
}
```

### Embed Meta Tags
```html
<meta name="fc:miniapp" content='{"version": "1","imageUrl": "https://cast-colony.vercel.app/api/og/[colonyId]","button": {"title": "Play Cast Colony","action": {"type": "launch_miniapp","name": "Cast Colony","url": "https://cast-colony.vercel.app"}}}' />
```

### SDK Integration
```typescript
// app/layout.tsx
useEffect(() => {
  const initializeSDK = async () => {
    try {
      const { sdk } = await import('@farcaster/miniapp-sdk');
      await sdk.actions.ready();
      console.log('Mini App ready - splash screen hidden');
    } catch (error) {
      console.warn('SDK not available - running outside Farcaster');
    }
  };
  
  initializeSDK();
}, []);
```

### Asset Requirements
- **Icon**: 1024x1024px PNG for app icon
- **Splash**: 200x200px PNG for splash screen
- **Screenshots**: 1200x630px PNG for app store/sharing
- **Map Tiles**: SVG graphics for different tile states
- **Colony Emblems**: Procedurally generated or preset designs

## Performance Considerations

### Optimization Strategies
- **Map Rendering**: Virtual scrolling for large maps
- **State Updates**: Debounced blockchain queries
- **Image Loading**: Lazy loading for tile graphics
- **Bundle Size**: Code splitting for game features
- **Caching**: Aggressive caching of static game data

### Mobile Optimization
- **Touch Interactions**: Large tap targets for mobile
- **Network Efficiency**: Minimize API calls
- **Battery Usage**: Efficient polling intervals
- **Memory Management**: Cleanup unused game state

This design provides a solid foundation for building Cast Colony as a Farcaster Mini App while keeping implementation simple and focused on core functionality.