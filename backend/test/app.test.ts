import { test, before, after } from 'node:test'
import supertest from 'supertest'
import app from '../src/app.js'

const api = supertest(app)

import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { setPool, createTables, closePool } from '../src/db/db.js'
import { setSingleStatute } from '../src/db/load.js'

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


test('headings, ids and subheadings are returned', async () => {
  await api
    .get('/api/statute/structure/id/2023/9/fin')
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
