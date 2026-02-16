/**
 * Database Schema Verification Script
 * Checks if all required tables exist in the database
 */

import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const verifySchema = async () => {
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
    console.log('✅ Connected to database');

    // Check for required tables
    const requiredTables = [
      'recruiters',
      'candidates',
      'interview_sessions',
      'violations',
      'scores',
      'audit_logs'
    ];

    console.log('\n📋 Checking tables...\n');

    for (const table of requiredTables) {
      const result = await client.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [table]
      );

      const exists = result.rows[0].exists;
      console.log(`${exists ? '✅' : '❌'} ${table}: ${exists ? 'EXISTS' : 'MISSING'}`);

      if (exists) {
        // Check column count
        const colResult = await client.query(
          `SELECT COUNT(*) as count FROM information_schema.columns 
           WHERE table_name = $1`,
          [table]
        );
        console.log(`   └─ ${colResult.rows[0].count} columns`);
      }
    }

    // Check UUID extension
    const uuidResult = await client.query(
      `SELECT EXISTS (
        SELECT FROM pg_extension WHERE extname = 'uuid-ossp'
      )`
    );
    console.log(`\n${uuidResult.rows[0].exists ? '✅' : '❌'} UUID extension: ${uuidResult.rows[0].exists ? 'INSTALLED' : 'MISSING'}`);

    console.log('\n✅ Schema verification complete');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    throw error;
  } finally {
    await client.end();
  }
};

verifySchema().catch(console.error);
