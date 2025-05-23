
import { Pool, QueryResult } from 'pg';

let pool: Pool;

async function setPool(uri: string) {
  pool = new Pool({
    connectionString: uri
  });
}

async function resetDb(): Promise<void> {
  try {
    const client = await pool.connect();
    await client.query("DROP TABLE IF EXISTS laws");
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
    client.release();
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
}

async function query(text: string, params?: unknown[]): Promise<QueryResult> {
  try {
    const client = await pool.connect();
    const result = await client.query(text, params);
    client.release();
    return result;
  } catch (error) {
    console.error(`Error executing query '${text}': '${error}'`);
    throw error;
  }
}

async function closePool() {
  try {
    await pool.end();
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
}


export { query, setPool, closePool, resetDb };
