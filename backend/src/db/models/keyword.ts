import { query } from '../db.js';
import { KeyWord } from '../../types/statute.js';

export async function setKeyword(key: KeyWord) {
  const sql = 'INSERT INTO keywords (id, keyword, law_uuid, language) VALUES ($1, $2, $3, $4)';
  await query(sql, [key.id, key.keyword, key.law_uuid, key.language]);
}

export async function getKeywords(language: string) {
  const sql = 'SELECT DISTINCT keyword, id FROM keywords WHERE language = $1 ORDER BY keyword';
  const result = await query(sql, [language]);
  return result.rows;
}

export async function getLawsByKeywordID(language: string, keyword_id: string) {
  const sql = 'SELECT laws.number, laws.year, laws.title, keywords.keyword FROM laws JOIN keywords ON laws.uuid=keywords.law_uuid WHERE keywords.language=$1 AND keywords.id=$2';
  const result = await query(sql, [language, keyword_id]);
  return result.rows;
}
