import express from 'express';
import '../util/config.js';
import { getKeywords, getLawsByKeywordID } from '../db/models/keyword.js';
const keywordRouter = express.Router();

// Hae tiettyyn avainsanaan liittyvien lakien numero, vuosi ja otsikko
keywordRouter.get('/:language/:keyword_id', async (request: express.Request, response: express.Response): Promise<void> => {
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

// Hae valitun kielen kaikki avainsanat
keywordRouter.get('/:language', async (request: express.Request, response: express.Response): Promise<void> => {
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

export default keywordRouter;
