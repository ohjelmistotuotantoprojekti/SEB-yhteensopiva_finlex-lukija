
import { Pool, QueryResult } from 'pg';
import { listStatutesByYear, listJudgmentsByYear, parseFinlexUrl, parseJudgmentUrl, setSingleStatute, buildFinlexUrl, buildJudgmentUrl, setSingleJudgment, getCommonNames } from './load.js';
import { getLawCountByYear, getJudgmentCountByYear, getLawsByYear, getJudgmentsByYear, setCommonName } from './akoma.js';
import { CommonName, LawKey } from '../types/akoma.js';
import { JudgmentKey } from '../types/judgment.js';
import { v4 as uuidv4 } from 'uuid';
import { syncJudgments, syncLanguage } from '../search.js';

let pool: Pool;

async function setPool(uri: string) {
  pool = new Pool({
    connectionString: uri
  });
}

async function fillDb(laws: LawKey[], judgments: JudgmentKey[]): Promise<void> {
  try {

    let commonNames = await getCommonNames('fin');
    for (const commonName of commonNames) {
      const uuid = uuidv4();
      const commonNameObj = { uuid, commonName: commonName.commonName, number: commonName.number, year: commonName.year, language: commonName.language } as CommonName;
      setCommonName(commonNameObj);
    }
    commonNames = await getCommonNames('swe');
    for (const commonName of commonNames) {
      const uuid = uuidv4();
      const commonNameObj = { uuid, commonName: commonName.commonName, number: commonName.number, year: commonName.year, language: commonName.language } as CommonName;
      setCommonName(commonNameObj);
    }

    for (const key of laws) {
      await setSingleStatute(buildFinlexUrl(key));
    }
    for (const key of judgments) {
      await setSingleJudgment(buildJudgmentUrl(key));
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

    result = await client.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'common_names');")
    const commonNamesExists = result.rows[0].exists;

    client.release();
    return imagesExists && lawsExists && judgmentsExists && commonNamesExists;


  } catch (error) {
    console.error('Error checking database readiness:', error);
    throw error;
  }
}

