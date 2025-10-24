import { NextRequest, NextResponse } from 'next/server';
import { sql } from '../../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { player_address, tile_ids, transaction_hash } = body;
    
    if (!player_address || !player_address.startsWith('0x')) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    if (!Array.isArray(tile_ids) || tile_ids.length === 0) {
      return NextResponse.json({ error: 'Invalid tile IDs' }, { status: 400 });
    }

    const walletAddress = player_address.toLowerCase();

    // Calculate harvestable GEMS for each tile
    const tiles = await sql`
      SELECT id, x, y, last_harvest,
             EXTRACT(EPOCH FROM (NOW() - last_harvest)) / 3600 as hours_since_harvest
      FROM tiles 
      WHERE id = ANY(${tile_ids}) 
      AND owner_address = ${walletAddress}
    `;

    if (tiles.length === 0) {
      return NextResponse.json({ error: 'No valid tiles found' }, { status: 400 });
    }

    let totalGemsHarvested = 0;
    const harvestRecords = [];

    // Process each tile
    for (const tile of tiles) {
      const hoursElapsed = Math.floor(tile.hours_since_harvest);
      const gemsToHarvest = hoursElapsed * 10; // 10 GEMS per hour

      if (gemsToHarvest > 0) {
        totalGemsHarvested += gemsToHarvest;

        // Update tile's last harvest time
        await sql`
          UPDATE tiles 
          SET last_harvest = NOW(), gems_accumulated = 0
          WHERE id = ${tile.id}
        `;

        // Record harvest history
        const harvestRecord = await sql`
          INSERT INTO harvest_history (player_address, tile_x, tile_y, gems_harvested)
          VALUES (${walletAddress}, ${tile.x}, ${tile.y}, ${gemsToHarvest})
          RETURNING *
        `;

        harvestRecords.push(harvestRecord[0]);
      }
    }

    // Update player's gems balance (this will be synced with blockchain)
    await sql`
      UPDATE players 
      SET gems_balance = gems_balance + ${totalGemsHarvested},
          updated_at = NOW()
      WHERE wallet_address = ${walletAddress}
    `;

    const result = {
      total_gems_harvested: totalGemsHarvested,
      tiles_harvested: tiles.length,
      harvest_records: harvestRecords
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error harvesting tiles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}