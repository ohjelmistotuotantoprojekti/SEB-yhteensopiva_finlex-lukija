import { query } from './db.js';
import { Akoma } from '../types/akoma.js';
import { Judgment } from '../types/judgment.js';

async function getLawByNumberYear(number: string, year: number, language: string): Promise<string | null> {
  const sql = 'SELECT content FROM laws WHERE number = $1 AND year = $2 AND language = $3';
  const result = await query(sql, [number, year, language]);
  return result.rows[0]?.content || null;
}

async function getLawsByYear(year: number, language: string): Promise<{ title: string; number: string; year: number }[]> {
  const sql = 'SELECT title, number, year FROM laws WHERE year = $1 AND language = $2';
  const result = await query(sql, [year, language]);
  return result.rows;
}

async function getLawsByContent(keyword: string, language: string): Promise<{ title: string; number: string; year: number }[]> {
  const escapedKeyword = keyword.replaceAll('\'', '');
  const sql = "SELECT title, number, year FROM laws WHERE language = $1 AND (title ILIKE $2 OR cardinality(xpath($3, content, ARRAY[ARRAY['akn', 'http://docs.oasis-open.org/legaldocml/ns/akn/3.0']])) > 0)";
  const xpath_query = `//akn:p/text()[contains(., '${escapedKeyword}')]`;
  const result = await query(sql, [language, `%${escapedKeyword}%`, xpath_query]);
  return result.rows;
}

async function getJudgmentByNumberYear(number: string, year: number, language: string, level: string): Promise<string | null> {
  if (level === 'any') level = '%';
  const sql = 'SELECT content FROM judgments WHERE number = $1 AND year = $2 AND language = $3 AND level ILIKE $4';
  const result = await query(sql, [number, year, language, level]);
  return result.rows[0]?.content || null;
}

async function getJudgmentsByYear(year: number, language: string, level: string): Promise<{ title: string; number: string; year: number, level: string }[]> {
  if (level === 'any') level = '%';
  const sql = 'SELECT level, number, year FROM judgments WHERE year = $1 AND language = $2 AND level ILIKE $3';
  const result = await query(sql, [year, language, level]);
  return result.rows;
}

async function getJudgmentsByContent(keyword: string, language: string, level: string): Promise<{ title: string; number: string; year: number, level: string }[]> {
  if (level === 'any') level = '%';
  const sql = 'SELECT number, level, year FROM judgments WHERE language = $1 AND level LIKE $2 AND content ILIKE $3'
  const result = await query(sql, [language, level, `%${keyword}%`]);
  return result.rows;
}

async function setLaw(law: Akoma) {
  const sql = 'INSERT INTO laws (uuid, title, number, year, language, content, is_empty) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (number, year, language) DO NOTHING';
  await query(sql, [law.uuid, law.title, law.number, law.year, law.language, law.content, law.is_empty]);
}

async function setJudgment(judgment: Judgment) {
  const sql = 'INSERT INTO judgments (uuid, level, number, year, language, content, is_empty) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (level, number, year, language) DO NOTHING';
  await query(sql, [judgment.uuid, judgment.level, judgment.number, judgment.year, judgment.language, judgment.content, judgment.is_empty]);
}

async function getLawCountByYear(year: number): Promise<number> {
  const sql = 'SELECT COUNT(*) FROM laws where year = $1';
  const result = await query(sql, [year]);
  return parseInt(result.rows[0].count, 10);
}

async function getLatestYearLaw() : Promise<number> {
  const sql = 'SELECT MAX(year) AS latest_year FROM laws';
  const result = await query(sql);
  return parseInt(result.rows[0].latest_year, 10);
}

async function getJudgmentCountByYear(year: number): Promise<number> {
  const sql = 'SELECT COUNT(*) FROM judgments where year = $1';
  const result = await query(sql, [year]);
  return parseInt(result.rows[0].count, 10);
}

async function getLatestYearJudgment() : Promise<number> {
  const sql = 'SELECT MAX(year) AS latest_year FROM judgments';
  const result = await query(sql);
  return parseInt(result.rows[0].latest_year, 10);
}

export { setJudgment, getLawByNumberYear, getLawsByYear, getLawsByContent, setLaw, getLawCountByYear, getLatestYearLaw, getJudgmentByNumberYear, getJudgmentsByYear, getJudgmentsByContent, getJudgmentCountByYear, getLatestYearJudgment };
