/**
 * Run Time Window Migration
 * Adds valid_from and valid_until columns to interview_sessions table
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'intervuex',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'sql1234'
});

async function runMigration() {
  try {
    console.log('🔄 Running time window migration...');

    // Read migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '002_add_time_window.sql'),
      'utf8'
    );

    // Execute migration
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('   - Added valid_from column to interview_sessions');
    console.log('   - Added valid_until column to interview_sessions');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
