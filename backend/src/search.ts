import { Heading } from "./types/structure.js";
import Typesense from "typesense";
import { Errors } from "typesense";
import { CollectionCreateSchema } from "typesense/lib/Typesense/Collections.js";
import { SearchParams } from "typesense/lib/Typesense/Documents.js";
import { parseStringPromise } from "xml2js";
import xmldom from '@xmldom/xmldom';
import { parseXmlHeadings } from './util/parse.js';
import { query } from "./db/db.js"
import { dropWords, dropwords_fin } from "./util/dropwords.js";

const tsClient = new Typesense.Client({
  nodes: [
    {
      host: "finlex-typesense-svc",
      port: 8108,
      protocol: "http",
    },
  ],
  apiKey: "xyz",
  connectionTimeoutSeconds: 2,
  logLevel: "debug"
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

function normalizeText(input: string | string[]): string | string[] {
  const process = (str: string): string => {
    const words = str
      .toLowerCase()
      .replace(/\p{Punctuation}+/gu, ' ')
      .split(/\s+/);

    const filtered = words
      .map(word => word.trim())
      .filter(word => word.length > 3);

    const cleaned = dropWords(dropwords_fin, filtered);

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
  return Array.from(pNodes).map((node) => {
    if (!(node?.textContent)) return ""
    return node.textContent
  });
}


export async function syncLanguage(lang: string) {
  let lang_short
  if (lang === "fin") {
    lang_short = "fi";
  } else if (lang === "swe") {
    lang_short = "sv";
  } else {
    throw new Error(`Unsupported language: ${lang}`);
  }
  const collectionName = `laws_${lang}`;
  console.log(`\n=== Syncing language: ${lang} → ${collectionName}`);

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

  const { rows } = await query(
    `
    WITH cn AS (
        SELECT
        number,
        year,
        language,
        ARRAY_AGG(common_name) AS common_names
        FROM common_names
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
    FROM laws l
    LEFT JOIN cn
        ON cn.number   = l.number
    AND cn.year     = l.year
    AND cn.language = l.language
    WHERE l.language = $1
    ORDER BY l.uuid
    `,
    [lang]
  )

  const tsDocs = [];
  for (const row of rows) {
    const parsed_xml = await parseStringPromise(row.content, { explicitArray: false })
    const headingTree: Heading[] = parseXmlHeadings(parsed_xml) ?? [];
    const headings = flattenHeadings(headingTree);
    const paragraphs = extractParagraphs(row.content);

    tsDocs.push({
      id: row.id,
      title: row.title,
      year: String(row.year),
      year_num: parseInt(row.year, 10),
      number: row.number,
      has_content: row.is_empty ? 0 : 1,
      common_names: row.common_names,
      headings: normalizeText(headings),
      paragraphs: normalizeText(paragraphs),
    });
  }

  const importResult = await tsClient
    .collections(collectionName)
    .documents()
    .import(tsDocs, { action: "upsert" });

  console.log(importResult);
}

export async function deleteCollection(lang: string) {
  const collectionName = `laws_${lang}`;
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


export async function searchLaws(lang: string, queryStr: string) {
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
    .collections(`laws_${lang}`)
    .documents()
    .search(searchParameters);

  return searchResults.hits?.map((hit) => (hit.document as { id: string }).id) || [];
}
