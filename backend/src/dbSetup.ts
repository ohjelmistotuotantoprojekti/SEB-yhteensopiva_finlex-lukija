import { setPool, dbIsReady, fillDb, createTables, dbIsUpToDate, setupTestDatabase } from "./db/db.js";
import { exit } from 'process';
import axios from 'axios';
import dotenv from "dotenv";
dotenv.config();

const timeLong = 24 * 60 * 60 * 1000;
const timeShort = 60 * 1000;

async function initDatabase() {
  try {
    if (!await dbIsReady()) {
      console.log('Database is not ready, creating tables...')
      await createTables()
    }
    console.log('Database is ready.')
    const { upToDate, laws, judgments } = await dbIsUpToDate()
    if (!upToDate) {
      console.log('Database is not up to date, filling database...')
      await fillDb(laws, judgments)
      console.log('Database is now up to date.')
    } else {
      console.log('Database is up to date.')
    }

  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
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

if (!process.env.PG_URI) {
  console.error("PG_URI environment variable is not set. Exiting.");
  process.exit(1);
}

if (!process.env.DATABASE_PASSWORD) {
  console.error("DATABASE_PASSWORD environment variable is not set. Exiting.");
  exit(1);
}

// Luo db clientti
setPool(process.env.PG_URI)

// Valitse täytetäänkö oikealla vai testidatalla
const dbSetupFunc = process.env.NODE_ENV === 'test' ? setupTestDatabase : initDatabase;


let time = timeLong;
while (true) {
  try {
    await dbSetupFunc();
    time = timeLong;
    await sendStatusUpdate(true);
  } catch {
    time = timeShort;
    await sendStatusUpdate(false);
  }
  await sleep(time);
}
