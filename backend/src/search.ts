import { Heading } from "./types/structure.js";
import Typesense from "typesense";
import { Errors } from "typesense";
import { CollectionCreateSchema } from "typesense/lib/Typesense/Collections.js";
import { SearchParams } from "typesense/lib/Typesense/Documents.js";
import { parseStringPromise } from "xml2js";
import { parseXmlHeadings } from './util/parse.js';
import { query } from "./db/db.js"

const tsClient = new Typesense.Client({
  nodes: [
    {
      host: "localhost",
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

async function extractParagraphs(xmlString: string) {
  const parsed = await parseStringPromise(xmlString, {
    trim: true,
    explicitChildren: false,
    explicitArray: true,
    preserveChildrenOrder: true,
  });
  const paras: string[] = [];

  function recurse(node: unknown) {
    if (!node || typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      if (key === "p") {
        const pArr = obj.p as unknown[];
        for (const p of pArr) {
          if (typeof p === "string") paras.push(p.trim());
          else if (typeof p === "object" && p !== null && "_" in p) paras.push((p as { _: string })._.trim());
        }
      } else {
        const value = obj[key];
        if (Array.isArray(value)) {
          for (const child of value) recurse(child);
        } else {
          recurse(value);
        }
      }
    }
  }

  recurse(parsed);
  return paras;
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
      { name: "id", type: "string" },
      { name: "title", type: "string", locale: lang_short },
      { name: "year", type: "int32" },
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
    const paragraphs = await extractParagraphs(row.content);

    tsDocs.push({
      id: row.id,
      title: row.title,
      year: row.year,
      number: row.number,
      has_content: row.is_empty ? 0 : 1,
      common_names: row.common_names || [],
      headings,
      paragraphs,
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
    query_by: "title,common_names,headings,paragraphs",
    query_by_weights: "50,49,10,1",
    prefix: "true",
    num_typos: 2,
    text_match_type: "max_weight", // sum_score olisi ehkä parempi, mutta tämä client ei tue sitä
    sort_by: "has_content:desc,_text_match:desc,year:desc,number:desc",
  };

  const searchResults = await tsClient
    .collections(`laws_${lang}`)
    .documents()
    .search(searchParameters);

  return searchResults.hits?.map((hit) => (hit.document as { id: string }).id) || [];
}
