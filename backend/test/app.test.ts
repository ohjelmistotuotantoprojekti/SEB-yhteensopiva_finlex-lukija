import { test } from 'node:test'
import supertest from 'supertest'
import app from '../src/app.js'

const api = supertest(app)

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
