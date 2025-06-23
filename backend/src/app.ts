import express from 'express';
import { parseStringPromise } from 'xml2js';
import { parseHtmlHeadings, parseXmlHeadings } from './util/parse.js';
const app = express()
app.use(express.json());
import path from 'path';
import { getLawByNumberYear, getLawsByYear, getJudgmentsByYear, getJudgmentByNumberYear, getLawByUuid, getJudgmentByUuid, getKeywords, getLawsByKeywordID } from './db/akoma.js';
import { getImageByName } from './db/image.js';
import { searchLaws, searchJudgments } from './search.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const VALID_LANGUAGES = ['fin', 'swe'];
export const VALID_LEVELS = ['any', 'kho', 'kko'];

let databaseStatus = 'notready';

app.get('/api/check-db-status', (req: express.Request, res: express.Response): void => {
  if (databaseStatus === 'ready') {
    res.status(200).json({ status: 'ready' });
  } else {
    res.status(503).json({
      error: 'Service Unavailable: Database is not ready',
      status: databaseStatus
    });
  }
});

app.post('/api/update-db-status', (req: express.Request, res: express.Response): void => {
  const password = req.body.password as string;
  const status = req.body.status as string;

  if (!password || password !== process.env.DATABASE_PASSWORD) {
    res.status(403).json({ error: 'Forbidden: Invalid password' });
    return;
  }

  const allowedStatuses = ['ready', 'notready'];
  if (!status || !allowedStatuses.includes(status)) {
    res.status(400).json({ error: 'Bad Request: Invalid status' });
    return;
  }

  databaseStatus = status;
  res.json({ message: `Database status updated to "${status}"` });
});

app.get('/favicon.ico', (request: express.Request, response: express.Response): void => {
  response.status(204).end();
})

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
      docTitle: result.title,
      isEmpty: result.is_empty
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

  if (content === null) return;
  const parsed_xml = await parseStringPromise(content, { explicitArray: false })
  try {
    const structure = parseXmlHeadings(parsed_xml)
    response.json(structure)
  } catch (error) {
    console.error("Error parsing XML content", error);
    response.status(500).json({ error: 'Internal server error' });
    return;
  }
})

// Hae tietyn oikeuskäytännön struktuurin eli otsikot ja otsikkojen alaotsikot
app.get('/api/judgment/structure/id/:year/:number/:language/:level', async (request: express.Request, response: express.Response): Promise<void> => {

  const year = parseInt(request.params.year)
  const language = request.params.language
  const number = request.params.number
  const level = request.params.level
  let content;
  try {
    content = await getJudgmentByNumberYear(number, year, language, level)
  } catch {
    response.status(500).json({ error: 'Internal server error' });
    return;
  }
  if (content === null) {
    response.status(404).json({ error: 'Not found' });
    return;
  }

  if (content === null) return;
  try {
    const structure = parseHtmlHeadings(content)
    response.json(structure)
  } catch (error) {
    console.error("Error parsing XML content", error);
    response.status(500).json({ error: 'Internal server error' });
    return;
  }
})

// Hae valitun kielen kaikki avainsanat
app.get('/api/statute/keywords/:language', async (request: express.Request, response: express.Response): Promise<void> => {
  const language = request.params.language
  let words;
  try {
    words = await getKeywords(language)
  } catch (error) {
    console.error("Error finding keywords", error)
    return;
  }
  if (words === null) {
    response.status(404).json({ error: 'Not found' });
    return;
  } else {
    response.json(words)
  }
})

// Hae tiettyyn avainsanaan liittyvien lakien numero, vuosi ja otsikko
app.get('/api/statute/keyword/:language/:keyword_id', async (request: express.Request, response: express.Response): Promise<void> => {
  const keyword_id = request.params.keyword_id
  const language = request.params.language
  let laws;
  try {
    laws = await getLawsByKeywordID(language, keyword_id)
  } catch (error) {
    console.error("Error finding laws", error)
    return;
  }
  if (laws === null) {
    response.status(404).json({ error: 'Not found' });
    return;
  } else {
    response.json(laws)
  }
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
  const preparedResults = [];
  const results_uuid = await searchLaws(language, keyword);
  for (const result of results_uuid) {
    const law = await getLawByUuid(result);
    if (law === null) continue;
    preparedResults.push({
      docYear: law.year,
      docNumber: law.number,
      docTitle: law.title,
      isEmpty: law.is_empty
    });
  }
  return preparedResults;
}

// Listaa kaikki oikeuskäytäntöpäätökset tietyltä vuodelta
async function getJudgmentsByYearAndLanguageAndLevel(year: number, language: string, level: string) {
  const results = await getJudgmentsByYear(year, language, level);
  const preparedResults = results.map((result) => {
    return {
      docYear: result.year,
      docNumber: result.number,
      docLevel: result.level,
      isEmpty: result.is_empty
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
  const preparedResults = [];
  const results_uuid = await searchJudgments(language, keyword, level);
  for (const result of results_uuid) {
    const judgment = await getJudgmentByUuid(result);
    if (judgment === null) continue;
    preparedResults.push({
      docYear: judgment.year,
      docNumber: judgment.number,
      docLevel: judgment.level,
      isEmpty: judgment.is_empty
    });
  }
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

  // Haku id:llä
  if (query.match(/^(KKO|KHO):(19|20)\d\d:\d+$/i)) {
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
  } catch (error) {
    response.status(500).json({ error: 'Internal server error' });
    console.error("Error during search:", error);
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
  } catch (error){
    response.status(500).json({ error: 'Internal server error' });
    console.error("Error during search:", error);
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
