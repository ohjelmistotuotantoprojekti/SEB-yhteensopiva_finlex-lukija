import { searchJudgments } from '../../search.js';
import { query } from '../db.js';
import { Judgment, JudgmentListItem } from '../../types/judgment.js';

export async function getJudgmentsByYear(year: number, language: string, level: string): Promise<JudgmentListItem[]> {
  if (level === 'any') level = '%';
  const sql = 'SELECT level as "docLevel", number as "docNumber", year as "docYear", is_empty as "isEmpty" FROM judgments WHERE year = $1 AND language = $2 AND level ILIKE $3 ORDER BY is_empty ASC, number ASC, level ASC';
  const result = await query(sql, [year, language, level]);
  return result.rows;
}

export async function setJudgment(judgment: Judgment) {
  const sql = 'INSERT INTO judgments (uuid, level, number, year, language, content, is_empty) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (level, number, year, language) DO NOTHING';
  await query(sql, [judgment.uuid, judgment.level, judgment.number, judgment.year, judgment.language, judgment.content, judgment.is_empty]);
}


export async function getJudgmentCountByYear(year: number): Promise<number> {
  const sql = 'SELECT COUNT(*) FROM judgments where year = $1';
  const result = await query(sql, [year]);
  return parseInt(result.rows[0].count, 10);
}

export async function getJudgmentByUuid(uuid: string): Promise<JudgmentListItem | null> {
  const sql = 'SELECT level as "docLevel", year as "docYear", number as "docNumber", is_empty as "isEmpty" FROM judgments WHERE uuid = $1';
  const result = await query(sql, [uuid]);
  return result.rows[0] || null;
}

// Hae oikeuskäytäntöpäätösten sisällöstä
export async function searchJudgmentsByKeywordAndLanguage(keyword: string, language: string, level: string) {
  const preparedResults = [];
  const results_uuid = await searchJudgments(language, keyword, level);
  for (const result of results_uuid) {
    const judgment = await getJudgmentByUuid(result);
    if (judgment === null) continue;
    preparedResults.push(judgment);
  }
  return preparedResults;
}

export async function getJudgmentByNumberYear(number: string, year: number, language: string, level: string): Promise<string | null> {
  if (level === 'any') level = '%';
  const sql = 'SELECT content FROM judgments WHERE number = $1 AND year = $2 AND language = $3 AND level ILIKE $4';
  const result = await query(sql, [number, year, language, level]);
  return result.rows[0]?.content || null;
}
