import dotenv from "dotenv";
dotenv.config();

export const VALID_LANGUAGES = ['fin', 'swe'];
export const VALID_LEVELS = ['any', 'kho', 'kko'];

if (!process.env.START_YEAR) {
  process.env.START_YEAR = '1700';
}
export const START_YEAR = parseInt(process.env.START_YEAR, 10);
