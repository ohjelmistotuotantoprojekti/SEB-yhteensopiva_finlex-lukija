import app from './app.js'
import { setPool } from './db/db.js'
import { exit } from 'process';
import dotenv from 'dotenv'
dotenv.config()


if (!process.env.PG_URI) {
  console.error('PG_URI environment variable is not set');
  exit(1);
}

setPool(process.env.PG_URI)
if (process.env.NODE_ENV === 'production') {
  console.log('Running in production mode')
} else if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode')
} else if (process.env.NODE_ENV === 'test') {
  console.log('Running in test mode')
} else {
  console.log('Running in unknown mode')
  exit(1)
}

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
