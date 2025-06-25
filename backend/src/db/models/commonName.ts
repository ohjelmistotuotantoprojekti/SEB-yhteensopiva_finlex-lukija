import { query } from '../db.js';
import { CommonName } from '../../types/commonName.js';

export async function setCommonName(commonName: CommonName) {
  const sql = 'INSERT INTO common_names (uuid, common_name, number, year, language) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (common_name, number, year, language) DO NOTHING';
  await query(sql, [commonName.uuid, commonName.commonName, commonName.number, commonName.year, commonName.language]);
}
