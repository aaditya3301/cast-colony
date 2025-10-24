import { NextRequest, NextResponse } from 'next/server';
import { sql } from '../../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all tiles for map display
    const tiles = await sql`
      SELECT x, y, owner_address, last_harvest, gems_accumulated, claimed_at
      FROM tiles 
      ORDER BY claimed_at ASC
    `;

    return NextResponse.json(tiles);

  } catch (error) {
    console.error('Error fetching all tiles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}