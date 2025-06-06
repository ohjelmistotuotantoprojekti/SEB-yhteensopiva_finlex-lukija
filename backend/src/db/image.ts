import { query } from './db.js';
import { Image } from '../types/image.js';

async function setImage(image: Image) {
  const sql = 'INSERT INTO images (uuid, name, mime_type, content) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING';
  await query(sql, [image.uuid, image.name, image.mime_type, image.content]);
}

async function getImageByName(name: string): Promise<{content: Buffer, mimeType: string}| null> {
  const sql = 'SELECT content, mime_type FROM images WHERE name = $1';
  const result = await query(sql, [name]);
  if (result.rows.length === 0) {
    return null
  }
  return {content: result.rows[0].content, mimeType: result.rows[0].mime_type};
}

export { setImage, getImageByName };
