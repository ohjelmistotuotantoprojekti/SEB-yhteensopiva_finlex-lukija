import app from './app.js'
import { setPool } from './db/db.js'
import dotenv from 'dotenv'
dotenv.config()

if (!process.env.PG_URI) {
  console.error('PG_URI environment variable is not set');
  process.exit(1);
}
setPool(process.env.PG_URI)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