async function dbIsUpToDate(): Promise<{upToDate: boolean, laws: LawKey[], judgments: JudgmentKey[]}> {
  console.log('Checking if database is up to date...');

  async function compareStatuteCount(year: number): Promise<boolean> {
    const expectedFin = await listStatutesByYear(year, 'fin');
    const expectedSwe = await listStatutesByYear(year, 'swe');
    const expectedCount = expectedFin.length + expectedSwe.length;
    if (expectedCount === 0) {
      return true;
    }
    const existingCount = await getLawCountByYear(year);
    if (existingCount > expectedCount) {
      console.warn(`Found too many laws for year ${year}: ${existingCount}, expected ${expectedCount}.`);
    } else if (existingCount < expectedCount) {
      console.log(`Found too few laws for year ${year}: ${existingCount}, expected ${expectedCount}.`);
    } else {
      console.debug(`Correct number of laws for year ${year}: ${existingCount}`);
    }
    return existingCount === expectedCount;
  }

  async function compareJudgmentCount(year: number): Promise<boolean> {
    const expectedFinKKO = await listJudgmentsByYear(year, 'fin', 'kko');
    const expectedSweKKO = await listJudgmentsByYear(year, 'swe', 'kko');
    const expectedFinKHO = await listJudgmentsByYear(year, 'fin', 'kho');
    const expectedSweKHO = await listJudgmentsByYear(year, 'swe', 'kho');
    const expectedCount = expectedFinKKO.length + expectedSweKKO.length + expectedFinKHO.length + expectedSweKHO.length;
    if (expectedCount === 0) {
      return true;
    }
    const existingCount = await getJudgmentCountByYear(year);
    if (existingCount > expectedCount) {
      console.warn(`Found too many judgments for year ${year}: ${existingCount}, expected ${expectedCount}.`);
    } else if (existingCount < expectedCount) {
      console.log(`Found too few judgments for year ${year}: ${existingCount}, expected ${expectedCount}.`);
    } else {
      console.debug(`Correct number of judgments for year ${year}: ${existingCount}`);
    }
    return existingCount === expectedCount;
  }

  async function findMissingStatutes(year: number): Promise<LawKey[]> {
    const expectedFin = await listStatutesByYear(year, 'fin');
    const expectedSwe = await listStatutesByYear(year, 'swe');
    const expectedLaws = []
    for (const lawUrl of [...expectedFin, ...expectedSwe]) {
      const law = parseFinlexUrl(lawUrl);
      expectedLaws.push({ number: law.docNumber, year: law.docYear, language: law.docLanguage, version: law.docVersion });
    }
    const existingLawsFin = await getLawsByYear(year, 'fin');
    const existingLawsSwe = await getLawsByYear(year, 'swe');
    const existingLaws: LawKey[] = [];

    for (const law of existingLawsFin) {
      existingLaws.push({ number: law.number, year: law.year, language: 'fin', version: law.version });
    }
    for (const law of existingLawsSwe) {
      existingLaws.push({ number: law.number, year: law.year, language: 'swe', version: law.version });
    }

    const missingLaws: LawKey[] = [];
    for (const law of expectedLaws) {
      if (!existingLaws.some(existing =>
        existing.number === law.number &&
        existing.year === law.year &&
        existing.language === law.language &&
        existing.version === law.version
      )) {
        missingLaws.push(law);
      }
    }
    return missingLaws;
  }


  async function findMissingJudgments(year: number): Promise<JudgmentKey[]> {
    const expectedFinKKO = await listJudgmentsByYear(year, 'fin', 'kko');
    const expectedSweKKO = await listJudgmentsByYear(year, 'swe', 'kko');
    const expectedFinKHO = await listJudgmentsByYear(year, 'fin', 'kho');
    const expectedSweKHO = await listJudgmentsByYear(year, 'swe', 'kho');
    const expectedJudgments: JudgmentKey[] = [];

    for (const judgmentUrl of [...expectedFinKKO, ...expectedSweKKO, ...expectedFinKHO, ...expectedSweKHO]) {
      const judgment = parseJudgmentUrl(judgmentUrl);
      expectedJudgments.push({ number: judgment.number, year: judgment.year, language: judgment.language, level: judgment.level });
    }

    const existingJudgmentsFin = await getJudgmentsByYear(year, 'fin', 'any');
    const existingJudgmentsSwe = await getJudgmentsByYear(year, 'swe', 'any');
    const existingJudgments: JudgmentKey[] = [];
    for (const judgment of existingJudgmentsFin) {
      existingJudgments.push({ number: judgment.number, year: judgment.year, language: 'fin', level: judgment.level });
    }
    for (const judgment of existingJudgmentsSwe) {
      existingJudgments.push({ number: judgment.number, year: judgment.year, language: 'swe', level: judgment.level });
    }

    const missingJudgments: JudgmentKey[] = [];

    for (const judgment of expectedJudgments) {
      if (!existingJudgments.some(existing =>
        existing.number === judgment.number &&
        existing.year === judgment.year &&
        existing.language === judgment.language &&
        existing.level === judgment.level
      )) {
        missingJudgments.push(judgment);
      }
    }
    return missingJudgments;
  }



  try {
    const laws: LawKey[] = [];
    const judgments: JudgmentKey[] = [];
    let upToDate = true;
    const currentYear = new Date().getFullYear();
    const startYear = 1700;

    for (let year = startYear; year <= currentYear + 1; year++) {
      if (!await compareStatuteCount(year)) {
        console.log(`Laws for year ${year} are not up to date`);
        laws.push(...await findMissingStatutes(year));
        upToDate = false;
      }

      if (!await compareJudgmentCount(year)) {
        console.log(`Judgments for year ${year} are not up to date`);
        judgments.push(...await findMissingJudgments(year));
        upToDate = false;
      }
    }
    return { upToDate, laws, judgments };

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
      + "version TEXT,"
      + "content XML NOT NULL,"
      + "is_empty BOOLEAN NOT NULL,"
      + "CONSTRAINT unique_act UNIQUE (number, year, language)"
      + ")");
    await client.query("CREATE TABLE IF NOT EXISTS common_names ("
      + "uuid UUID PRIMARY KEY,"
      + "common_name TEXT NOT NULL,"
      + "number TEXT NOT NULL,"
      + "year INTEGER NOT NULL,"
      + "language TEXT NOT NULL CHECK (language IN ('fin', 'swe')),"
      + "CONSTRAINT unique_name UNIQUE (number, year, language, common_name)"
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
    await client.query("DROP TABLE IF EXISTS common_names");
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

async function setupTestDatabase(): Promise<void> {
  await createTables();
  await setSingleStatute("https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute-consolidated/2023/9/fin@")
  await setSingleStatute("https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute-consolidated/2023/9/swe@")
  await setSingleStatute("https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute-consolidated/2023/4/fin@")
  await setSingleStatute("https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute-consolidated/2023/4/swe@")
  await setSingleStatute("https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute-consolidated/2023/5/fin@")
  await setSingleStatute("https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute-consolidated/2023/5/swe@")
  await setSingleJudgment("https://www.finlex.fi/fi/oikeuskaytanto/korkein-hallinto-oikeus/ennakkopaatokset/2005/13")
  await setSingleJudgment("https://www.finlex.fi/sv/rattspraxis/hogsta-forvaltningsdomstolen/prejudikat/2005/13")
  await setSingleJudgment("https://www.finlex.fi/fi/oikeuskaytanto/korkein-oikeus/ennakkopaatokset/2023/5")
  await setSingleJudgment("https://www.finlex.fi/sv/rattspraxis/hogsta-domstolen/prejudikat/2023/5")
  await setSingleJudgment("https://www.finlex.fi/fi/oikeuskaytanto/korkein-oikeus/ennakkopaatokset/1990/10")
  await setSingleJudgment("https://www.finlex.fi/sv/rattspraxis/hogsta-domstolen/prejudikat/1990/10")
  await setSingleJudgment("https://www.finlex.fi/fi/oikeuskaytanto/korkein-oikeus/ennakkopaatokset/1975/II-16")
  await setSingleJudgment("https://www.finlex.fi/sv/rattspraxis/hogsta-domstolen/prejudikat/1975/II-16")
  await syncLanguage('fin');
  await syncLanguage('swe');
  await syncJudgments('fin');
  await syncJudgments('swe');
  console.log('Test database setup complete');
}


export { query, setPool, closePool, createTables, dropTables, dbIsReady, fillDb, dbIsUpToDate, setupTestDatabase };
