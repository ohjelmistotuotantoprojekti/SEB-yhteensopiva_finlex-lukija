import app from './app.js'
import { setPool } from './db/db.js'
import './util/config.js'

setPool(process.env.PG_URI ?? '')

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
