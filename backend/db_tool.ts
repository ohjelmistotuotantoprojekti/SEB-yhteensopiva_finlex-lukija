import { setPool, fillDb, createTables, dropTables } from './src/db/db.js'
import { exit } from 'process';
import dotenv from 'dotenv'
import { dbIsUpToDate } from './src/db/db.js'
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
  const { upToDate, laws, judgments } = await dbIsUpToDate()
  if (!upToDate) {
    console.log('Database is not up to date, filling database...')
    await fillDb(laws, judgments)
  }
  console.log(`Database is ready.`);
} catch {
  exit(1);
}
