import app from './app.js'
import { createDb, createTables, closePool } from './db/db.js'
import { setStatutesByYear } from './db/load.js';

async function gracefulShutdown() {
  try {
    await closePool();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown', error);
    process.exit(1);
  }
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

try {
  await createDb();
  await createTables();
  console.log(`Database is ready.`);
} catch (error) {
  console.error('Error creating database:', error);
}

// Täytä tietokanta ???
// setStatutesByYear(2023, 'fin')

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
