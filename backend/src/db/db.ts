
import { Client, Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
if (!process.env.PGPORT) {
  throw new Error('Environment variable PGPORT must be defined.');
}
if (!process.env.PGHOST) {
  throw new Error('Environment variable PGHOST must be defined.');
}
if (!process.env.PGUSER) {
  throw new Error('Environment variable PGUSER must be defined.');
}
if (!process.env.PGPASSWORD) {
  throw new Error('Environment variable PGPASSWORD must be defined.');
}
if (!process.env.PGDATABASE) {
  throw new Error('Environment variable PGDATABASE must be defined.');
}
const { PGHOST, PGUSER, PGPASSWORD, PGPORT, PGDATABASE } = process.env;


async function createDb(): Promise<void> {

  const client = new Client({
    host: PGHOST,
    user: PGUSER,
    password: PGPASSWORD,
    port: parseInt(PGPORT),
    database: 'postgres'
  });

  try {
    await client.connect();

    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [PGDATABASE]
    );

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${PGDATABASE}"`);
      await client.query(`CREATE TABLE laws (uuid UUID PRIMARY KEY, title TEXT, number INT, year INT, language TEXT, content XML)`);
    }
  } finally {
    await client.end();
  }
}

async function createTables(): Promise<void> {
  const client = new Client({
    host: PGHOST,
    user: PGUSER,
    password: PGPASSWORD,
    port: parseInt(PGPORT),
    database: PGDATABASE
  });

  try {
    await client.connect();
    await client.query(`CREATE TABLE IF NOT EXISTS laws (uuid UUID PRIMARY KEY, title TEXT, number INT, year INT, language TEXT, content XML)`);
  } finally {
    await client.end();
  }
}

const pool = new Pool({
  host: PGHOST,
  user: PGUSER,
  password: PGPASSWORD,
  port: parseInt(PGPORT),
  database: PGDATABASE
});


async function query(text: string, params?: unknown[]): Promise<QueryResult> {
  try {
    return await pool.query(text, params);
  } catch (error) {
    console.error(`Error executing query '${text}': '${error}'`);
    throw error;
  }
}

function closePool() {
  return pool.end();
}

export { query, createDb, createTables, closePool };
