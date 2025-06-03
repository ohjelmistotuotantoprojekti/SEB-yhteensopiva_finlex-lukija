import { test, before, after } from 'node:test'
import supertest from 'supertest'
import app from '../src/app.js'

const api = supertest(app)

import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { setPool, createTables, closePool } from '../src/db/db.js'
import { setSingleJudgment, setSingleStatute } from '../src/db/load.js'

let container;
let databaseUrl: string;

before(async () => {
  container = await new PostgreSqlContainer().start();
  databaseUrl = container.getConnectionUri();
  await setPool(databaseUrl);
  await createTables();
  await setSingleStatute("https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute-consolidated/2023/9/fin@")
  await setSingleStatute("https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute-consolidated/2023/4/fin@")
  await setSingleStatute("https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/act/statute-consolidated/2023/5/fin@")
  await setSingleJudgment("https://www.finlex.fi/fi/oikeuskaytanto/korkein-hallinto-oikeus/ennakkopaatokset/2005/13")
  await setSingleJudgment("https://www.finlex.fi/fi/oikeuskaytanto/korkein-oikeus/ennakkopaatokset/1990/10")
  await setSingleJudgment("https://www.finlex.fi/fi/oikeuskaytanto/korkein-oikeus/ennakkopaatokset/1975/II-16")
});

after(async () => {
  await closePool();
  await container.stop();
});

test('list of laws per year is returned as valid json', async () => {
  await api
    .get('/api/statute/year/2023/fin')
    .expect(200)
    .expect('Content-Type', /application\/json/)
    .expect((response) => {
      if (!Array.isArray(response.body)) {
        throw new Error('Response is not an array')
      }
      if (response.body.length === 0) {
        throw new Error('Response array is empty')
      }
      if (!response.body[0].docYear || !response.body[0].docNumber || !response.body[0].docTitle) {
        throw new Error('Response object does not contain expected properties')
      }
    })
})

test('list of laws per keyword is returned as valid json', async () => {
  await api
    .get('/api/statute/keyword/luonnonsuo/fin')
    .expect(200)
    .expect('Content-Type', /application\/json/)
    .expect((response) => {
      if (!Array.isArray(response.body)) {
        throw new Error('Response is not an array')
      }
      if (response.body.length === 0) {
        throw new Error('Response array is empty')
      }
      if (!response.body[0].docYear || !response.body[0].docNumber || !response.body[0].docTitle) {
        throw new Error('Response object does not contain expected properties')
      }
    })
})


test('a single law is returned as xml', async () => {
  await api
    .get('/api/statute/id/2023/9/fin')
    .expect(200)
    .expect('Content-Type', /application\/xml/)
})

test('list of judgments per year is returned as valid json', async () => {
  await api
    .get('/api/judgment/year/2005/fin/kho')
    .expect(200)
    .expect('Content-Type', /application\/json/)
    .expect((response) => {
      if (!Array.isArray(response.body)) {
        throw new Error('Response is not an array')
      }
      if (response.body.length === 0) {
        throw new Error('Response array is empty')
      }
      if (!response.body[0].docYear || !response.body[0].docNumber || !response.body[0].docLevel) {
        throw new Error('Response object does not contain expected properties')
      }
    })
})

test('a single judgment is returned as html', async () => {
  await api
    .get('/api/judgment/id/2005/13/fin/kho')
    .expect(200)
    .expect('Content-Type', /text\/html/)
})

test('list of judgments per keyword is returned as valid json', async () => {
  await api
    .get('/api/judgment/keyword/aiheutt/fin')
    .expect(200)
    .expect('Content-Type', /application\/json/)
    .expect((response) => {
      if (!Array.isArray(response.body)) {
        throw new Error('Response is not an array')
      }
      if (response.body.length === 0) {
        throw new Error('Response array is empty')
      }
      if (!response.body[0].docYear || !response.body[0].docNumber || !response.body[0].docLevel) {
        throw new Error('Response object does not contain expected properties')
      }
    })
})

test('headings, ids and subheadings are returned', async () => {
  await api
    .get('/api/statute/structure/id/2023/9/fin')
    .expect(200)
    .expect((response) => {
      if (response.body[0].name !== "1 luku - Yleiset säännökset") {
        throw new Error("Heading name does not match")
      }
      if (response.body[0].id !== "chp_1__heading") {
        throw new Error("Heading id does not match")
      }
      if (response.body[0].content[0].name !== "1 § - Lain tavoite") {
        throw new Error("Subheading does not match")
      }
      if (response.body[0].content[0].id !== "chp_1__sec_1__heading") {
        throw new Error("Subheading id does not match")
      }
    })
})

test('invalid law returns error', async () => {
  await api
    .get('/api/statute/id/2100/15/fin')
    .expect(400)
    .expect('Content-Type', /application\/json/)
})

test('wrong path returns error', async () => {
  await api
    .get('/api/statutes/id/12/12/fin')
    .expect(400)
    .expect('Content-Type', /application\/json/)
})