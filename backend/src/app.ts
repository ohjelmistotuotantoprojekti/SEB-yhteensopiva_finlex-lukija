import express from 'express';
import { parseStringPromise } from 'xml2js';
import { Structure, Heading } from './types/structure.js';
const app = express()
import path from 'path';
import { getLawByNumberYear, getLawsByYear, getLawsByContent, getJudgmentsByYear, getJudgmentByNumberYear, getJudgmentsByContent } from './db/akoma.js';
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

// Hae tietyn lain struktuurin eli otsikot ja otsikkojen alaotsikot
app.get('/api/statute/structure/id/:year/:number/:language', async (request: express.Request, response: express.Response): Promise<void> => {
  const year = parseInt(request.params.year)
  const language = request.params.language
  const number = request.params.number
  const content = await getLawByNumberYear(number, year, language)
  const headings: Heading[] = []

  if (content === null) return;
  const parsed_xml = await parseStringPromise(content, { explicitArray: false })

  function search(parsed_xml : Structure) {
    const obj = parsed_xml.akomaNtoso.act.body.hcontainer[0]

    if (obj === null) return;

    for (const key in obj) {
      if (key === 'chapter') {
        let i = 0
        for (const chap of obj.chapter) {
          ++i
          const sub_headings : Heading[] = []
          let j = 0
          for (const sec of chap.section) {
            ++j
            const sub_heading_num = sec.num.trim()
            let sub_heading_name = sec.heading._
            if (sub_heading_name === undefined) {
              sub_heading_name = `_${j}`
            }
            else {
              sub_heading_name = sub_heading_name.trim()
            }

            const sec_key = sub_heading_num + " - " + sub_heading_name
            sub_headings.push({name: sec_key, id: sec.heading['$'].eId, content:[]})
          }
          let heading_name = chap.heading._
          if (heading_name === undefined) {
            heading_name = `_${i}`
          }
          else {
            heading_name = heading_name.trim()
          }
          const chapter_num = chap.num.trim()
          const chap_key = chapter_num + " - " + heading_name
          headings.push({name: chap_key, id: chap.heading['$'].eId, content: sub_headings})
        }
      }
    }
  }
  //response.setHeader('Content-Type', 'application/json')
  search(parsed_xml)

  response.json(headings)

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

// Listaa kaikki oikeuskäytäntöpäätökset tietyltä vuodelta
app.get('/api/judgment/year/:year/:language/:level', async (request: express.Request, response: express.Response): Promise<void> => {
  const year = parseInt(request.params.year)
  const language = request.params.language
  const level = request.params.level
  const results = await getJudgmentsByYear(year, language, level)
  console.log(results)
  const preparedResults = results.map((result) => {
    return {
      docYear: result.year,
      docNumber: result.number,
      docLevel: result.level
    }
  })
  response.json(preparedResults)
})

// Hae oikeuskäytäntöpäätös vuodella, numerolla ja tasolla
app.get('/api/judgment/id/:year/:number/:language/:level', async (request: express.Request, response: express.Response): Promise<void> => {
  const year = parseInt(request.params.year)
  const language = request.params.language
  const number = request.params.number
  const level = request.params.level
  const content = await getJudgmentByNumberYear(number, year, language, level)
  response.setHeader('Content-Type', 'application/xml')
  response.send(content)
})

// Hae oikeuskäytäntöpäätösten sisällöstä
app.get('/api/judgment/keyword/:keyword/:language', async (request: express.Request, response: express.Response): Promise<void> => {
  const keyword = request.params.keyword
  const language = request.params.language
  const results = await getJudgmentsByContent(keyword, language)
  const preparedResults = results.map((result) => {
    return {
      docYear: result.year,
      docNumber: result.number,
      docLevel: result.level,
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
