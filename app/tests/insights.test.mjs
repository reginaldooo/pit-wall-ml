import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const I = require('../insights.js')

const MIN = 60 * 1000
const DAY = 24 * 60 * MIN
const NOW = Date.parse('2026-03-10T12:00:00Z')
const row = (track, item_id, correct, at) => ({ track, item_id, correct, level: 1, at })

test('moduleOf reads the topic from quiz and math ids and ignores arena ids', () => {
  assert.equal(I.moduleOf('m03-012'), 'm03')
  assert.equal(I.moduleOf('x01-g02'), 'x01')
  assert.equal(I.moduleOf('p05'), null)
  assert.equal(I.moduleOf(''), null)
  assert.equal(I.moduleOf(undefined), null)
})

test('sessionsFrom groups by time gap and track, newest first', () => {
  const rows = [
    row('quiz', 'm01-001', true, NOW - 100 * MIN), row('quiz', 'm01-002', false, NOW - 95 * MIN), row('quiz', 'm01-003', true, NOW - 90 * MIN),
    row('quiz', 'm02-001', true, NOW - 10 * MIN), row('quiz', 'm02-002', true, NOW - 5 * MIN),
    row('math', 'x01-g01', false, NOW - 4 * MIN),
  ]
  const sessions = I.sessionsFrom(rows)
  assert.equal(sessions.length, 3)
  assert.deepEqual(sessions.map((s) => [s.track, s.answered, s.correct]), [['math', 1, 0], ['quiz', 2, 2], ['quiz', 3, 2]])
  assert.equal(sessions[2].accuracy, 67)
  assert.equal(sessions[1].at, NOW - 5 * MIN)
})

test('a gap of exactly the limit stays in one session and one minute more splits it', () => {
  const same = I.sessionsFrom([row('quiz', 'm01-001', true, 0), row('quiz', 'm01-002', true, 20 * MIN)])
  assert.equal(same.length, 1)
  const split = I.sessionsFrom([row('quiz', 'm01-001', true, 0), row('quiz', 'm01-002', true, 21 * MIN)])
  assert.equal(split.length, 2)
})

test('sessionsFrom handles empty and unsorted input without mutating it', () => {
  assert.deepEqual(I.sessionsFrom([]), [])
  const rows = [row('quiz', 'm01-002', true, 5 * MIN), row('quiz', 'm01-001', true, 1 * MIN)]
  const copy = JSON.stringify(rows)
  assert.equal(I.sessionsFrom(rows)[0].answered, 2)
  assert.equal(JSON.stringify(rows), copy)
})

test('topicAccuracy counts only the window and only topic ids', () => {
  const rows = [
    row('quiz', 'm03-001', true, NOW - 1 * DAY), row('quiz', 'm03-002', false, NOW - 2 * DAY), row('quiz', 'm03-003', true, NOW - 31 * DAY),
    row('arena', 'p01', true, NOW - 1 * DAY), row('math', 'x01-g01', true, NOW - 1 * DAY),
  ]
  const acc = I.topicAccuracy(rows, 30, NOW)
  assert.deepEqual(acc.m03, { answered: 2, correct: 1, pct: 50 })
  assert.deepEqual(acc.x01, { answered: 1, correct: 1, pct: 100 })
  assert.equal(Object.keys(acc).length, 2)
})

test('dailyActivity returns one entry per day, oldest first, zero filled', () => {
  const rows = [row('quiz', 'm01-001', true, NOW - 1 * DAY), row('quiz', 'm01-002', false, NOW - 1 * DAY), row('quiz', 'm01-003', true, NOW)]
  const days = I.dailyActivity(rows, '2026-03-10', 14, NOW)
  assert.equal(days.length, 14)
  assert.equal(days[13].date, '2026-03-10')
  assert.equal(days[0].date, '2026-02-25')
  assert.deepEqual([days[12].answered, days[12].correct, days[13].answered], [2, 1, 1])
  assert.equal(days.slice(0, 12).every((d) => d.answered === 0), true)
})

test('sparklinePoints stay inside the box for empty, single, flat and normal series', () => {
  assert.deepEqual(I.sparklinePoints([], 100, 20), [])
  assert.deepEqual(I.sparklinePoints([5], 100, 20), [[50, 10]])
  const flat = I.sparklinePoints([3, 3, 3], 100, 20)
  assert.ok(flat.every(([, y]) => y === 10))
  const pts = I.sparklinePoints([0, 5, 10], 100, 20, 2)
  assert.deepEqual(pts[0], [2, 18])
  assert.deepEqual(pts[2], [98, 2])
  for (const [x, y] of pts) assert.ok(x >= 2 && x <= 98 && y >= 2 && y <= 18)
})

test('mistakesByTopic groups missed-question boxes by module and skips unknown ids', () => {
  const boxes = { 'm03-001': { box: 0 }, 'm03-009': { box: 1 }, 'm01-004': { box: 0 }, 'x02-g01': { box: 0 }, weird: { box: 0 } }
  assert.deepEqual(I.mistakesByTopic(boxes), { m03: 2, m01: 1, x02: 1 })
  assert.deepEqual(I.mistakesByTopic({}), {})
})

test('arenaByTier counts solved and total per tier', () => {
  const problems = [{ id: 'p01', tier: 1 }, { id: 'p02', tier: 1 }, { id: 'p05', tier: 2 }, { id: 'p09', tier: 3 }]
  assert.deepEqual(I.arenaByTier(['p01', 'p09', 'gone'], problems), { 1: { solved: 1, total: 2 }, 2: { solved: 0, total: 1 }, 3: { solved: 1, total: 1 } })
})

test('relativeTime phrases minutes, hours, days', () => {
  assert.equal(I.relativeTime(NOW - 30 * 1000, NOW), 'just now')
  assert.equal(I.relativeTime(NOW - 5 * MIN, NOW), '5 min ago')
  assert.equal(I.relativeTime(NOW - 3 * 60 * MIN, NOW), '3 h ago')
  assert.equal(I.relativeTime(NOW - 2 * DAY, NOW), '2 days ago')
  assert.equal(I.relativeTime(NOW - 1 * DAY, NOW), 'yesterday')
})
