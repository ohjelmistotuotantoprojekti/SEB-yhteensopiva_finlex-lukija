import { test, before, after } from 'node:test'
import supertest from 'supertest'
import app from '../src/app.js'
import * as config from '../src/util/config.js'
import { setPool, closePool, setupTestDatabase } from '../src/db/db.js'

const api = supertest(app)

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

const validateStatuteContent = (response) => {
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
      !config.VALID_LEVELS.includes(resultList[0].docLevel)) {
    throw new Error('Response docLevel is not a valid level')
  }
}

before(async () => {
  await setupTestDatabase();
});

after(async () => {
  await closePool();
});

test('list of statutes per year is returned as valid json', async () => {
  await api
    .get('/api/statute/search?q=2023&language=fin')
    .expect(200)
    .expect('Content-Type', /application\/json/)
    .expect(validateSearchResponse)
    .expect(validateStatuteContent)
})

test('list of statutes per keyword is returned as valid json', async () => {
  await api
    .get('/api/statute/search?q=luonnonsuo&language=fin')
    .expect(200)
    .expect('Content-Type', /application\/json/)
    .expect(validateSearchResponse)
    .expect(validateStatuteContent)
})


test('a single statute is returned as xml', async () => {
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

test('statute headings, ids and subheadings are returned', async () => {
  await api
    .get('/api/statute/structure/id/2023/9/fin')
    .expect(200)
    .expect((response) => {
      if (response.body[0].name !== "1 luku - Yleiset säännökset") {
        throw new Error(`Heading name does not match: got "${JSON.stringify(response.body)}"`)
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
        throw new Error(`Heading name does not match: got "${JSON.stringify(response.body)}"`)
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
test('invalid statute returns error', async () => {
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
