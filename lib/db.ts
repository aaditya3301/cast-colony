import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const sql = neon(process.env.DATABASE_URL);

// Database types
export interface Player {
  wallet_address: string;
  has_received_airdrop: boolean;
  gems_balance: number;
  total_tiles_owned: number;
  created_at: string;
  updated_at: string;
}

export interface Tile {
  id: number;
  x: number;
  y: number;
  owner_address: string;
  last_harvest: string;
  gems_accumulated: number;
  claimed_at: string;
}

export interface HarvestHistory {
  id: number;
  player_address: string;
  tile_x: number;
  tile_y: number;
  gems_harvested: number;
  harvested_at: string;
}