import { parseStringPromise } from 'xml2js';
import axios from 'axios';
import { Akoma } from '../types/akoma.js';
import { Image } from '../types/image.js';
import { v4 as uuidv4 } from 'uuid';
import { setLaw } from './akoma.js';
import { setImage } from './image.js';
import { DOMParser } from 'xmldom';



function parseFinlexUrl(url: string): { docYear: number; docNumber: number; docLanguage: string } {
  try {
    const urlObj = new URL(url);

    // Esim:
    // /finlex/avoindata/v1/akn/fi/act/statute/2003/1081/fin@
    // Splitataan '/' and poistetaan tyhjät segmentit:
    // ["finlex", "avoindata", "v1", "akn", "fi", "act", "statute", "2003", "1081", "fin@"]
    const segments = urlObj.pathname.split('/').filter(Boolean);

    // Tarkista, että kaikki löytyy
    if (segments.length < 10) {
      throw new Error("Invalid URL format: Not enough segments.");
    }

    // Poimi vuosi ja numero
    const docYear = parseInt(segments[7]);
    const docNumber = parseInt(segments[8]);

    // Poimi kieli
    const docLanguage = segments[9].replace('@', '');

    return { docYear, docNumber, docLanguage };
  } catch (error) {
    console.error("Failed to parse URL:", error);
    throw error;
  }
}


async function parseTitlefromXML(result: Axios.AxiosXHR<unknown>): Promise<string> {
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

async function parseImagesfromXML(result: Axios.AxiosXHR<unknown>): Promise<string[]> {
  // Parsi XML data
  const xmlData = await result.data as string;
  const doc = new DOMParser().parseFromString(xmlData, 'text/xml');

  // Poimi image-elementit
  const imageNodes = doc.getElementsByTagNameNS('*', 'img');
  const imageLinks: string[] = [];

  // Hae src-attribuutit
  Array.from(imageNodes).forEach((node: Element) => {
    imageLinks.push(node.getAttribute('src') || '');
  });

  return imageLinks
}

const baseURL = 'https://opendata.finlex.fi/finlex/avoindata/v1';

async function setImages(docYear: number, docNumber: number, language: string, uris: string[]) {
  for (const uri of uris) {
    const path = `/akn/fi/act/statute/${docYear}/${docNumber}/${language}@/${uri}`
    const url = `${baseURL}${path}`
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
}

async function setSingleStatute(uri: string) {
  const result = await axios.get(`${uri}`, {
    headers: { 'Accept': 'application/xml', 'Accept-Encoding': 'gzip' }
  })
  const docTitle = await parseTitlefromXML(result)
  const imageLinks = await parseImagesfromXML(result)
  if (imageLinks.length > 0) {
    console.log(imageLinks.length)
    console.log(imageLinks)
  }

  const { docYear, docNumber, docLanguage } = parseFinlexUrl(uri)
  const lawUuid = uuidv4()
  const law: Akoma = {
    uuid: lawUuid,
    title: docTitle,
    number: docNumber,
    year: docYear,
    language: docLanguage,
    content: result.data as string,
  }
  setImages(docYear, docNumber, docLanguage, imageLinks)
  await setLaw(law)
}

async function listStatutesByYear(year: number, language: string): Promise<string[]> {
  const path = '/akn/fi/act/statute/list'
  const queryParams = {
    page: 1,
    limit: 10,
    sortBy: 'number',
    langAndVersion: language + '@',
    typeStatute: 'act',
    startYear: year,
    endYear: year,
  }

  const uris: string[] = []

  let result: Axios.AxiosXHR<Array<{ akn_uri: string }>>
  do {
    result = await axios.get(`${baseURL}${path}`, {
      params: queryParams,
      headers: { Accept: 'application/json' , 'Accept-Encoding': 'gzip'}
    })

    for (const item of result.data) {
      const uri = item.akn_uri
      uris.push(uri)
    }
    queryParams.page += 1
  } while (result.data.length > 0)
  console.log(`Found ${uris.length} statutes for year ${year} in language ${language}`)
  return uris
}


async function setStatutesByYear(year: number, language: string) {
  const uris = await listStatutesByYear(year, language)
  for (const uri of uris) {
    await setSingleStatute(uri)
  }
  console.log(`Set ${uris.length} statutes for year ${year} in language ${language}`)
}

export { setStatutesByYear, setSingleStatute }
