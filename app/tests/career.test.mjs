import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const E = require('../engine.js')

test('createState starts at zero xp with no solved problems', () => {
  const s = E.createState()
  assert.equal(s.xp, 0)
  assert.deepEqual(s.solved, [])
  assert.equal(s.dayStreak, 0)
  assert.equal(s.version, 3)
  assert.deepEqual(s.trail, [])
})

test('a correct answer awards 10 xp times the level', () => {
  const s = E.applyAnswer({ ...E.createState(), level: 3 }, { id: 'a', module: 'm', level: 3 }, true)
  assert.equal(s.xp, 30 + 0)
})

test('a wrong answer awards no xp', () => {
  const s = E.applyAnswer(E.createState(), { id: 'a', module: 'm', level: 1 }, false)
  assert.equal(s.xp, 0)
})

test('streak of 3 correct adds a bonus on the third answer', () => {
  let s = E.createState()
  const quiz = (id) => ({ id, module: 'm', level: 1 })
  s = E.applyAnswer(s, quiz('a'), true)
  assert.equal(s.xp, 10)
  s = E.applyAnswer(s, quiz('b'), true) // level moves up, streak resets
  const before = s.xp
  s = E.applyAnswer(s, quiz('c'), true)
  assert.equal(s.xp - before, 10 + 5)
})

test('numeric math answers give a flat bonus', () => {
  const s = E.applyAnswer(E.createState(), { id: 'g', module: 'x', level: 1 }, true, { bonusXp: E.MATH_BONUS_XP })
  assert.equal(s.xp, 10 + E.MATH_BONUS_XP)
})

test('rankFor maps xp thresholds to ranks in order', () => {
  assert.equal(E.rankFor(0).id, 'karting')
  assert.equal(E.rankFor(E.RANKS[1].minXp).id, 'f4')
  assert.equal(E.rankFor(E.RANKS[1].minXp - 1).id, 'karting')
  assert.equal(E.rankFor(10 ** 9).id, 'champion')
  const mins = E.RANKS.map((r) => r.minXp)
  assert.deepEqual(mins, [...mins].sort((a, b) => a - b))
  assert.equal(E.RANKS.length, 7)
})

test('rankProgress reports next rank and fraction', () => {
  const p = E.rankProgress(E.RANKS[1].minXp + 1)
  assert.equal(p.rank.id, 'f4')
  assert.equal(p.next.id, 'f3')
  assert.ok(p.fraction > 0 && p.fraction < 1)
  assert.equal(E.rankProgress(10 ** 9).next, null)
})

test('solveProblem awards tier xp once and stays idempotent', () => {
  let s = E.solveProblem(E.createState(), { id: 'p1', tier: 2 }, { hintsUsed: 0 })
  assert.equal(s.xp, E.PROBLEM_XP[2])
  assert.deepEqual(s.solved, ['p1'])
  const again = E.solveProblem(s, { id: 'p1', tier: 2 }, { hintsUsed: 0 })
  assert.equal(again.xp, s.xp)
})

test('hints reduce problem xp but never below the floor', () => {
  const s = E.solveProblem(E.createState(), { id: 'p1', tier: 1 }, { hintsUsed: 99 })
  assert.equal(s.xp, E.PROBLEM_MIN_XP)
})

test('touchDay builds a streak on consecutive days and resets after a gap', () => {
  let s = E.touchDay(E.createState(), '2026-03-01')
  assert.equal(s.dayStreak, 1)
  s = E.touchDay(s, '2026-03-01')
  assert.equal(s.dayStreak, 1)
  s = E.touchDay(s, '2026-03-02')
  assert.equal(s.dayStreak, 2)
  s = E.touchDay(s, '2026-03-05')
  assert.equal(s.dayStreak, 1)
})

test('restore migrates a v1 state and keeps its answers', () => {
  const v1 = { ...E.createState(), version: 1, level: 3, count: 12, answered: 12, correct: 9 }
  delete v1.xp; delete v1.solved; delete v1.dayStreak; delete v1.lastDay
  const s = E.restore(v1)
  assert.equal(s.level, 3)
  assert.equal(s.version, 3)
  assert.equal(s.xp, 0)
  assert.deepEqual(s.solved, [])
  assert.deepEqual(s.trail, [])
})

test('restore sanitises bad xp and solved fields', () => {
  const s = E.restore({ ...E.createState(), xp: -5, solved: 'nope' })
  assert.equal(s.xp, 0)
  assert.deepEqual(s.solved, [])
})

test('trail records the last 20 results as 1/0 in order', () => {
  let s = E.createState()
  for (let i = 0; i < 25; i += 1) s = E.applyAnswer(s, { id: `q${i}`, module: 'm', level: 1 }, i % 3 !== 0)
  assert.equal(s.trail.length, 20)
  assert.deepEqual(s.trail.slice(-3), [1, 1, 0].map((_, k) => ((22 + k) % 3 !== 0 ? 1 : 0)))
  assert.ok(s.trail.every((v) => v === 0 || v === 1))
})

test('restore keeps a valid trail and cleans a bad one', () => {
  assert.deepEqual(E.restore({ ...E.createState(), trail: [1, 0, 1] }).trail, [1, 0, 1])
  assert.deepEqual(E.restore({ ...E.createState(), trail: 'x' }).trail, [])
  assert.deepEqual(E.restore({ ...E.createState(), trail: [1, 7, 'a', 0] }).trail, [1, 0])
  assert.equal(E.restore({ ...E.createState(), trail: Array(50).fill(1) }).trail.length, 20)
})
