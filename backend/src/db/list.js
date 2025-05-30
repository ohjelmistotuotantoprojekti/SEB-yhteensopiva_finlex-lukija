
function parseList(inputHTML) {
    const re = new RegExp(/KHO:\d\d\d\d:\d+/, 'g');
    const matches = inputHTML.matchAll(re);
    return Array.from(matches, match => match[0]);
}

const inputUrl =  'https://finlex.fi/fi/oikeuskaytanto/korkein-hallinto-oikeus/ennakkopaatokset/2025';
const rawResult =  await fetch(inputUrl);
const inputHTML = await rawResult.text();
const parsedResult = parseList(inputHTML);
console.log(parsedResult);