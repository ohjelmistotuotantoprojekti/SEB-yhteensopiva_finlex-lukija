import { setStatutesByYear } from './src/db/load.js';
import { resetDb } from './src/db/db.js'
import { exit } from 'process';

// nollaa tietokanta
try {
  await resetDb();
  console.log(`Database is ready.`);
} catch {
  exit(1);
}

// täytä tietokanta
try {
  await setStatutesByYear(2023, 'fin')
  await setStatutesByYear(2023, 'swe')
  await setStatutesByYear(2024, 'fin')
  await setStatutesByYear(2024, 'swe')
  console.log("Database is filled")
} catch (error) {
  console.error('Error filling database:', error);
  exit(1);
}
