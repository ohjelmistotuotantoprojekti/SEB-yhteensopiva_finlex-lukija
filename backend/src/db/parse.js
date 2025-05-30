import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

function parseAkoma(html) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const section = doc.querySelector('section[class*="akomaNtoso"]');
  const sectionHTML = section.outerHTML;

  const newDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Ennakkopäätös</title>
</head>
<body>
  ${sectionHTML}
</body>
</html>`;

  return newDoc;
}

const inputUrl =  'https://finlex.fi/fi/oikeuskaytanto/korkein-hallinto-oikeus/ennakkopaatokset/2025/37';
const rawResult =  await fetch(inputUrl);
const inputHTML = await rawResult.text();
const parsedResult = parseAkoma(inputHTML);

// Valmis tiedosto = akoma.html
fs.writeFileSync(path.resolve(__dirname, 'akoma.html'), parsedResult, 'utf-8');