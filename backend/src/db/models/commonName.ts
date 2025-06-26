import { query } from '../db.js';
import { CommonName } from '../../types/commonName.js';

export async function setCommonName(commonName: CommonName) {
  const sql = 'INSERT INTO common_names (uuid, common_name, statute_uuid) VALUES ($1, $2, $3) ON CONFLICT (common_name, statute_uuid) DO NOTHING';
  await query(sql, [commonName.uuid, commonName.commonName, commonName.statuteUuid]);
}


export async function getCommonNamesByStatuteUuid(statuteUuid: string): Promise<string[]> {
  const sql = 'SELECT common_name FROM common_names WHERE statute_uuid = $1';
  const result = await query(sql, [statuteUuid]);
  return result.rows.map(row => row.common_name);
}
