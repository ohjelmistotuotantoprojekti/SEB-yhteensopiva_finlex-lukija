// i want to use this file to test what is the output of the liststatutesbyear function in the load module for some years
import { listStatutesByYear, setSingleStatute } from './src/db/load.js';
// i want to connect to the database and test the listStatutesByYear function for the year 2023 and language 'fin'
import { createTables, dropTables, setPool } from './src/db/db.js';
import dotenv from 'dotenv';
dotenv.config();
if (!process.env.PG_URI) {
  console.error('PG_URI environment variable is not set');
  process.exit(1);
}
// Set the database connection pool
setPool(process.env.PG_URI);
await dropTables()
await createTables()


const list = await listStatutesByYear(2023, 'fin');

console.log(list);

// setsinglestatute for the first 5 laws of list
for (let i = 0; i < 10; i++) {
await setSingleStatute(list[i]);
console.log(`Set single statute for ${list[i].number} ${list[i].year} ${list[i].language} ${list[i].version}`);
}