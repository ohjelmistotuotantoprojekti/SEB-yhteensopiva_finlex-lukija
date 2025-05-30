import express from 'express';
import xml2js from 'xml2js';
import { parseStringPromise } from 'xml2js';
import { Structure, HeadingList } from './types/structure.js';
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

// Hae tietyn lain struktuurin eli otsikot ja otsikkojen alaotsikot
app.get('/api/statute/structure/id/:year/:number/:language', async (request: express.Request, response: express.Response): Promise<void> => {
  const year = parseInt(request.params.year)
  const language = request.params.language
  const number = request.params.number
  const content = await getLawByNumberYear(number, year, language)
  let headings : HeadingList[] = []

  if (content === null) return;
  const parsed_xml = await parseStringPromise(content)

  function search(parsed_xml : Structure) {
    var obj = parsed_xml.akomaNtoso.act[0].body[0].hcontainer[0]

    if (obj === null) return;

    for (const key in obj) {
      if (key === 'chapter') {
          for (let chap of Array.from(obj.chapter)) {
            let sub_headings = []
            for (let sec of chap.section) {
              let sub_heading_name = sec.num[0]
              sub_headings.push(sub_heading_name + " - " + sec.heading[0]._)
            }
            let heading_name = chap.heading[0]._ as string
            let chapter_num = chap.num[0] as string
            headings.push({[chapter_num + " - " + heading_name]:sub_headings})
          }
      }
    }
  }
  //response.setHeader('Content-Type', 'application/json')
  search(parsed_xml)
  console.log(headings)
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

// Kaikki muut ohjataan frontendille
app.get("*params", async (request: express.Request, response: express.Response): Promise<void> => {
  response.sendFile(path.join(__dirname, 'frontend', 'index.html'))
})

export default app
