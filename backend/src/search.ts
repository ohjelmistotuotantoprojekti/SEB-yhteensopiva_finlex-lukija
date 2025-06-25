import { Heading } from "./types/structure.js";
import Typesense from "typesense";
import { Errors } from "typesense";
import { CollectionCreateSchema } from "typesense/lib/Typesense/Collections.js";
import { SearchParams } from "typesense/lib/Typesense/Documents.js";
import { parseStringPromise } from "xml2js";
import xmldom from '@xmldom/xmldom';
import { parseXmlHeadings, parseHtmlHeadings } from './util/parse.js';
import { query } from "./db/db.js"
import { dropWords, dropwords_set_fin, dropwords_set_swe } from "./util/dropwords.js";
import { JSDOM } from "jsdom";
import { START_YEAR } from  './util/config.js';

if (!process.env.TYPESENSE_API_KEY) {
  console.error("TYPESENSE_API_KEY environment variable is not set.");
  process.exit(1);
}

const tsClient = new Typesense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || "localhost",
      port: process.env.TYPESENSE_PORT ? parseInt(process.env.TYPESENSE_PORT) : 8108,
      protocol: "http",
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 2
});

function flattenHeadings(headings: Heading[]) {
  const out: string[] = [];
  function recurse(arr: Heading[]) {
    for (const h of arr) {
      out.push(h.name);
      if (h.content && h.content.length) {
        recurse(h.content);
      }
    }
  }
  recurse(headings);
  return out;
}

function normalizeText(input: string[], lang: "fin" | "swe"): string[];
function normalizeText(input: string, lang: "fin" | "swe"): string;
function normalizeText(input: string | string[], lang: "fin" | "swe"): string | string[] {
  const dropwords_set = lang === "fin" ? dropwords_set_fin : dropwords_set_swe;
  const process = (str: string): string => {
    const words = str
      .toLowerCase()
      .replace(/\p{Punctuation}+/gu, ' ')
      .split(/\s+/);

    const filtered = words
      .map(word => word.trim())
      .filter(word => word.length > 3);

    const cleaned = dropWords(dropwords_set, filtered);

    return cleaned.join(' ').trim();
  };

  if (Array.isArray(input)) {
    return input.map(process).filter((str) => str.length > 0);
  } else {
    return process(input);
  }
}


export function extractParagraphs(xmlString: string): string[] {
  const doc = new xmldom.DOMParser().parseFromString(xmlString, "application/xml");
  const pNodes = doc.getElementsByTagName("p");
  return Array.from(pNodes, p => (p.textContent || '').trim()).filter(t => t);
}

export function extractParagraphsHtml(html: string): string[] {
  const dom = new JSDOM(html);
  const ps = dom.window.document.querySelectorAll('p');

  return Array.from(ps, p => (p.textContent || '').trim()).filter(t => t);
}

function localeLevel(level: string, lang: string): string {
  if (lang === "fin") {
    if (level === "kho") return "KHO";
    if (level === "kko") return "KKO";
    throw new Error(`Unsupported level: ${level} for language: ${lang}`);
  } else if (lang === "swe") {
    if (level === "kho") return "HD";
    if (level === "kko") return "HFD";
    throw new Error(`Unsupported level: ${level} for language: ${lang}`);
  } else throw new Error(`Unsupported language: ${lang}`);
}

export async function syncStatutes(lang: string) {
  let lang_short
  if (lang === "fin") {
    lang_short = "fi";
  } else if (lang === "swe") {
    lang_short = "sv";
  } else {
    throw new Error(`Unsupported language: ${lang}`);
  }
  const collectionName = `statutes_${lang}`;
  console.log(`Indexing: ${lang} -> ${collectionName}`);

  const schema: CollectionCreateSchema = {
    name: collectionName,
    fields: [
      { name: "id", type: "string", index: false },
      { name: "title", type: "string", locale: lang_short },
      { name: "year_num", type: "int32" },
      { name: "year", type: "string" },
      { name: "number", type: "string" },
      { name: "common_names", type: "string[]", locale: lang_short },
      { name: "headings", type: "string[]", locale: lang_short },
      { name: "paragraphs", type: "string[]", locale: lang_short },
      { name: "has_content", type: "int32" },
    ],
  };

  try {
    await tsClient.collections().create(schema);
    console.log(`Created collection ${collectionName}`);
  } catch (err) {
    if (!(err instanceof Errors.ObjectAlreadyExists)) {
      throw err;
    }
    console.log(`Collection ${collectionName} already exists`);
  }

  for (let year = START_YEAR; year <= new Date().getFullYear(); year++) {
    const { rows } = await query(
      `
      WITH cn AS (
          SELECT
          number,
          year,
          language,
          ARRAY_AGG(common_name) AS common_names
          FROM common_names
          WHERE language = $1 AND year = $2
          GROUP BY number, year, language
      )
      SELECT
          l.uuid   AS id,
          l.number AS number,
          l.year   AS year,
          l.title  AS title,
          l.is_empty AS is_empty,
          l.content::text AS content,
          COALESCE(cn.common_names, '{}') AS common_names
      FROM statutes l
      LEFT JOIN cn
          ON cn.number   = l.number
      AND cn.year     = l.year
      AND cn.language = l.language
      WHERE l.language = $1 AND l.year = $2
      ORDER BY l.uuid
      `,
      [lang, year]
    )
    if (rows.length === 0) continue

    while (rows.length > 0) {
      const row = rows.pop()
      const parsed_xml = await parseStringPromise(row.content, { explicitArray: false })
      const headingTree: Heading[] = parseXmlHeadings(parsed_xml) ?? [];
      const headings = flattenHeadings(headingTree);
      const paragraphs = extractParagraphs(row.content);

      await tsClient
        .collections(collectionName)
        .documents()
        .upsert({
          id: row.id,
          title: row.title,
          year: String(row.year),
          year_num: parseInt(row.year, 10),
          number: row.number,
          has_content: row.is_empty ? 0 : 1,
          common_names: row.common_names,
          headings: normalizeText(headings, lang),
          paragraphs: normalizeText(paragraphs, lang),
        });
    }

  }
}

