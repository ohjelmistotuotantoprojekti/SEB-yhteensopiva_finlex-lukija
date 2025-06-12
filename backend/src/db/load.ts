import { parseStringPromise } from 'xml2js';
import axios, { AxiosResponse } from 'axios'
import { Akoma, LawKey } from '../types/akoma.js';
import { Judgment, JudgmentKey } from '../types/judgment.js';
import { StatuteVersionResponse } from '../types/versions.js';
import { Image } from '../types/image.js';
import { v4 as uuidv4 } from 'uuid';
import { setJudgment, setLaw } from './akoma.js';
import { setImage } from './image.js';
import xmldom from '@xmldom/xmldom';
import { JSDOM } from 'jsdom';
import { XMLParser } from 'fast-xml-parser';
import { getLatestStatuteVersions } from '../util/parse.js';


function parseFinlexUrl(url: string): { docYear: number; docNumber: string; docLanguage: string; docVersion: string | null } {
  try {
    const urlObj = new URL(url);

    // Split URL into parts before and after @
    const [basePath, version] = urlObj.pathname.split('@');
    
    // Split base path and filter empty segments
    const segments = basePath.split('/').filter(Boolean);

    // Check for valid URL format
    if (segments.length < 9) {
      throw new Error("Invalid URL format: Not enough segments");
    }

    // Extract year, number and language
    const docYear = parseInt(segments[7]);
    const docNumber = segments[8];
    const docLanguage = segments[9];
    
    // Handle version - null if no version specified
    const docVersion = version ? version : null;

    return { docYear, docNumber, docLanguage, docVersion };
  } catch (error) {
    console.error("Failed to parse URL:", error);
    throw error;
  }
}

function buildFinlexUrl(law: LawKey): string {
  const baseUrl = 'https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute-consolidated';
  return `${baseUrl}/${law.year}/${law.number}/${law.language}@`;
}

function parseJudgmentUrl(url: string): JudgmentKey {
  const u = new URL(url)
  const parts = u.pathname.split("/").filter(p => p !== "")

  let language = parts[0]
  language = language === 'fi' ? 'fin' : 'swe'
  if (language !== 'fin' && language !== 'swe') {
    throw new Error(`Unknown language segment: ${language}`);
  }
  const courtSegment = parts[2]
  const year = parseInt(parts[4])
  const number = parts[5]

  let level: "kho" | "kko";
  if (courtSegment === "korkein-hallinto-oikeus" || courtSegment === "hogsta-forvaltningsdomstolen") {
    level = "kho";
  } else if (courtSegment === "korkein-oikeus" || courtSegment === "hogsta-domstolen") {
    level = "kko";
  } else {
    throw new Error(`Unknown court segment: ${courtSegment}`);
  }

  return { level, year, number, language }
}

function buildJudgmentUrl(judgment: JudgmentKey): string {
  const caselaw = judgment.language === 'fin' ? 'fi/oikeuskaytanto' : 'sv/rattspraxis';
  const baseUrl = 'https://finlex.fi';
  const path = `${judgment.year}/${judgment.number}`;
  let prefix
  if (judgment.level === 'kho') {
    prefix = judgment.language === 'fin' ? 'korkein-hallinto-oikeus/ennakkopaatokset' : 'hogsta-forvaltningsdomstolen/prejudikat';
  } else if (judgment.level === 'kko') {
    prefix = judgment.language === 'fin' ? 'korkein-oikeus/ennakkopaatokset' : 'hogsta-domstolen/prejudikat';
  } else {
    throw new Error(`Unknown court level: ${judgment.level}`);
  }
  return `${baseUrl}/${caselaw}/${prefix}/${path}`;
}




async function parseTitlefromXML(result: AxiosResponse<unknown>): Promise<string> {
  // Parsi XML data JSON-muotoon
  const xmlData = result.data as Promise<string>;
  const parsedXmlData = await parseStringPromise(xmlData, { explicitArray: false })

  // Poimi results-lista akomantoso-elementistä
  const resultNode = parsedXmlData?.akomaNtoso
  if (!resultNode) {
    throw new Error('Result node not found in XML')
  }

  // Poimi docTitle preface-elementistä
  const docTitle = resultNode?.act?.preface?.p?.docTitle
  if (!docTitle) {
    throw new Error('docTitle not found')
  }

  return docTitle
}

async function parseImagesfromXML(result: AxiosResponse<unknown>): Promise<string[]> {
  // Parsi XML data
  const xmlData = await result.data as string;
  const doc = new xmldom.DOMParser().parseFromString(xmlData, 'text/xml');

  // Poimi image-elementit
  const imageNodes = doc.getElementsByTagNameNS('*', 'img');
  const imageLinks: string[] = [];

  // Hae src-attribuutit
  Array.from(imageNodes).forEach((node: xmldom.Element) => {
    imageLinks.push(node.getAttribute('src') || '');
  });

  return imageLinks
}


