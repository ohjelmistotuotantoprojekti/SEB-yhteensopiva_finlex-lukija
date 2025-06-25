import { searchStatutes } from '../../search.js';
import { query } from '../db.js';
import { Statute, StatuteListItem } from '../../types/statute.js';

export async function setStatute(statute: Statute) {
  const existingStatute = 'SELECT uuid, version FROM statutes WHERE number = $1 AND year = $2 AND language = $3';
  const existingResult = await query(existingStatute, [statute.number, statute.year, statute.language]);
  if (!(existingResult.rows.length > 0 && existingResult.rows[0].version === statute.version)) {
    const deleteExisting = 'DELETE FROM statutes WHERE number = $1 AND year = $2 AND language = $3';
    await query(deleteExisting, [statute.number, statute.year, statute.language]);
    const sql = 'INSERT INTO statutes (uuid, title, number, year, language, version, content, is_empty) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (number, year, language) DO NOTHING';
    await query(sql, [statute.uuid, statute.title, statute.number, statute.year, statute.language, statute.version, statute.content, statute.is_empty]);
    return statute.uuid;
  } else {
    return existingResult.rows[0].uuid;
  }
}

export async function getStatuteCountByYear(year: number): Promise<number> {
  const sql = 'SELECT COUNT(*) FROM statutes where year = $1';
  const result = await query(sql, [year]);
  return parseInt(result.rows[0].count, 10);
}

export async function getStatuteByUuid(uuid: string): Promise<StatuteListItem | null> {
  const sql = 'SELECT title as "docTitle", year as "docYear", number as "docNumber", is_empty as "isEmpty" FROM statutes WHERE uuid = $1';
  const result = await query(sql, [uuid]);
  return result.rows[0] || null;
}

export async function getStatutesByYear(year: number, language: string): Promise<StatuteListItem[]> {
  const sql = 'SELECT title as "docTitle", number as "docNumber", year as "docYear", is_empty as "isEmpty", version as "docVersion" FROM statutes WHERE year = $1 AND language = $2 ORDER BY is_empty ASC, number ASC';
  const result = await query(sql, [year, language]);
  return result.rows;
}

// Hae lakien sisällöstä
export async function searchStatutesByKeywordAndLanguage(keyword: string, language: string) {
  const preparedResults = [];
  const results_uuid = await searchStatutes(language, keyword);
  for (const result of results_uuid) {
    const statute = await getStatuteByUuid(result);
    if (statute === null) continue;
    preparedResults.push(statute);
  }
  return preparedResults;
}

export async function getStatuteByNumberYear(number: string, year: number, language: string): Promise<string | null> {
  const sql = 'SELECT content FROM statutes WHERE number = $1 AND year = $2 AND language = $3';
  const result = await query(sql, [number, year, language]);
  return result.rows[0]?.content || null;
}
