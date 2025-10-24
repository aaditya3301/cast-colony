import { NextRequest, NextResponse } from 'next/server';
import { sql } from '../../../../../lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    
    if (!address || !address.startsWith('0x')) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    // Get player data
    const players = await sql`
      SELECT * FROM players 
      WHERE wallet_address = ${address.toLowerCase()}
    `;

    if (players.length === 0) {
      // New player - return default data
      return NextResponse.json({
        wallet_address: address.toLowerCase(),
        has_received_airdrop: false,
        gems_balance: 0,
        total_tiles_owned: 0,
        is_new_player: true
      });
    }

    const player = players[0];
    return NextResponse.json({
      ...player,
      is_new_player: false
    });

  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const body = await request.json();
    
    if (!address || !address.startsWith('0x')) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    const walletAddress = address.toLowerCase();

    // Upsert player data
    const result = await sql`
      INSERT INTO players (
        wallet_address, 
        colony_name,
        has_received_airdrop, 
        gems_balance, 
        total_tiles_owned,
        updated_at
      ) VALUES (
        ${walletAddress},
        ${body.colony_name || null},
        ${body.has_received_airdrop || false},
        ${body.gems_balance || 0},
        ${body.total_tiles_owned || 0},
        NOW()
      )
      ON CONFLICT (wallet_address) 
      DO UPDATE SET
        colony_name = COALESCE(EXCLUDED.colony_name, players.colony_name),
        has_received_airdrop = EXCLUDED.has_received_airdrop,
        gems_balance = EXCLUDED.gems_balance,
        total_tiles_owned = EXCLUDED.total_tiles_owned,
        updated_at = NOW()
      RETURNING *
    `;

    return NextResponse.json(result[0]);

  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}