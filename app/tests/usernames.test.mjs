import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const U = require('../usernames.js')

test('validate accepts a clean username and password and lowercases the name', () => {
  const r = U.validate({ username: '  Racer_1 ', password: 'password123' })
  assert.deepEqual(r, { ok: true, username: 'racer_1', password: 'password123' })
})

test('validate rejects bad usernames', () => {
  for (const username of ['ab', 'a'.repeat(21), 'has space', 'dot.name', 'ünï', '', null, undefined, 42]) {
    assert.equal(U.validate({ username, password: 'password123' }).error, 'invalid_username', String(username))
  }
})

test('validate rejects short, long and non-string passwords', () => {
  for (const password of ['short', 'x'.repeat(73), null, 12345678]) {
    assert.equal(U.validate({ username: 'racer', password }).error, 'invalid_password', String(password))
  }
  assert.equal(U.validate(null).error, 'invalid_username')
})

test('every valid username maps to a valid email and back', () => {
  for (const name of ['abc', 'a-b_c', '0racer9', 'x'.repeat(20)]) {
    const email = U.toEmail(name)
    assert.match(email, /^[a-z0-9_-]+@pitwall-ml\.app$/)
    assert.equal(U.fromEmail(email), name)
  }
  assert.equal(U.fromEmail('someone@gmail.com'), '')
})
