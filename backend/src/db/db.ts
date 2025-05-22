
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

function getClient(database: string): Client {
  return new Client({
    host: PGHOST,
    user: PGUSER,
    password: PGPASSWORD,
    port: parseInt(PGPORT),
    database: database
  });
}


async function resetDb(): Promise<void> {
  let client = getClient('postgres');
  try {
    await client.connect();
    await client.query(`DROP DATABASE IF EXISTS "${PGDATABASE}"`);
    await client.query(`CREATE DATABASE "${PGDATABASE}"`);
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  } finally {
    await client.end();
  }

  client = getClient(PGDATABASE);
  try {
    await client.connect();
    await client.query(
      "CREATE TABLE laws ("
      + "uuid UUID PRIMARY KEY,"
      + "title TEXT NOT NULL,"
      + "number INTEGER NOT NULL,"
      + "year INTEGER NOT NULL,"
      + "language TEXT NOT NULL CHECK (language IN ('fin', 'swe')),"
      + "content XML NOT NULL,"
      + "CONSTRAINT unique_document UNIQUE (number, year, language)"
      + ")");
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
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

export { query, resetDb, closePool };