function parseJudgmentList(inputHTML: string, language: string, level: string): string[] {
  const courtLevel = {fin: level === 'kho' ? 'KHO' : 'KKO', swe: level === 'kho' ? 'HFD' : 'HD'};
  const courtID = language === 'fin' ? courtLevel.fin : courtLevel.swe;
  const re = new RegExp(`${courtID}:\\d{4}(:\\d+|-[A-Za-z]+-\\d+)`, 'g');
  const matches = inputHTML.matchAll(re);
  return Array.from(matches, match => match[0]);
}

function parseURLfromJudgmentID(judgmentID: string): string {
  const parts = judgmentID.split(':');
  let IDparts: string[];

  if (parts[1].includes("-")) {
    const [year, number] = parts[1].split(/-(.+)/);
    IDparts = [parts[0], year, number];
  } else {
    IDparts = [parts[0], parts[1], parts[2]];
  }

  if (parts[0] === 'KHO') {
    return `https://finlex.fi/fi/oikeuskaytanto/korkein-hallinto-oikeus/ennakkopaatokset/${IDparts[1]}/${IDparts[2]}`;
  } else if (IDparts[0] === 'KKO') {
    return `https://finlex.fi/fi/oikeuskaytanto/korkein-oikeus/ennakkopaatokset/${IDparts[1]}/${IDparts[2]}`;
  } else if (IDparts[0] === 'HFD') {
    return `https://finlex.fi/sv/rattspraxis/hogsta-forvaltningsdomstolen/prejudikat/${IDparts[1]}/${IDparts[2]}`;
  }
  else if (IDparts[0] === 'HD') {
    return `https://finlex.fi/sv/rattspraxis/hogsta-domstolen/prejudikat/${IDparts[1]}/${IDparts[2]}`;
  } else {
    throw new Error(`Unknown court level: ${IDparts[0]}`);
  }
}

async function parseAkomafromURL(inputURL: string): Promise<{ content: string; is_empty: boolean }> {
  const result = await axios.get(inputURL, {
    headers: { 'Accept': 'text/html', 'Accept-Encoding': 'gzip' }
  });
  const inputHTML = result.data as string;
  const dom = new JSDOM(inputHTML);
  const doc = dom.window.document;
  const section = doc.querySelector('section[class*="akomaNtoso"]');

  let is_empty = true;

  if (section) {
    const paragraphs = section.querySelectorAll('p');
    is_empty = !Array.from(paragraphs).some(p => (p.textContent ?? '').trim() !== '');
  }

  const content = section ? section.outerHTML : '';

  return { content, is_empty };
}

async function checkIsXMLEmpty(xmlString: string): Promise<boolean> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });
  const parsed = parser.parse(xmlString);

  const body = parsed?.['akomaNtoso']?.['act']?.['body'];

  if (!body) return false;

  const container = body['hcontainer'];
  if (!container) return false;

  if (Array.isArray(container)) {
    return container.some(c => c?.['@_name'] === 'contentAbsent');
  } else {
    return container?.['@_name'] === 'contentAbsent';
  }
}


const baseURL = 'https://opendata.finlex.fi/finlex/avoindata/v1';

async function setImages(docYear: number, docNumber: string, language: string, uris: string[]) {
  for (const uri of uris) {
    const path = `/akn/fi/act/statute-consolidated/${docYear}/${docNumber}/${language}@/${uri}`
    const url = `${baseURL}${path}`
    try {
      const result = await axios.get(url, {
        headers: { 'Accept': 'image/*', 'Accept-Encoding': 'gzip' },
        responseType: 'arraybuffer'
      })

      const name = uri.split('/').pop()
      if (!name) {
        console.error(`Failed to extract name from URI: ${uri}`);
        continue;
      }
      const image: Image = {
        uuid: uuidv4(),
        name: name,
        mime_type: result.headers['content-type'],
        content: result.data as Buffer,
      }

      setImage(image)
    }
    catch {
      console.error(`Failed to fetch image from ${url}:`);
    }
  }
}

async function setSingleStatute(uri: string) {
  console.log(`Processing statute from URL: ${uri}`);
  const result = await axios.get(`${uri}`, {
    headers: { 'Accept': 'application/xml', 'Accept-Encoding': 'gzip' }
  })
  const docTitle = await parseTitlefromXML(result)
  const imageLinks = await parseImagesfromXML(result)
  if (imageLinks.length > 0) {
    console.log(imageLinks.length)
    console.log(imageLinks)
  }

  const xmlContent = result.data as string;
  const is_empty = await checkIsXMLEmpty(xmlContent);

  const { docYear, docNumber, docLanguage, docVersion } = parseFinlexUrl(uri)
  console.log(`Parsed document: Year=${docYear}, Number=${docNumber}, Language=${docLanguage}, Version=${docVersion}`);
  const lawUuid = uuidv4()
  const law: Akoma = {
    uuid: lawUuid,
    title: docTitle,
    number: docNumber,
    year: docYear,
    language: docLanguage,
    version: docVersion,
    content: result.data as string,
    is_empty: is_empty
  }

  setImages(docYear, docNumber, docLanguage, imageLinks)
  await setLaw(law)
}

