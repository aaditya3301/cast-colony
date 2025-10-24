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

    // Get player's tiles
    const tiles = await sql`
      SELECT * FROM tiles 
      WHERE owner_address = ${address.toLowerCase()}
      ORDER BY claimed_at ASC
    `;

    return NextResponse.json(tiles);

  } catch (error) {
    console.error('Error fetching tiles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}