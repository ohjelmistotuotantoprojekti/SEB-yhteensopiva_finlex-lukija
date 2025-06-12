import { setPool, dbIsReady, fillDb, createTables, dbIsUpToDate } from "./db/db.js";
import dotenv from "dotenv";
import { exit } from 'process';
import axios from 'axios';

dotenv.config();

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
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendStatusUpdate(success: boolean) {
  // Lähetä status päivitys palvelimelle
  const status = success ? 'ready' : 'notready';
  while (true) {
    try {
      const response = await axios.post('http://localhost:3001/api/update-db-status', { status: status, password: process.env.DATABASE_PASSWORD })
      console.log(response.data.message);
      break; // Poistu silmukasta, jos lähetys onnistuu
    } catch (error) {
      console.error('Error sending status update:', error)
    }
    await sleep(timeShort); // Odota ennen uudelleenyritystä
  }
}

const timeLong = 24 * 60 * 60 * 1000;
const timeShort = 60 * 1000;
let time = timeLong;

while (true) {
  try {
    await initDatabase();
    time = timeLong; // Alusta pidempi odotusaika, jos tietokanta on valmis
    await sendStatusUpdate(true);
  } catch {
    time = timeShort;
    await sendStatusUpdate(false);
  }
  await sleep(time);
}