async function setSingleJudgment(uri: string) {
  const parts = uri.split('/');
  let courtLevel = 'kko'
  if (parts.includes('korkein-hallinto-oikeus')) {
    courtLevel = 'kho'
  }
  else if (parts.includes('hogsta-forvaltningsdomstolen')) {
    courtLevel = 'kho'
  }

  let language = 'fin'
  if (parts[parts.length - 6] === 'sv') {
    language = 'swe'
  }

  let html: { content: string; is_empty: boolean }
  try {
    html = await parseAkomafromURL(uri)
  } catch {
    console.error(`Failed to set judgment for URL: ${uri}`);
    return;
  }

  const judgment: Judgment = {
    uuid: uuidv4(),
    level: courtLevel,
    number: parts[parts.length - 1],
    year: parts[parts.length - 2],
    language: language,
    content: html.content,
    is_empty: html.is_empty,
  }
  await setJudgment(judgment)
}


async function listStatutesByYear(year: number, language: string): Promise<string[]> {
  const path = '/akn/fi/act/statute-consolidated/list';
  const queryParams = {
    format: 'json',
    page: 1,
    limit: 10,
    startYear: year,
    endYear: year,
  };

  const uris: string[] = [];

  try {
    do {
      const result = await axios.get<StatuteVersionResponse[]>(`${baseURL}${path}`, {
        params: queryParams,
        headers: { 
          Accept: 'application/json',
          'Accept-Encoding': 'gzip'
        }
      });

      if (!Array.isArray(result.data)) {
        throw new Error('Invalid response format: expected an array');
      }

      const newUris = result.data.map(item => item.akn_uri);
      uris.push(...newUris);

      if (result.data.length < queryParams.limit) {
        break; // No more pages to fetch
      }

      queryParams.page += 1;
    } while (true);

    console.log(`Found ${uris.length} total statute versions for year ${year}`);
    
    // Get latest versions and filter by language
    const latestVersions = getLatestStatuteVersions(uris)
      .filter(uri => uri.includes(`/${language}@`));
    
    console.log(`Filtered to ${latestVersions.length} latest versions in ${language}`);
    
    return latestVersions;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Failed to fetch statute versions for year ${year}: ${error.message}`);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    } else {
      console.error(`Unexpected error while fetching statute versions: ${error}`);
    }
    return [];
  }
}


async function listJudgmentNumbersByYear(year: number, language: string, level: string): Promise<string[]> {
  let courtLevel = {
    fi: '',
    sv: ''
  };
  if (level === 'kho') {
    courtLevel = {fi: 'korkein-hallinto-oikeus', sv: 'hogsta-forvaltningsdomstolen'};
  } else if (level === 'kko') {
    courtLevel = {fi: 'korkein-oikeus', sv: 'hogsta-domstolen'};
  }
  const inputUrl = language === 'fin'
    ? `https://finlex.fi/fi/oikeuskaytanto/${courtLevel.fi}/ennakkopaatokset/${year}`
    : `https://finlex.fi/sv/rattspraxis/${courtLevel.sv}/prejudikat/${year}`;
  let parsedList: string[] = [];
  try {
    const result = await axios.get(inputUrl, {
      headers: { 'Accept': 'text/html', 'Accept-Encoding': 'gzip' }
    });
    const inputHTML = result.data as string;
    parsedList = parseJudgmentList(inputHTML, language, level);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return [];
    } else {
      console.error(`Failed to fetch judgment numbers for year ${year}, language ${language}, level ${level}:`, error);
      return [];
    }
  }
  return parsedList
}

async function listJudgmentsByYear(year: number, language: string, level: string): Promise<string[]> {
  const judgmentNumbers = await listJudgmentNumbersByYear(year, language, level);
  const judgmentURLsSet = new Set<string>();
  for (const judgmentID of judgmentNumbers) {
    const url = parseURLfromJudgmentID(judgmentID);
    judgmentURLsSet.add(url);
  }
  return Array.from(judgmentURLsSet);
}

async function setStatutesByYear(year: number, language: string) {
  const uris = await listStatutesByYear(year, language)
  for (const uri of uris) {
    await setSingleStatute(uri)
  }
  console.log(`Set ${uris.length} statutes for year ${year} in language ${language}`)
}

async function setJudgmentsByYear(year: number, language: string, level: string) {
  const uris = await listJudgmentsByYear(year, language, level)
  for (const uri of uris) {
    await setSingleJudgment(uri)
  }
  console.log(`Set ${uris.length} judgment for year ${year} in language ${language} and level ${level}`)
}

export { listStatutesByYear, setJudgmentsByYear, setStatutesByYear, setSingleStatute, listJudgmentNumbersByYear, listJudgmentsByYear, parseURLfromJudgmentID, setSingleJudgment, parseAkomafromURL, parseFinlexUrl, parseJudgmentUrl, buildFinlexUrl, buildJudgmentUrl }
