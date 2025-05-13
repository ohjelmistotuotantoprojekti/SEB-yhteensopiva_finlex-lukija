const express = require('express')
const app = express()
const axios = require('axios')

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

  result.then(res => {
    response.send(res.data)
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