# Cast Colony - Requirements Document

## Introduction

Cast Colony is a multiplayer strategy game built as a Farcaster Mini App on Base chain. Players form Colonies to claim land tiles (NFTs), harvest GEMS (ERC-20), and battle for territory control to create onchain pixel art.

## Glossary

- **Cast Colony**: The game system and Mini App
- **Colony**: A player's guild/team entity that owns tiles and GEMS
- **Land Tile**: An NFT representing a coordinate [X,Y] on the game map
- **GEMS**: ERC-20 token used as in-game currency
- **Game Round**: 8-hour cycles with Commit (7h) and Reveal (1h) phases
- **Base Chain**: The blockchain network where smart contracts are deployed
- **Farcaster Mini App**: The web application that runs within Farcaster clients

## Requirements

### Requirement 1: Colony Management

**User Story:** As a new player, I want to create a Colony so that I can start playing the game.

#### Acceptance Criteria

1. WHEN a user opens the Mini App, THE Cast Colony SHALL display a welcome screen with game overview
2. WHEN a user clicks "Create Colony", THE Cast Colony SHALL prompt for colony name input
3. WHEN a user submits a valid colony name, THE Cast Colony SHALL create a new colony on Base chain
4. WHEN colony creation succeeds, THE Cast Colony SHALL grant 100 starter GEMS to the colony treasury
5. WHERE a user already has a colony, THE Cast Colony SHALL display the main game map

### Requirement 2: Land Tile System

**User Story:** As a colony owner, I want to claim and own land tiles so that I can generate GEMS and expand my territory.

#### Acceptance Criteria

1. WHEN a user views the map, THE Cast Colony SHALL display a 10x10 grid showing tile ownership
2. WHEN a user clicks an empty tile, THE Cast Colony SHALL show claim option with 100 GEMS cost
3. WHEN a user confirms tile claim, THE Cast Colony SHALL mint an NFT for that coordinate
4. WHILE a user owns tiles, THE Cast Colony SHALL generate 1 GEM per tile per hour
5. WHERE a user claims new tiles, THE Cast Colony SHALL enforce adjacency rules to existing tiles

### Requirement 3: Resource Management

**User Story:** As a colony owner, I want to harvest GEMS from my tiles so that I can expand my territory and participate in battles.

#### Acceptance Criteria

1. WHEN tiles generate GEMS, THE Cast Colony SHALL accumulate unharvested GEMS on each tile
2. WHEN a user clicks "Harvest", THE Cast Colony SHALL transfer all accumulated GEMS to colony treasury
3. WHEN GEMS are harvested, THE Cast Colony SHALL update the treasury balance display
4. WHILE tiles are owned, THE Cast Colony SHALL continue passive GEM generation
5. WHERE treasury has sufficient GEMS, THE Cast Colony SHALL enable tile claiming and battle actions

### Requirement 4: Battle System

**User Story:** As a colony owner, I want to attack enemy tiles so that I can expand my territory through conquest.

#### Acceptance Criteria

1. WHEN a user clicks an enemy tile, THE Cast Colony SHALL display attack options
2. WHEN a user commits an attack, THE Cast Colony SHALL lock GEMS and create secret hash
3. WHILE in Commit Phase, THE Cast Colony SHALL hide attack amounts from other players
4. WHEN Reveal Phase starts, THE Cast Colony SHALL require players to reveal their moves
5. WHEN round ends, THE Cast Colony SHALL automatically resolve battles and transfer tiles

### Requirement 5: Mini App Integration

**User Story:** As a Farcaster user, I want the game to work seamlessly in my Farcaster client so that I can play without leaving the platform.

#### Acceptance Criteria

1. WHEN the Mini App loads, THE Cast Colony SHALL call sdk.actions.ready() to hide splash screen
2. WHEN users share game states, THE Cast Colony SHALL display rich embed previews
3. WHEN the app is accessed, THE Cast Colony SHALL authenticate users via Farcaster SDK
4. WHILE playing, THE Cast Colony SHALL maintain responsive design for mobile clients
5. WHERE users share victories, THE Cast Colony SHALL generate shareable cast content

### Requirement 6: Base Chain Integration

**User Story:** As a player, I want my game assets to be truly owned on-chain so that my progress is permanent and tradeable.

#### Acceptance Criteria

1. WHEN tiles are claimed, THE Cast Colony SHALL mint NFTs on Base chain
2. WHEN GEMS are earned, THE Cast Colony SHALL mint ERC-20 tokens on Base chain
3. WHEN battles occur, THE Cast Colony SHALL execute smart contract logic on Base chain
4. WHILE interacting with blockchain, THE Cast Colony SHALL handle gas fees transparently
5. WHERE transactions fail, THE Cast Colony SHALL provide clear error messages and retry options

### Requirement 7: Game State Management

**User Story:** As a player, I want the game to track rounds and phases so that battles happen in an organized, fair manner.

#### Acceptance Criteria

1. WHEN a round starts, THE Cast Colony SHALL display current phase and remaining time
2. WHEN Commit Phase is active, THE Cast Colony SHALL accept secret battle commitments
3. WHEN Reveal Phase starts, THE Cast Colony SHALL require move revelations
4. WHILE phases change, THE Cast Colony SHALL notify affected players
5. WHERE rounds end, THE Cast Colony SHALL automatically process all pending battles