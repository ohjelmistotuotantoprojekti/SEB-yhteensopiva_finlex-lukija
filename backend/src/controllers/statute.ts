import express from 'express';
import { parseStringPromise } from 'xml2js';
import { parseXmlHeadings } from '../util/parse.js';
import * as config from '../util/config.js';
import { getStatuteByNumberYear, getStatutesByYear, searchStatutesByKeywordAndLanguage } from '../db/models/statute.js';
const statuteRouter = express.Router();

// Hae tietyn lain struktuurin eli otsikot ja otsikkojen alaotsikot
statuteRouter.get('/structure/id/:year/:number/:language', async (request: express.Request, response: express.Response): Promise<void> => {

  const year = parseInt(request.params.year)
  const language = request.params.language
  const number = request.params.number
  let content;
  try {
    content = await getStatuteByNumberYear(number, year, language)
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

// Hae tietty laki vuodella ja numerolla
statuteRouter.get('/id/:year/:number/:language', async (request: express.Request, response: express.Response): Promise<void> => {
  const year = parseInt(request.params.year)
  const language = request.params.language
  const number = request.params.number
  const content = await getStatuteByNumberYear(number, year, language)
  if (content === null) {
    response.status(404).json({ error: 'Not found' });
    return;
  }
  response.setHeader('Content-Type', 'application/xml')
  response.send(content)
})

statuteRouter.get('/search', async (request: express.Request, response: express.Response): Promise<void> => {
  const query = request.query.q as string
  const language = request.query.language as string

  // Tarkista kieli
  if (!config.VALID_LANGUAGES.includes(language)) {
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
      results = await getStatuteByNumberYear(docNumber, parseInt(docYear), language)
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
      results = await getStatutesByYear(year, language);
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
    results = await searchStatutesByKeywordAndLanguage(query, language);
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

export default statuteRouter
