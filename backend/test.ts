import { setJudgment } from './src/db/akoma.js';
import { listJudgmentNumbersByYear, parseAkomafromURL, parseURLfromJudgmentID, setSingleJudgment, setJudgmentsByYear, listStatutesByYear, setSingleStatute } from './src/db/load.js';
import { setPool } from './src/db/db.js';
import dotenv from 'dotenv';
dotenv.config();

setPool(process.env.PG_URI)

let judglist = await listJudgmentNumbersByYear(2010, 'swe', 'kko')

let array = []
for (const j of judglist) {
    array.push(parseURLfromJudgmentID(j))
}

console.log(await listStatutesByYear(2010, 'fin'))
console.log(await listStatutesByYear(1970, 'fin'))
// setSingleStatute('https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute-consolidated/2010/69/fin@')
setSingleStatute('https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute-consolidated/1970/896/fin@')