import { test, before, after } from 'node:test'
import supertest from 'supertest'
import app, {VALID_LEVELS} from '../src/app.js'
import { syncLanguage, syncJudgments } from '../src/search.js'

import dotenv from 'dotenv'
dotenv.config()

const api = supertest(app)

import { setPool, closePool, setupTestDatabase } from '../src/db/db.js'
setPool(process.env.PG_URI as string)

const validateSearchResponse = (response) => {
  if (response.body.length === 0) {
    throw new Error('Response is empty')
  }
  if (!response.body.type) {
    throw new Error('Response does not contain type')
  }
  if (response.body.type !== 'resultList') {
    throw new Error('Response type is not resultList')
  }
  if (!response.body.content) {
    throw new Error('Response does not contain content')
  }
  if (!Array.isArray(response.body.content)) {
    throw new Error('Response content is not an array')
  }
  if (response.body.content.length === 0) {
    throw new Error('Response content array is empty')
  }
}

const validateLawContent = (response) => {
  const resultList = response.body.content;
  if (!resultList[0].docYear || !resultList[0].docNumber || !resultList[0].docTitle) {
    throw new Error('Response object does not contain expected properties')
  }
  if (!(resultList[0].docYear >= 1900) || !(resultList[0].docYear <= new Date().getFullYear())) {
    throw new Error('Response docYear is not a valid year')
  }
  if (!resultList[0].docNumber?.match(/^\d+(-\d+)?$/)) {
    throw new Error('Response docNumber is not in valid format')
  }
  if (typeof resultList[0]?.docTitle !== 'string' || resultList[0].docTitle.length === 0) {
    throw new Error('Response docTitle is not a valid string')
  }
}

const validateJudgmentContent = (response) => {
  const resultList = response.body.content;
  if (!resultList[0].docYear || !resultList[0].docNumber || !resultList[0].docLevel) {
    throw new Error('Response object does not contain expected properties')
  }
  if (!(resultList[0].docYear >= 1900) || !(resultList[0].docYear <= new Date().getFullYear())) {
    throw new Error('Response docYear is not a valid year')
  }
  if (!resultList[0].docNumber.match(/^\d+(-\d+)?$/)) {
    throw new Error('Response docNumber is not in valid format')
  }
  if (typeof resultList[0].docLevel !== 'string' ||
      !VALID_LEVELS.includes(resultList[0].docLevel)) {
    throw new Error('Response docLevel is not a valid level')
  }
}

before(async () => {
  await setupTestDatabase();
  await syncLanguage('fin');
  await syncLanguage('swe');
  await syncJudgments('fin');
  await syncJudgments('swe');
});

after(async () => {
  await closePool();
});

test('list of laws per year is returned as valid json', async () => {
  await api
    .get('/api/statute/search?q=2023&language=fin')
    .expect(200)
    .expect('Content-Type', /application\/json/)
    .expect(validateSearchResponse)
    .expect(validateLawContent)
})

test('list of laws per keyword is returned as valid json', async () => {
  await api
    .get('/api/statute/search?q=luonnonsuo&language=fin')
    .expect(200)
    .expect('Content-Type', /application\/json/)
    .expect(validateSearchResponse)
    .expect(validateLawContent)
})


test('a single law is returned as xml', async () => {
  await api
    .get('/api/statute/id/2023/9/fin')
    .expect(200)
    .expect('Content-Type', /application\/xml/)
})

test('list of judgments per year is returned as valid json', async () => {
  await api
    .get('/api/judgment/search?q=2005&language=fin&level=kho')
    .expect(200)
    .expect('Content-Type', /application\/json/)
    .expect(validateSearchResponse)
    .expect(validateJudgmentContent)
})

test('a single judgment is returned as html', async () => {
  await api
    .get('/api/judgment/id/2005/13/fin/kho')
    .expect(200)
    .expect('Content-Type', /text\/html/)
})

test('list of judgments per keyword is returned as valid json', async () => {
  await api
    .get('/api/judgment/search?q=aiheutt&language=fin')
    .expect(200)
    .expect('Content-Type', /application\/json/)
    .expect(validateJudgmentContent)
})

test('law headings, ids and subheadings are returned', async () => {
  await api
    .get('/api/statute/structure/id/2023/9/fin')
    .expect(200)
    .expect((response) => {
      if (response.body[0].name !== "1 luku - Yleiset säännökset") {
        throw new Error("Heading name does not match")
      }
      if (response.body[0].id !== "chp_1") {
        throw new Error("Heading id does not match")
      }
      if (response.body[0].content[0].name !== "1 § - Lain tavoite") {
        throw new Error("Subheading does not match")
      }
      if (response.body[0].content[0].id !== "chp_1__sec_1") {
        throw new Error("Subheading id does not match")
      }
    })
})

test('judgment headings, ids and subheadings are returned', async () => {
  await api
    .get('/api/judgment/structure/id/2023/5/fin/kko')
    .expect((response) => {
      if (response.body[0].name !== "Asian käsittely alemmissa oikeuksissa") {
        throw new Error("Heading name does not match")
      }
      if (response.body[0].id !== "OT0") {
        throw new Error("Heading id does not match")
      }
      if (response.body[0].content[0].name !== "Asian tausta") {
        throw new Error("Subheading does not match")
      }
      if (response.body[0].content[0].id !== "OT0_OT0") {
        throw new Error("Subheading id does not match")
      }
    })
})

/*
test('invalid law returns error', async () => {
  await api
    .get('/api/statute/id/2100/15/fin')
    .expect(404)
    .expect('Content-Type', /application\/json/)
})

test('wrong path returns error', async () => {
  await api
    .get('/api/statutes/id/12/12/fin')
    .expect(404)
    .expect('Content-Type', /application\/json/)
})
*/
