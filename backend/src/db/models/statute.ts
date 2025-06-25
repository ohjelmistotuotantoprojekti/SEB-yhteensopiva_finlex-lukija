import { searchLaws } from '../../search.js';
import { query } from '../db.js';
import { Statute, StatuteListItem } from '../../types/statute.js';

export async function setLaw(law: Statute) {
  const existingLaw = 'SELECT uuid, version FROM laws WHERE number = $1 AND year = $2 AND language = $3';
  const existingResult = await query(existingLaw, [law.number, law.year, law.language]);
  if (!(existingResult.rows.length > 0 && existingResult.rows[0].version === law.version)) {
    const deleteExisting = 'DELETE FROM laws WHERE number = $1 AND year = $2 AND language = $3';
    await query(deleteExisting, [law.number, law.year, law.language]);
    const sql = 'INSERT INTO laws (uuid, title, number, year, language, version, content, is_empty) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (number, year, language) DO NOTHING';
    await query(sql, [law.uuid, law.title, law.number, law.year, law.language, law.version, law.content, law.is_empty]);
    return law.uuid;
  } else {
    return existingResult.rows[0].uuid;
  }
}

export async function getLawCountByYear(year: number): Promise<number> {
  const sql = 'SELECT COUNT(*) FROM laws where year = $1';
  const result = await query(sql, [year]);
  return parseInt(result.rows[0].count, 10);
}

export async function getLawByUuid(uuid: string): Promise<StatuteListItem | null> {
  const sql = 'SELECT title as "docTitle", year as "docYear", number as "docNumber", is_empty as "isEmpty" FROM laws WHERE uuid = $1';
  const result = await query(sql, [uuid]);
  return result.rows[0] || null;
}

export async function getLawsByYear(year: number, language: string): Promise<StatuteListItem[]> {
  const sql = 'SELECT title as "docTitle", number as "docNumber", year as "docYear", is_empty as "isEmpty", version as "docVersion" FROM laws WHERE year = $1 AND language = $2 ORDER BY is_empty ASC, number ASC';
  const result = await query(sql, [year, language]);
  return result.rows;
}

export async function searchLawsByKeywordAndLanguage(keyword: string, language: string) {
  const preparedResults = [];
  const results_uuid = await searchLaws(language, keyword);
  for (const result of results_uuid) {
    const law = await getLawByUuid(result);
    if (law === null) continue;
    preparedResults.push(law);
  }
  return preparedResults;
}

export async function getLawByNumberYear(number: string, year: number, language: string): Promise<string | null> {
  const sql = 'SELECT content FROM laws WHERE number = $1 AND year = $2 AND language = $3';
  const result = await query(sql, [number, year, language]);
  return result.rows[0]?.content || null;
}
