/**
 * Database Migration Runner
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runMigrations = async () => {
  // Use DATABASE_URL if available (production), otherwise use individual vars (development)
  const client = process.env.DATABASE_URL
    ? new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      })
    : new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'intervuex',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
      });

  try {
    await client.connect();
    console.log('Connected to database for migrations');

    // Read migration file
    const migrationPath = path.join(__dirname, '001_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration: 001_initial_schema.sql');
    await client.query(sql);
    console.log('✅ Migration completed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await client.end();
  }
};

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations().catch(console.error);
}
