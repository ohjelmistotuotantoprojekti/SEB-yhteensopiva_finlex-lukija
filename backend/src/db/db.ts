
import { Pool, QueryResult } from 'pg';
import { setStatutesByYear, setJudgmentsByYear, listStatutesByYear, listJudgmentsByYear } from './load.js';
import { getLatestYearLaw, getLawCountByYear, getLatestYearJudgment, getJudgmentCountByYear } from './akoma.js';

let pool: Pool;

async function setPool(uri: string) {
  pool = new Pool({
    connectionString: uri
  });
}

async function fillDb(startYearLaw: number = 1900, startYearJudgment: number = 1900): Promise<void> {
  try {
    const currentYear = new Date().getFullYear();
    for (let i = startYearLaw; i <= currentYear; i++) {
      await setStatutesByYear(i, 'fin')
      await setStatutesByYear(i, 'swe')
    }

    for (let i = startYearJudgment; i <= currentYear; i++) {
      await setJudgmentsByYear(i, 'fin', 'kho')
      await setJudgmentsByYear(i, 'fin', 'kko')
      await setJudgmentsByYear(i, 'swe', 'kho')
      await setJudgmentsByYear(i, 'swe', 'kko')
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
    return imagesExists && lawsExists && judgmentsExists


  } catch (error) {
    console.error('Error checking database readiness:', error);
    throw error;
  }
}

async function dbIsUpToDate(): Promise<{upToDate: boolean, latestYearLaw: number, latestYearJudgment: number}> {
  try {
    const currentYear = new Date().getFullYear();
    let latestYearLaw = await getLatestYearLaw();
    let latestYearJudgment = await getLatestYearJudgment(); // Assuming this function also works for judgments
    let upToDate = true;

    if (latestYearLaw == currentYear) {
      const numberOfLaws = await getLawCountByYear(currentYear);
      const expectedFin = await listStatutesByYear(currentYear, 'fin');
      const expectedSwe = await listStatutesByYear(currentYear, 'swe');
      const exprectedNumberOfLaws = expectedFin.length + expectedSwe.length;
      if (numberOfLaws != exprectedNumberOfLaws) {
        console.log(`Number of laws for year ${currentYear} does not match expected: ${numberOfLaws} vs ${exprectedNumberOfLaws}`);
        upToDate = false;
      } else {
        ++latestYearLaw
      }
    } else {
      upToDate = false;
    }

    if (latestYearJudgment == currentYear) {
      const numberOfJudgments = await getJudgmentCountByYear(currentYear);
      const expectedFinKKO = await listJudgmentsByYear(currentYear, 'fin', 'kko');
      const expectedSweKKO = await listJudgmentsByYear(currentYear, 'swe', 'kko');
      const expectedFinKHO = await listJudgmentsByYear(currentYear, 'fin', 'kho');
      const expectedSweKHO = await listJudgmentsByYear(currentYear, 'swe', 'kho');
      const exprectedNumberOfJudgments = expectedFinKKO.length + expectedSweKKO.length + expectedFinKHO.length + expectedSweKHO.length;
      if (numberOfJudgments != exprectedNumberOfJudgments) {
        console.log(`Number of judgments for year ${currentYear} does not match expected: ${numberOfJudgments} vs ${exprectedNumberOfJudgments}`);
        upToDate = false;
      } else {
        ++latestYearJudgment
      }
    } else {
      upToDate = false;
    }
    console.log(`Database up to date: ${upToDate}, Latest law year: ${latestYearLaw}, Latest judgment year: ${latestYearJudgment}`);
    return { upToDate, latestYearLaw, latestYearJudgment };
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
