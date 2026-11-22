import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

function freshBackend() {
  const store = new Map()
  globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) }
  globalThis.window = { Usernames: require('../usernames.js') }
  const file = require.resolve('../backend-local.js')
  delete require.cache[file]
  require(file)
  return globalThis.window.Backend
}

test('sign up logs in, rejects duplicates, and sign in checks the password', async () => {
  const b = freshBackend()
  assert.deepEqual(await b.signUp('racer', 'password123'), { ok: true, username: 'racer' })
  assert.deepEqual(await b.session(), { username: 'racer' })
  assert.deepEqual(await b.signUp('racer', 'another-pass'), { ok: false, error: 'taken' })
  await b.signOut()
  assert.equal(await b.session(), null)
  assert.deepEqual(await b.signIn('racer', 'wrong-password'), { ok: false, error: 'bad_credentials' })
  assert.deepEqual(await b.signIn('nobody', 'password123'), { ok: false, error: 'bad_credentials' })
  assert.deepEqual(await b.signIn('racer', 'password123'), { ok: true, username: 'racer' })
})

test('progress is private per user and requires a session', async () => {
  const b = freshBackend()
  assert.equal(await b.saveProgress({ engine: {} }), 'unauthorized')
  assert.equal((await b.loadProgress()).status, 'unauthorized')
  await b.signUp('one', 'password123')
  assert.equal(await b.saveProgress({ engine: { xp: 5 } }), 'ok')
  await b.signOut()
  await b.signUp('two', 'password123')
  assert.equal((await b.loadProgress()).progress, null)
  await b.signOut()
  await b.signIn('one', 'password123')
  assert.deepEqual((await b.loadProgress()).progress, { engine: { xp: 5 } })
})

test('leaderboard sums xp, sorts, and hides opted-out users', async () => {
  const b = freshBackend()
  for (const [name, xp, optOut] of [['a', 10, false], ['b', 50, false], ['c', 999, true]]) {
    await b.signUp(name, 'password123')
    await b.saveProgress({ engine: { xp }, math: { xp: 5 }, prefs: { optOut } })
    await b.signOut()
  }
  const { entries } = await b.leaderboard()
  assert.deepEqual(entries, [{ username: 'b', xp: 55 }, { username: 'a', xp: 15 }])
})

test('attempts are stored for the signed-in user and capped', async () => {
  const b = freshBackend()
  await b.logAttempts([{ track: 'quiz', item_id: 'm01-001', correct: true, level: 1 }])
  await b.signUp('racer', 'password123')
  const rows = Array.from({ length: 600 }, (_, i) => ({ track: 'quiz', item_id: `q${i}`, correct: true, level: 1 }))
  await b.logAttempts(rows)
  const db = JSON.parse(globalThis.localStorage.getItem('pwml.local.db'))
  assert.equal(db.attempts.length, 500)
  assert.equal(db.attempts.at(-1).item_id, 'q599')
})

test('loadAttempts returns only the signed-in user rows, newest first, limited', async () => {
  const b = freshBackend()
  await b.signUp('one', 'password123')
  await b.logAttempts([{ track: 'quiz', item_id: 'm01-001', correct: true, level: 1 }])
  await new Promise((r) => setTimeout(r, 5))
  await b.logAttempts([{ track: 'math', item_id: 'x01-g01', correct: false, level: 2 }, { track: 'quiz', item_id: 'm02-001', correct: true, level: 1 }])
  await b.signOut()
  await b.signUp('two', 'password123')
  await b.logAttempts([{ track: 'quiz', item_id: 'm03-001', correct: true, level: 1 }])
  assert.deepEqual((await b.loadAttempts()).map((r) => r.item_id), ['m03-001'])
  await b.signOut()
  await b.signIn('one', 'password123')
  const rows = await b.loadAttempts()
  assert.equal(rows.length, 3)
  assert.equal(rows[0].at >= rows[2].at, true)
  assert.deepEqual(Object.keys(rows[0]).sort(), ['at', 'correct', 'item_id', 'level', 'track'])
  assert.equal((await b.loadAttempts(2)).length, 2)
})

test('loadAttempts without a session is empty', async () => {
  assert.deepEqual(await freshBackend().loadAttempts(), [])
})
