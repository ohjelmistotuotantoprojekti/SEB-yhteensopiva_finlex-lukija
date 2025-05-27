
import { Pool, QueryResult } from 'pg';
import { setStatutesByYear } from './load.js';

let pool: Pool;

async function setPool(uri: string) {
  pool = new Pool({
    connectionString: uri
  });
}

async function fillDb(): Promise<void> {
  try {
    const currentYear = new Date().getFullYear();
    for (let i = 1900; i <= currentYear; i++) {
      await setStatutesByYear(i, 'fin')
      await setStatutesByYear(i, 'swe')
    }
    for (const i of [1898, 1896, 1895, 1894, 1893, 1892, 1889, 1886, 1883, 1873, 1872, 1868, 1864, 1734]) {
      await setStatutesByYear(i, 'fin')
      await setStatutesByYear(i, 'swe')
    }
    console.log("Database is filled")
  } catch (error) {
    console.error('Error filling database:', error);
    throw error;
  }
}

async function dbIsReady(): Promise<boolean> {
  try {
    const client = await pool.connect();
    let result = await client.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'images');")
    const imagesExists = result.rows[0].exists;

    result = await client.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'laws');")
    const lawsExists = result.rows[0].exists;
    client.release();
    if  (!imagesExists || !lawsExists) {
      return false
    }
    result = await client.query("SELECT COUNT(*) FROM images;");
    const imagesCount = parseInt(result.rows[0].count, 10);
    result = await client.query("SELECT COUNT(*) FROM laws;");
    const lawsCount = parseInt(result.rows[0].count, 10);
    return imagesCount > 0 && lawsCount > 0;
  } catch (error) {
    console.error('Error checking database readiness:', error);
    throw error;
  }
}

async function createTables(): Promise<void> {
  try {
    const client = await pool.connect();
    await client.query("CREATE TABLE IF NOT EXISTS images ("
      + "uuid UUID PRIMARY KEY,"
      + "name TEXT NOT NULL UNIQUE,"
      + "mime_type TEXT NOT NULL,"
      + "content BYTEA NOT NULL"
      + ")");
    await client.query("CREATE TABLE IF NOT EXISTS laws ("
      + "uuid UUID PRIMARY KEY,"
      + "title TEXT NOT NULL,"
      + "number INTEGER NOT NULL,"
      + "year INTEGER NOT NULL,"
      + "language TEXT NOT NULL CHECK (language IN ('fin', 'swe')),"
      + "content XML NOT NULL,"
      + "CONSTRAINT unique_document UNIQUE (number, year, language)"
      + ")");
    client.release();
  }
  catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

async function dropTables(): Promise<void> {
  try {
    const client = await pool.connect();
    await client.query("DROP TABLE IF EXISTS images");
    await client.query("DROP TABLE IF EXISTS laws");
    client.release();
  } catch (error) {
    console.error('Error dropping tables:', error);
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


export { query, setPool, closePool, createTables, dropTables, dbIsReady, fillDb };
