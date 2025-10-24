import { NextRequest, NextResponse } from 'next/server';
import { sql } from '../../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { x, y, owner_address, transaction_hash } = body;
    
    if (!owner_address || !owner_address.startsWith('0x')) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    if (typeof x !== 'number' || typeof y !== 'number') {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    const walletAddress = owner_address.toLowerCase();

    // Check if tile already exists
    const existingTile = await sql`
      SELECT * FROM tiles WHERE x = ${x} AND y = ${y}
    `;

    if (existingTile.length > 0) {
      return NextResponse.json({ error: 'Tile already claimed' }, { status: 400 });
    }

    // Insert new tile
    const newTile = await sql`
      INSERT INTO tiles (x, y, owner_address, last_harvest, gems_accumulated)
      VALUES (${x}, ${y}, ${walletAddress}, NOW(), 0)
      RETURNING *
    `;

    // Update player's tile count
    await sql`
      UPDATE players 
      SET total_tiles_owned = total_tiles_owned + 1,
          updated_at = NOW()
      WHERE wallet_address = ${walletAddress}
    `;

    const result = newTile[0];

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error claiming tile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}