import { query } from './db.js';
import { Akoma } from '../types/akoma.js';

async function getLawByNumberYear(number: number, year: number, language: string): Promise<string | null> {
  const sql = 'SELECT content FROM laws WHERE number = $1 AND year = $2 AND language = $3';
  const result = await query(sql, [number, year, language]);
  return result.rows[0].content || null;
}

async function getLawsByYear(year: number, language: string): Promise<{ title: string; number: number; year: number }[]> {
  const sql = 'SELECT title, number, year FROM laws WHERE year = $1 AND language = $2';
  const result = await query(sql, [year, language]);
  return result.rows;
}

async function getLawsByContent(keyword: string, language: string): Promise<{ title: string; number: number; year: number }[]> {
  const sql = "SELECT title, number, year FROM laws WHERE language = $1 AND (title ILIKE $2 OR cardinality(xpath($3, content, ARRAY[ARRAY['akn', 'http://docs.oasis-open.org/legaldocml/ns/akn/3.0']])) > 0)";
  const xpath_query = `//akn:p/text()[contains(., '${keyword}')]`;
  const result = await query(sql, [language, `%${keyword}%`, xpath_query]);
  return result.rows;
}

async function setLaw(law: Akoma) {
  const sql = 'INSERT INTO laws (uuid, title, number, year, language, content) VALUES ($1, $2, $3, $4, $5, $6)';
  await query(sql, [law.uuid, law.title, law.number, law.year, law.language, law.content]);
}

export { getLawByNumberYear, getLawsByYear, getLawsByContent, setLaw };
