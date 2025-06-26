import { query } from '../db.js';
import { KeyWord } from '../../types/statute.js';

export async function setKeyword(key: KeyWord) {
  const sql = 'INSERT INTO keywords (id, keyword, statute_uuid, language) VALUES ($1, $2, $3, $4)';
  await query(sql, [key.id, key.keyword, key.statute_uuid, key.language]);
}

export async function getKeywords(language: string) {
  const sql = 'SELECT DISTINCT keyword, id FROM keywords WHERE language = $1 ORDER BY keyword';
  const result = await query(sql, [language]);
  return result.rows;
}

export async function getStatutesByKeywordID(language: string, keyword_id: string) {
  const sql = 'SELECT statutes.number, statutes.year, statutes.title, keywords.keyword FROM statutes JOIN keywords ON statutes.uuid=keywords.statute_uuid WHERE keywords.language=$1 AND keywords.id=$2';
  const result = await query(sql, [language, keyword_id]);
  return result.rows;
}

export async function getKeywordsByStatuteUuid(statuteUuid: string) {
  const sql = 'SELECT keyword FROM keywords WHERE statute_uuid = $1';
  const result = await query(sql, [statuteUuid]);
  return result.rows.map(row => row.keyword);
}
