import { setPool, fillDb, createTables, dropTables } from './src/db/db.js'
import { exit } from 'process';
import dotenv from 'dotenv'
dotenv.config()

if (!process.env.PG_URI) {
  console.error('PG_URI environment variable is not set');
  exit(1);
}

// nollaa tietokanta
try {
  await setPool(process.env.PG_URI)
  await dropTables();
  await createTables();
  await fillDb();
  console.log(`Database is ready.`);
} catch {
  exit(1);
}
