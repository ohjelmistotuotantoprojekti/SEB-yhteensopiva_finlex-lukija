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
const VALID_LANGUAGES = ['fin', 'swe'];
const VALID_LEVELS = ['any', 'kho', 'kko'];


app.use(express.static(path.join(__dirname, 'frontend')))


app.get('/media/:filename', async (request: express.Request, response: express.Response): Promise<void> => {
  const filename = request.params.filename;
  try{
    let result;
    try {
      result = await getImageByName(filename);
    } catch {
      response.status(500).json({ error: 'Internal server error' });
      return;
    }
    if (result === null) {
      response.status(404).json({ error: 'Not found' });
      return;
    }
    const {content, mimeType} = result;
    response.setHeader('Content-Type', mimeType);
    response.send(content);
  } catch {
    response.status(404).json({ error: 'Not found' });
    return;
  }
})

// Listaa kaikki lait tietyltä vuodelta
async function getStatutesByYearAndLanguage(year: number, language: string) {
  const results = await getLawsByYear(year, language);
  const preparedResults = results.map((result) => {
    return {
      docYear: result.year,
      docNumber: result.number,
      docTitle: result.title
    };
  });
  return preparedResults;
}

// Hae tietyn lain struktuurin eli otsikot ja otsikkojen alaotsikot
app.get('/api/statute/structure/id/:year/:number/:language', async (request: express.Request, response: express.Response): Promise<void> => {
  const year = parseInt(request.params.year)
  const language = request.params.language
  const number = request.params.number
  let content;
  try {
    content = await getLawByNumberYear(number, year, language)
  } catch {
    response.status(500).json({ error: 'Internal server error' });
    return;
  }
  if (content === null) {
    response.status(404).json({ error: 'Not found' });
    return;
  }
  const headings: Heading[] = []

  if (content === null) return;
  const parsed_xml = await parseStringPromise(content, { explicitArray: false })

  function search(parsed_xml : Structure) {

    const obj = parsed_xml.akomaNtoso.act.body.hcontainer[0] as any // eslint-disable-line

    if (obj === undefined || obj === null) return;

    let hasChapters: boolean = true
    if (!Object.keys(obj).includes("chapter")) {
      hasChapters = false
    }

    for (const key in obj) {
      if (key === 'chapter' || key === 'section') {
        let i = 0

        for (const chap of obj[key]) {
          ++i
          const sub_headings : Heading[] = []
          let j = 0

          if (hasChapters && chap.section !== null) {
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
  try {
    search(parsed_xml)
  } catch {
    response.status(500).json({ error: 'Internal server error' });
    return;
  }
  response.json(headings)
})

// Hae tietty laki vuodella ja numerolla
app.get('/api/statute/id/:year/:number/:language', async (request: express.Request, response: express.Response): Promise<void> => {
  const year = parseInt(request.params.year)
  const language = request.params.language
  const number = request.params.number
  const content = await getLawByNumberYear(number, year, language)
  if (content === null) {
    response.status(404).json({ error: 'Not found' });
    return;
  }
  response.setHeader('Content-Type', 'application/xml')
  response.send(content)
})

// Hae lakien sisällöstä
async function searchLawsByKeywordAndLanguage(keyword: string, language: string) {
  const results = await getLawsByContent(keyword, language);
  const preparedResults = results.map((result) => {
    return {
      docYear: result.year,
      docNumber: result.number,
      docTitle: result.title
    };
  });
  return preparedResults;
}

// Listaa kaikki oikeuskäytäntöpäätökset tietyltä vuodelta
async function getJudgmentsByYearAndLanguageAndLevel(year: number, language: string, level: string) {
  const results = await getJudgmentsByYear(year, language, level);
  const preparedResults = results.map((result) => {
    return {
      docYear: result.year,
      docNumber: result.number,
      docLevel: result.level
    };
  });
  return preparedResults;
}

// Hae tietty oikeuskäytäntöpäätös vuodella, numerolla ja tasolla
app.get('/api/judgment/id/:year/:number/:language/:level', async (request: express.Request, response: express.Response): Promise<void> => {
  const year = parseInt(request.params.year)
  const language = request.params.language
  const number = request.params.number
  const level = request.params.level
  const content = await getJudgmentByNumberYear(number, year, language, level)
  if (content === null) {
    response.status(404).json({ error: 'Not found' });
    return;
  }
  response.setHeader('Content-Type', 'text/html')
  response.send(content)
})

// Hae oikeuskäytäntöpäätösten sisällöstä
async function searchJudgmentsByKeywordAndLanguage(keyword: string, language: string, level: string) {
  const results = await getJudgmentsByContent(keyword, language, level);
  const preparedResults = results.map((result) => {
    return {
      docYear: result.year,
      docNumber: result.number,
      docLevel: result.level
    };
  });
  return preparedResults;
}

app.get('/api/judgment/search', async (request: express.Request, response: express.Response): Promise<void> => {
  const query = request.query.q as string
  const language = request.query.language as string
  let level = request.query.level as string

  // Tarkista kieli
  if (!VALID_LANGUAGES.includes(language)) {
    response.status(400).json({ error: 'Invalid language parameter' });
    return;
  }

  // Tarkista kysely
  if (!query) {
    response.status(400).json({ error: 'Query parameter "q" is required' });
    return;
  }

  // Tarkista oikeuskäytäntöpäätösten taso
  if (!level) level = 'any'
  if (!VALID_LEVELS.includes(level)) {
    response.status(400).send('Invalid level parameter');
    return;
  }
  console.log(`Searching for keyword: ${query} in language: ${language} and level: ${level}`);

  // Haku id:llä
  if (query.match(/^(KKO|KHO):(19|20)\d\d:\d+$/i)) {
    console.log(`Searching for judgment by id: ${query} in language: ${language} and level: ${level}`);
    const [docLevel, docYear, docNumber] = query.split(':');
    let result;
    try {
      result = await getJudgmentByNumberYear(docNumber, parseInt(docYear), language, docLevel.toLowerCase());
    } catch {
      response.status(500).json({ error: 'Internal server error' });
      return;
    }
    if (result) {
      response.json({type: 'redirect', content: {
        number: docNumber,
        year: parseInt(docYear),
        level: docLevel.toUpperCase(),
        language: language
      }})
      return;
    } else {
      response.status(404).json({ error: 'Not found' });
      return;
    }
  }

  // Haku vuodella
  if (query.match(/^\d{4}$/)) {
    console.log(`Searching for judgments by year: ${query} in language: ${language} and level: ${level}`);
    const year = parseInt(query);
    let results;
    try {
      results = await getJudgmentsByYearAndLanguageAndLevel(year, language, level);
    } catch {
      response.status(500).json({ error: 'Internal server error' });
      return;
    }
    if (results.length > 0) {
      response.json({type: 'resultList', content: results });
      return;
    } else {
      response.status(404).json({ error: 'Not found' });
      return;
    }
  }

  // Haku sisällöllä
  let results;
  try {
    results = await searchJudgmentsByKeywordAndLanguage(query, language, level);
  } catch {
    response.status(500).json({ error: 'Internal server error' });
    return;
  }
  if (results.length > 0) {
    response.json({type: 'resultList', content: results });
    return;
  } else {
    response.status(404).json({ error: 'Not found' });
    return;
  }
})

app.get('/api/statute/search', async (request: express.Request, response: express.Response): Promise<void> => {
  const query = request.query.q as string
  const language = request.query.language as string

  // Tarkista kieli
  if (!VALID_LANGUAGES.includes(language)) {
    response.status(400).json({ error: 'Invalid language parameter' });
    return;
  }

  // Tarkista kysely
  if (!query) {
    response.status(400).json({ error: 'Query parameter "q" is required' });
    return;
  }

  // Haku id:llä
  if (query.match(/^\d+(-\d+)?\/(19|20)\d\d$/)) {
    const [docNumber, docYear] = query.split('/');
    let results
    try {
      results = await getLawByNumberYear(docNumber, parseInt(docYear), language)
    }catch {response.status(500).json({ error: 'Internal server error' }); return; }

    if (results) {
      response.json({type: 'redirect', content: {
        number: docNumber,
        year: parseInt(docYear),
        language: language
      }})
      return;
    } else {
      response.status(404).json({ error: 'Not found' });
      return;
    }
  }

  // Haku vuodella
  if (query.match(/^\d{4}$/)) {
    const year = parseInt(query);
    let results;
    try {
      results = await getStatutesByYearAndLanguage(year, language);
    } catch {
      response.status(500).json({ error: 'Internal server error' });
      return;
    }
    if (results.length > 0) {
      response.json({type: 'resultList', content: results });
      return;
    } else {
      response.status(404).json({ error: 'Not found' });
      return;
    }
  }

  // Haku sisällöllä
  let results;
  try {
    results = await searchLawsByKeywordAndLanguage(query, language);
  } catch {
    response.status(500).json({ error: 'Internal server error' });
    return;
  }
  if (results.length > 0) {
    response.json({type: 'resultList', content: results });
    return;
  } else {
    response.status(404).json({ error: 'Not found' });
    return;
  }

})

// Kaikki muut ohjataan frontendille
app.get("*params", async (request: express.Request, response: express.Response): Promise<void> => {
  response.sendFile(path.join(__dirname, 'frontend', 'index.html'))
})

export default app
