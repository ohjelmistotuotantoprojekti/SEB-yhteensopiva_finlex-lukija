import express from 'express';
const app = express()
import axios from 'axios';
import path from 'path';
import { parseStringPromise } from 'xml2js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseURL = 'https://opendata.finlex.fi/finlex/avoindata/v1';
app.use(express.static(path.join(__dirname, 'frontend')))

// Listaa kaikki lait tietyltä vuodelta
app.get('/api/statute-consolidated/year/:year', async (request: express.Request, response: express.Response): Promise<void> => {
  const year = request.params.year
  const path = '/akn/fi/act/statute-consolidated'
  const queryParams = {
    format: 'json',
    page: 1,
    limit: 5,
    sortBy: 'dateIssued',
    startYear: year,
    endYear: year,
    LangAndVersion: 'fin@',
    typeStatute: 'act',
  }

  const result = await axios.get(`${baseURL}${path}`, {
    params: queryParams,
    headers: { Accept: 'application/xml' }
  })

  try {
    // Parsi XML data JSON-muotoon
    const xmlData: string = result.data as string;
    const jsonData = await parseStringPromise(xmlData, { explicitArray: false })

    // Poimi results-lista akomantoso-elementistä
    const resultsNode = jsonData?.AknXmlList?.Results?.akomaNtoso
    if (!resultsNode) {
      response.status(400).json({ error: "Unexpected data structure" })
      return
    }

    // Varmista, että tosiaan saatiin listamuotoinen data
    const resultsArray = Array.isArray(resultsNode) ? resultsNode : [resultsNode]

    // Poimi docTitle ja docNumber preface-elementistä
    const extractedDocs = resultsArray.map((result2) => {
      const p = result2?.act?.preface?.p
      const docNumber = p?.docNumber || null
      if (!docNumber) {
        throw new Error('docNumber not found')
      }
      const docNumberId = docNumber.split('/')[0]
      const docYear = docNumber.split('/')[1]
      const docTitle = p?.docTitle || null
      if (!docTitle) {
        throw new Error('docTitle not found')
      }

      return { docYear: docYear, docNumber: docNumberId, docTitle: docTitle }
    })

    // Palauta JSON-muotoinen vastaus
    response.json(extractedDocs)

  } catch (error) {
    console.error('Error during XML parsing:', error)
    response.status(500).json({ error: 'Failed to parse XML' })
  }
})

// Hae tietty laki vuodella ja numerolla
app.get('/api/statute-consolidated/id/:year/:number', async (request, response) => {
  const year = request.params.year
  const number = request.params.number
  const path = `/akn/fi/act/statute-consolidated/${year}/${number}`
  const queryParams = {
    page: 1,
    limit: 4
  }

  const result = await axios.get(`${baseURL}${path}`, {
    params: queryParams,
    headers: { Accept: 'application/xml' }
  })
  response.setHeader('Content-Type', 'application/xml')
  response.send(result.data)

})

// Kaikki muut ohjataan frontendille
app.get("*params", (request, response) => {
  response.sendFile(path.join(__dirname, 'frontend', 'index.html'))
})

export default app
