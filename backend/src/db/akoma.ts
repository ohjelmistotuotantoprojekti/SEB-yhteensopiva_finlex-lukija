import { query } from './db.js';
import { Akoma, CommonName, KeyWord } from '../types/akoma.js';
import { Judgment } from '../types/judgment.js';

async function getLawByNumberYear(number: string, year: number, language: string): Promise<string | null> {
  const sql = 'SELECT content FROM laws WHERE number = $1 AND year = $2 AND language = $3';
  const result = await query(sql, [number, year, language]);
  return result.rows[0]?.content || null;
}

async function getLawsByYear(year: number, language: string): Promise<{ title: string; number: string; year: number, is_empty: boolean, version: string | null }[]> {
  const sql = 'SELECT title, number, year, is_empty, version FROM laws WHERE year = $1 AND language = $2 ORDER BY is_empty ASC, number ASC';
  const result = await query(sql, [year, language]);
  return result.rows;
}

async function getJudgmentByNumberYear(number: string, year: number, language: string, level: string): Promise<string | null> {
  if (level === 'any') level = '%';
  const sql = 'SELECT content FROM judgments WHERE number = $1 AND year = $2 AND language = $3 AND level ILIKE $4';
  const result = await query(sql, [number, year, language, level]);
  return result.rows[0]?.content || null;
}

async function getJudgmentsByYear(year: number, language: string, level: string): Promise<{ title: string; number: string; year: number, level: string, is_empty: boolean }[]> {
  if (level === 'any') level = '%';
  const sql = 'SELECT level, number, year, is_empty FROM judgments WHERE year = $1 AND language = $2 AND level ILIKE $3 ORDER BY is_empty ASC, number ASC, level ASC';
  const result = await query(sql, [year, language, level]);
  return result.rows;
}

async function setLaw(law: Akoma) {
  const sql = 'INSERT INTO laws (uuid, title, number, year, language, version, content, is_empty) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (number, year, language) DO NOTHING';
  await query(sql, [law.uuid, law.title, law.number, law.year, law.language, law.version, law.content, law.is_empty]);
}

async function setKeyword(key: KeyWord) {
  const sql = 'INSERT INTO keywords (id, keyword, law_uuid, language) VALUES ($1, $2, $3, $4)';
  await query(sql, [key.id, key.keyword, key.law_uuid, key.language]);
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

async function getJudgmentCountByYear(year: number): Promise<number> {
  const sql = 'SELECT COUNT(*) FROM judgments WHERE year = $1';
  const result = await query(sql, [year]);
  return parseInt(result.rows[0].count, 10);
}

async function setCommonName(commonName: CommonName) {
  const sql = 'INSERT INTO common_names (uuid, common_name, number, year, language) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (common_name, number, year, language) DO NOTHING';
  await query(sql, [commonName.uuid, commonName.commonName, commonName.number, commonName.year, commonName.language]);
}

async function getKeywords(language: string) {
  const sql = 'SELECT DISTINCT keyword, id FROM keywords WHERE language = $1 ORDER BY keyword';
  const result = await query(sql, [language]);
  return result.rows;
}

async function getLawsByKeywordID(language: string, keyword_id: string) {
  const sql = 'SELECT laws.number, laws.year, laws.title, keywords.keyword FROM laws JOIN keywords ON laws.uuid=keywords.law_uuid WHERE keywords.language=$1 AND keywords.id=$2';
  const result = await query(sql, [language, keyword_id]);
  return result.rows;
}

async function getLawByUuid(uuid: string): Promise<{ title: string; year: number; number: string; is_empty: boolean } | null> {
  const sql = 'SELECT title, year, number, is_empty FROM laws WHERE uuid = $1';
  const result = await query(sql, [uuid]);
  return result.rows[0] || null;
}

async function getJudgmentByUuid(uuid: string): Promise<{ level: string; year: number; number: string; is_empty: boolean } | null> {
  const sql = 'SELECT level, year, number, is_empty FROM judgments WHERE uuid = $1';
  const result = await query(sql, [uuid]);
  return result.rows[0] || null;
}

export { setJudgment, getLawByNumberYear, getLawsByYear, setLaw, getLawCountByYear, getJudgmentByNumberYear, getJudgmentsByYear, getJudgmentCountByYear, setCommonName, getLawByUuid, getJudgmentByUuid, getKeywords, getLawsByKeywordID, setKeyword };
