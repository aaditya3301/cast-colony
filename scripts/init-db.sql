-- Cast Colony Database Schema

-- Players table
CREATE TABLE IF NOT EXISTS players (
  wallet_address VARCHAR(42) PRIMARY KEY,
  has_received_airdrop BOOLEAN DEFAULT FALSE,
  gems_balance INTEGER DEFAULT 0,
  total_tiles_owned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tiles table
CREATE TABLE IF NOT EXISTS tiles (
  id SERIAL PRIMARY KEY,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  owner_address VARCHAR(42) NOT NULL,
  last_harvest TIMESTAMP DEFAULT NOW(),
  gems_accumulated INTEGER DEFAULT 0,
  claimed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(x, y),
  FOREIGN KEY (owner_address) REFERENCES players(wallet_address)
);

-- Harvest history table (optional)
CREATE TABLE IF NOT EXISTS harvest_history (
  id SERIAL PRIMARY KEY,
  player_address VARCHAR(42) NOT NULL,
  tile_x INTEGER NOT NULL,
  tile_y INTEGER NOT NULL,
  gems_harvested INTEGER NOT NULL,
  harvested_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (player_address) REFERENCES players(wallet_address)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tiles_owner ON tiles(owner_address);
CREATE INDEX IF NOT EXISTS idx_tiles_coords ON tiles(x, y);
CREATE INDEX IF NOT EXISTS idx_harvest_player ON harvest_history(player_address);
CREATE INDEX IF NOT EXISTS idx_harvest_date ON harvest_history(harvested_at);

-- Clear existing demo data
DELETE FROM harvest_history;
DELETE FROM tiles;
DELETE FROM players;