export async function syncJudgments(lang: string) {
  let lang_short
  if (lang === "fin") {
    lang_short = "fi";
  } else if (lang === "swe") {
    lang_short = "sv";
  } else {
    throw new Error(`Unsupported language: ${lang}`);
  }
  const collectionName = `judgments_${lang}`;
  console.log(`\n=== Indexing: ${lang} -> ${collectionName}`);

  const schema: CollectionCreateSchema = {
    name: collectionName,
    fields: [
      { name: "id", type: "string", index: false },
      { name: "year_num", type: "int32" },
      { name: "year", type: "string" },
      { name: "number", type: "string" },
      { name: "level", type: "string" },
      { name: "headings", type: "string[]", locale: lang_short },
      { name: "paragraphs", type: "string[]", locale: lang_short },
      { name: "has_content", type: "int32" },
    ],
  };

  try {
    await tsClient.collections().create(schema);
    console.log(`Created collection ${collectionName}`);
  } catch (err) {
    if (!(err instanceof Errors.ObjectAlreadyExists)) {
      throw err;
    }
    console.log(`Collection ${collectionName} already exists`);
  }

  for (let year = START_YEAR; year <= new Date().getFullYear(); year++) {
    const { rows } = await query(
      `
      SELECT
          uuid   AS id,
          number AS number,
          year   AS year,
          level  AS level,
          is_empty AS is_empty,
          content::text AS content
      FROM judgments
      WHERE language = $1 AND year = $2
      ORDER BY uuid
      `,
      [lang, year]
    )
    if (rows.length === 0) continue

    while (rows.length > 0) {
      const row = rows.pop()
      const headingTree: Heading[] = parseHtmlHeadings(row.content) ?? [];
      const headings = flattenHeadings(headingTree);
      const paragraphs = extractParagraphsHtml(row.content);

      await tsClient
        .collections(collectionName)
        .documents()
        .upsert({
          id: row.id,
          year: String(row.year),
          year_num: parseInt(row.year, 10),
          level: localeLevel(row.level, lang),
          number: row.number,
          headings: normalizeText(headings, lang),
          paragraphs: normalizeText(paragraphs, lang),
          has_content: row.is_empty ? 0 : 1,
        });
    }

  }
}


export async function deleteCollection(name: string, lang: string) {
  const collectionName = `${name}_${lang}`;
  try {
    await tsClient.collections(collectionName).delete();
    console.log(`Deleted collection ${collectionName}`);
  } catch (err) {
    if (!(err instanceof Errors.ObjectNotFound)) {
      throw err;
    }
    console.log(`Collection ${collectionName} does not exist`);
  }
}


export async function searchStatutes(lang: string, queryStr: string) {
  const searchParameters: SearchParams = {
    q: queryStr,
    query_by: "title,common_names,headings,year,number,paragraphs",
    query_by_weights: "50,49,20,15,10,1",
    prefix: "true",
    num_typos: 2,
    text_match_type: "max_weight", // sum_score olisi ehkä parempi, mutta tämä client ei tue sitä
    sort_by: "has_content:desc,_text_match:desc,year_num:desc",
    per_page: 20
  };

  const searchResults = await tsClient
    .collections(`statutes_${lang}`)
    .documents()
    .search(searchParameters);

  return searchResults.hits?.map((hit) => (hit.document as { id: string }).id) || [];
}


export async function searchJudgments(lang: string, queryStr: string, level: string) {
  const searchParameters: SearchParams = {
    q: queryStr,
    query_by: "level,year,number,headings,paragraphs",
    query_by_weights: "50,49,48,10,1",
    prefix: "true",
    num_typos: 2,
    text_match_type: "max_weight", // sum_score olisi ehkä parempi, mutta tämä client ei tue sitä
    sort_by: "has_content:desc,_text_match:desc,year_num:desc",
    per_page: 20
  };
  if (level !== "any") {
    searchParameters.filter_by = `level:0${localeLevel(level, lang)}`;
  }

  const searchResults = await tsClient
    .collections(`judgments_${lang}`)
    .documents()
    .search(searchParameters);

  return searchResults.hits?.map((hit) => (hit.document as { id: string }).id) || [];
}
