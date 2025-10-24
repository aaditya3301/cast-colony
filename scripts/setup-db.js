const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env file');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🔄 Setting up Cast Colony database...');

    // Create players table
    await sql`
      CREATE TABLE IF NOT EXISTS players (
        wallet_address VARCHAR(42) PRIMARY KEY,
        has_received_airdrop BOOLEAN DEFAULT FALSE,
        gems_balance INTEGER DEFAULT 0,
        total_tiles_owned INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Players table created');

    // Create tiles table
    await sql`
      CREATE TABLE IF NOT EXISTS tiles (
        id SERIAL PRIMARY KEY,
        x INTEGER NOT NULL,
        y INTEGER NOT NULL,
        owner_address VARCHAR(42) NOT NULL,
        last_harvest TIMESTAMP DEFAULT NOW(),
        gems_accumulated INTEGER DEFAULT 0,
        claimed_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(x, y)
      )
    `;
    console.log('✅ Tiles table created');

    // Create harvest history table
    await sql`
      CREATE TABLE IF NOT EXISTS harvest_history (
        id SERIAL PRIMARY KEY,
        player_address VARCHAR(42) NOT NULL,
        tile_x INTEGER NOT NULL,
        tile_y INTEGER NOT NULL,
        gems_harvested INTEGER NOT NULL,
        harvested_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Harvest history table created');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_tiles_owner ON tiles(owner_address)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tiles_coords ON tiles(x, y)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_harvest_player ON harvest_history(player_address)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_harvest_date ON harvest_history(harvested_at)`;
    console.log('✅ Indexes created');

    // Clear any existing demo data
    await sql`DELETE FROM harvest_history`;
    await sql`DELETE FROM tiles`;
    await sql`DELETE FROM players`;
    console.log('✅ Cleared existing data');

    console.log('🎉 Database setup complete!');
    console.log('📊 Tables created:');
    console.log('   - players (wallet addresses, airdrop status, gems balance)');
    console.log('   - tiles (x, y coordinates, ownership, harvest data)');
    console.log('   - harvest_history (harvest records)');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();