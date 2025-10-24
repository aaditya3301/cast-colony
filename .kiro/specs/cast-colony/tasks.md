# Cast Colony - Fresh Start Implementation Plan

## 🎯 Development Phases

### Phase 1: Frontend Game Logic (Local Development)
Build complete game mechanics and UI without blockchain/Farcaster dependencies

### Phase 2: Farcaster Mini App Deployment  
Deploy frontend as Farcaster Mini App with authentication

### Phase 3: Blockchain Integration
Add smart contracts and Web3 functionality

---

## Phase 1: Frontend Game Logic

- [ ] 1. Project Setup and Core Structure
  - [x] 1.1 Initialize minimal Next.js project



    - Create package.json with minimal dependencies (Next.js, React, Tailwind)
    - Set up basic project structure (src/app, src/components)
    - Configure TypeScript and Tailwind CSS
    - _Goal: Clean, lightweight foundation_

  - [x] 1.2 Create game state management





    - Build GameContext with React Context + useReducer
    - Define core game types (Colony, Tile, GameState)
    - Implement state actions (create colony, claim tile, harvest)
    - _Goal: Complete game state without external dependencies_

- [x] 2. Core Game Components





  - [x] 2.1 Build WelcomeScreen component


    - Simple colony creation form with name validation
    - Game rules and instructions display
    - Clean, mobile-first design
    - _Goal: User onboarding and colony creation_

  - [x] 2.2 Create GameMap component


    - Interactive 10x10 grid with tile visualization
    - Click handlers for tile selection and claiming
    - Visual indicators for owned/empty/enemy tiles
    - _Goal: Core game interaction interface_

  - [x] 2.3 Build ColonyDashboard component


    - Display colony name, GEMS balance, tiles owned
    - Real-time updates from game state
    - Clean stats presentation
    - _Goal: Game status overview_

- [x] 3. Game Mechanics Implementation





  - [x] 3.1 Implement tile claiming system


    - Adjacency rule validation (tiles must be adjacent)
    - GEMS cost deduction (100 GEMS per tile)
    - Visual feedback and error handling
    - _Goal: Core territory expansion mechanic_

  - [x] 3.2 Add resource harvesting


    - GEMS accumulation over time (1 GEM/tile/hour)
    - Harvest individual tiles or all tiles
    - Treasury balance updates
    - _Goal: Resource management system_

  - [x] 3.3 Create battle system (simplified)


    - Attack enemy tiles with GEMS commitment
    - Simple battle resolution (higher GEMS wins)
    - Tile ownership transfer on victory
    - _Goal: PvP interaction without complex commit/reveal_

- [-] 4. UI Polish and Mobile Optimization





  - [x] 4.1 Mobile-first responsive design


    - Touch-friendly buttons and interactions
    - Proper viewport configuration
    - Smooth animations and transitions
    - _Goal: Excellent mobile experience_

  - [x] 4.2 Game flow optimization




    - Loading states and user feedback
    - Error handling and validation
    - Intuitive navigation and controls
    - _Goal: Polished user experience_

---

## Phase 2: Farcaster Mini App Deployment

- [ ] 5. Farcaster Integration
  - [x] 5.1 Add Farcaster Mini App SDK





    - Install @farcaster/miniapp-sdk
    - Create farcaster.json manifest
    - Set up Mini App metadata and configuration
    - _Goal: Farcaster Mini App foundation_

  - [ ] 5.2 Implement Farcaster authentication
    - User authentication via Farcaster SDK
    - User profile integration with game state
    - Colony ownership tied to Farcaster user ID
    - _Goal: Real user authentication_

  - [ ] 5.3 Deploy to Farcaster
    - Deploy to Vercel/production hosting
    - Test in Farcaster clients (Warpcast)
    - Optimize for Mini App environment
    - _Goal: Live Farcaster Mini App_

---

## Phase 3: Blockchain Integration

- [x] 6. Smart Contract Development









  - [x] 6.1 Create GEMS token contract (ERC-20)








  - [x] 6.2 Create Land Tile NFT contract (ERC-721)  






  - [x] 6.3 Create Game Logic contract




  - [x] 6.4 Deploy contracts to Base chain






- [x] 7. Web3 Integration





  - [x] 7.1 Add wagmi and Web3 dependencies





  - [x] 7.2 Implement wallet connection (Coinbase Smart Wallet)

  - [x] 7.3 Connect game actions to smart contracts


  - [x] 7.4 Add transaction handling and error management




- [ ] 8. Advanced Features
  - [ ] 8.1 Implement commit/reveal battle system
  - [ ] 8.2 Add round-based gameplay with timers
  - [ ] 8.3 Create sharing and social features
  - [ ] 8.4 Add leaderboards and achievements

---

## Success Criteria

### Phase 1 Complete:
- ✅ Fully functional game playable locally
- ✅ All core mechanics working (claim, harvest, battle)
- ✅ Mobile-optimized UI
- ✅ No external dependencies or crashes

### Phase 2 Complete:
- ✅ Game deployed as Farcaster Mini App
- ✅ User authentication working
- ✅ Multiplayer functionality (multiple users can play)

### Phase 3 Complete:
- ✅ Full blockchain integration
- ✅ Real NFTs and tokens
- ✅ Decentralized game state