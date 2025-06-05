
import { Pool, QueryResult } from 'pg';
import { setStatutesByYear, setJudgmentsByYear } from './load.js';
import { getLatestYearLaw, getLawCountByYear, getLawsByYear } from './akoma.js';

let pool: Pool;

async function setPool(uri: string) {
  pool = new Pool({
    connectionString: uri
  });
}

async function fillDb(startYear: number = 1900): Promise<void> {
  try {
    const currentYear = new Date().getFullYear();
    for (let i = startYear; i <= currentYear; i++) {
      await setStatutesByYear(i, 'fin')
      await setStatutesByYear(i, 'swe')
      await setJudgmentsByYear(i, 'fin', 'kho')
      await setJudgmentsByYear(i, 'fin', 'kko')
      await setJudgmentsByYear(i, 'swe', 'kho')
      await setJudgmentsByYear(i, 'swe', 'kko')
    }
    for (const i of [1898, 1896, 1895, 1894, 1893, 1892, 1889, 1886, 1883, 1873, 1872, 1868, 1864, 1734]) {
      if (i < startYear) {
        continue;
      }
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

    result = await client.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'judgments');")
    const judgmentsExists = result.rows[0].exists;
    client.release();
    if  (!imagesExists || !lawsExists || !judgmentsExists) {
      return false
    }
    result = await client.query("SELECT COUNT(*) FROM images;");
    const imagesCount = parseInt(result.rows[0].count, 10);
    result = await client.query("SELECT COUNT(*) FROM laws;");
    const lawsCount = parseInt(result.rows[0].count, 10);
    result = await client.query("SELECT COUNT(*) FROM judgements;");
    const judgmentsCount = parseInt(result.rows[0].count, 10);
    
    return imagesCount > 0 && lawsCount > 0 && judgmentsCount > 0;
  } catch (error) {
    console.error('Error checking database readiness:', error);
    throw error;
  }
}

async function dbIsUpToDate(): Promise<{upToDate: boolean, latestYear: number}> {
  try {
    const latestYear = await getLatestYearLaw();
    const currentYear = new Date().getFullYear();
    if (latestYear == currentYear) {
      const numberOfLaws = await getLawCountByYear(currentYear);
      const expectedFin = await getLawsByYear(currentYear, 'fin');
      const expectedSwe = await getLawsByYear(currentYear, 'swe');
      const exprectedNumberOfLaws = expectedFin.length + expectedSwe.length;
      if (numberOfLaws != exprectedNumberOfLaws) {
        return { upToDate: false, latestYear };
      } else {
        return { upToDate: true, latestYear };
      }
    } else { return { upToDate: false, latestYear };}
  } catch (error) {
    console.error('Error checking if database is up to date:', error);
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
      + "number TEXT NOT NULL,"
      + "year INTEGER NOT NULL,"
      + "language TEXT NOT NULL CHECK (language IN ('fin', 'swe')),"
      + "content XML NOT NULL,"
      + "is_empty BOOLEAN NOT NULL,"
      + "CONSTRAINT unique_act UNIQUE (number, year, language)"
      + ")");
    await client.query("CREATE TABLE IF NOT EXISTS judgments ("
      + "uuid UUID PRIMARY KEY,"
      + "level TEXT NOT NULL,"
      + "number TEXT NOT NULL,"
      + "year INTEGER NOT NULL,"
      + "language TEXT NOT NULL CHECK (language IN ('fin', 'swe')),"
      + "content TEXT NOT NULL,"
      + "is_empty BOOLEAN NOT NULL,"
      + "CONSTRAINT unique_judgment UNIQUE (level, number, year, language)"
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
    await client.query("DROP TABLE IF EXISTS judgments");
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


export { query, setPool, closePool, createTables, dropTables, dbIsReady, fillDb, dbIsUpToDate };
