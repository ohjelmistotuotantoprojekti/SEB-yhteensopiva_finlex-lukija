import express from 'express';
import '../util/config.js';
import { getKeywords } from '../db/models/keyword.js';
const keywordRouter = express.Router();

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
