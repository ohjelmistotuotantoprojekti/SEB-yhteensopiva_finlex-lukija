import { setPool, dbIsReady, fillDb, createTables, dbIsUpToDate } from "./db/db.js";
import dotenv from "dotenv";
import { exit } from 'process';
dotenv.config();

console.log('testi 1');

if (!process.env.PG_URI) {
  console.error("PG_URI environment variable is not set.");
  process.exit(1);
}

// Luo db clientti ympäristön mukaan
if (process.env.NODE_ENV === 'production') {
  console.log('Running in production mode')
  setPool(process.env.PG_URI)
} else if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode')
  setPool(process.env.PG_URI)
} else if (process.env.NODE_ENV === 'test') {
  console.log('Running in test mode')
  // testit asettavat poolin osana testiajoa
} else {
  console.log('Running in unknown mode')
  exit(1)
}

console.log('testi 2');

// Alusta tietokanta
async function initDatabase() {
  try {
    if (!await dbIsReady()) {
      console.log('Database is not ready, creating tables...')
      await createTables()
      console.log('Filling database...')
      await fillDb()
      console.log('Database is ready.')
    } else {
      console.log('Database is ready.')
      const { upToDate, latestYearLaw, latestYearJudgment } = await dbIsUpToDate()
      if (!upToDate) {
        console.log('Database is not up to date, filling database...')
        await fillDb(latestYearLaw, latestYearJudgment)
        console.log('Database is now up to date.')
      } else {
        console.log('Database is up to date.')
      }
    }
    exit(0)
  } catch (error) {
    console.error('Error initializing database:', error)
    exit(1)
  }
}

await initDatabase()
