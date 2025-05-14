import express from 'express';
const app = express()
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

const baseURL = 'https://opendata.finlex.fi/finlex/avoindata/v1';

// Etusivu
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

// Listaa kaikki lait tietyltä vuodelta
app.get('/api/statute-consolidated/year/:year', (request, response) => {
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

  const result = axios.get(`${baseURL}${path}`, {
    params: queryParams,
    headers: { Accept: 'application/xml' }
  })

  result.then(async res => {
    try {
      const xmlData = res.data;
      // Parsi XML data JSON-muotoon
      const jsonData = await parseStringPromise(xmlData, { explicitArray: false })

      // Poimi results-lista akomantoso-elementistä
      const resultsNode = jsonData?.AknXmlList?.Results?.akomaNtoso
      if (!resultsNode) {
        return response.status(400).json({ error: "Unexpected data structure" })
      }

      // Varmista, että tosiaan saatiin listamuotoinen data
      const resultsArray = Array.isArray(resultsNode) ? resultsNode : [resultsNode]

      // Poimi docTitle ja docNumber preface-elementistä
      const extractedDocs = resultsArray.map((result) => {
        const p = result?.act?.preface?.p
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
      });

      // Palauta JSON-muotoinen vastaus
      response.json(extractedDocs)

    } catch (error) {
      console.error('Error during XML parsing:', error)
      response.status(500).json({ error: 'Failed to parse XML' })
    }
  })
})

// Hae tietty laki vuodella ja numerolla
app.get('/api/statute-consolidated/id/:year/:number', (request, response) => {
  const year = request.params.year
  const number = request.params.number
  const path = `/akn/fi/act/statute-consolidated/${year}/${number}`
  const queryParams = {
    page: 1,
    limit: 4
  }

  const result = axios.get(`${baseURL}${path}`, {
    params: queryParams,
    headers: { Accept: 'application/xml' }
  })

  result.then(res => {
    console.log(res.data)
    response.send(res.data)
  })
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
