import express from 'express';
const app = express()
import path from 'path';
import { getLawByNumberYear, getLawsByYear, getLawsByContent } from './db/akoma.js';
import { getImageByName } from './db/image.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.static(path.join(__dirname, 'frontend')))


app.get('/media/:filename', async (request: express.Request, response: express.Response): Promise<void> => {
  const filename = request.params.filename;
  try{
    const {content, mimeType} = await getImageByName(filename);
    response.setHeader('Content-Type', mimeType);
    response.send(content);
  } catch {
    response.status(404).send('File not found');
    return;
  }
})

// Listaa kaikki lait tietyltä vuodelta
app.get('/api/statute/year/:year/:language', async (request: express.Request, response: express.Response): Promise<void> => {
  const year = parseInt(request.params.year)
  const language = request.params.language
  const results = await getLawsByYear(year, language)
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
app.get('/api/statute/id/:year/:number/:language', async (request: express.Request, response: express.Response): Promise<void> => {
  const year = parseInt(request.params.year)
  const language = request.params.language
  const number = request.params.number
  const content = await getLawByNumberYear(number, year, language)

  response.setHeader('Content-Type', 'application/xml')
  response.send(content)

})

// Hae lakien sisällöstä
app.get('/api/statute/keyword/:keyword/:language', async (request: express.Request, response: express.Response): Promise<void> => {
  const keyword = request.params.keyword
  const language = request.params.language
  const results = await getLawsByContent(keyword, language)
  const preparedResults = results.map((result) => {
    return {
      docYear: result.year,
      docNumber: result.number,
      docTitle: result.title
    }
  })

  response.json(preparedResults)
})

// Kaikki muut ohjataan frontendille
app.get("*params", async (request: express.Request, response: express.Response): Promise<void> => {
  response.sendFile(path.join(__dirname, 'frontend', 'index.html'))
})

export default app
