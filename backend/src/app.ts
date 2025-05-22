import express from 'express';
const app = express()
import path from 'path';
import { getLawByNumberYear, getLawsByYear } from './db/akoma.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.static(path.join(__dirname, 'frontend')))

// Listaa kaikki lait tietyltä vuodelta
app.get('/api/statute/year/:year', async (request: express.Request, response: express.Response): Promise<void> => {
  const year = parseInt(request.params.year)
  const results = await getLawsByYear(year, 'fin')
  const preparedResults = results.map((result) => {
    return {
      docYear: result.year,
      docNumber: result.number,
      docTitle: result.title
    }
  })

  response.json(preparedResults)
})

// Hae tietty laki vuodella ja numerolla
app.get('/api/statute/id/:year/:number', async (request: express.Request, response: express.Response): Promise<void> => {
  const year = parseInt(request.params.year)
  const number = parseInt(request.params.number)
  const content = await getLawByNumberYear(number, year, 'fin')

  response.setHeader('Content-Type', 'application/xml')
  response.send(content)

})

// Hae lakien otsikoista
//app.get('/api/statute/keyword/:keyword', async (request: express.Request, response: express.Response) Promise<void> => {
// //TBD
//})

// Kaikki muut ohjataan frontendille
app.get("*params", async (request: express.Request, response: express.Response): Promise<void> => {
  response.sendFile(path.join(__dirname, 'frontend', 'index.html'))
})

export default app
