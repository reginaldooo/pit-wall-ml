import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const E = require('../engine.js')

function rngFrom(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeBank(perModulePerLevel = 6, modules = ['mA', 'mB']) {
  const bank = []
  for (const m of modules) {
    for (let level = 1; level <= 5; level += 1) {
      for (let i = 0; i < perModulePerLevel; i += 1) {
        bank.push({
          id: `${m}-${level}-${i}`,
          module: m,
          level,
          q: { en: 'q', id: 'q' },
          options: [0, 1, 2, 3].map((n) => ({ en: `o${n}`, id: `o${n}` })),
          answer: i % 4,
          explain: { en: 'e', id: 'e' },
          ref: 'x.md',
        })
      }
    }
  }
  return bank
}

const q = (id, module = 'mA', level = 1) => ({ id, module, level })

test('new state starts at level 1 with no history', () => {
  const s = E.createState()
  assert.equal(s.level, 1)
  assert.equal(s.count, 0)
  assert.deepEqual(s.recent, [])
})

test('two correct in a row moves up one level and resets the streak', () => {
  let s = E.createState()
  s = E.applyAnswer(s, q('a'), true)
  assert.equal(s.level, 1)
  s = E.applyAnswer(s, q('b'), true)
  assert.equal(s.level, 2)
  assert.equal(s.streakCorrect, 0)
})

test('a wrong answer between two correct ones breaks the streak', () => {
  let s = E.createState()
  s = E.applyAnswer(s, q('a'), true)
  s = E.applyAnswer(s, q('b'), false)
  s = E.applyAnswer(s, q('c'), true)
  assert.equal(s.level, 1)
})

test('two wrong in a row moves down but never below level 1', () => {
  let s = { ...E.createState(), level: 3 }
  s = E.applyAnswer(s, q('a'), false)
  s = E.applyAnswer(s, q('b'), false)
  assert.equal(s.level, 2)
  let low = E.createState()
  low = E.applyAnswer(low, q('a'), false)
  low = E.applyAnswer(low, q('b'), false)
  assert.equal(low.level, 1)
})

test('level never goes above 5', () => {
  let s = { ...E.createState(), level: 5 }
  s = E.applyAnswer(s, q('a'), true)
  s = E.applyAnswer(s, q('b'), true)
  assert.equal(s.level, 5)
})

test('applyAnswer does not mutate the previous state', () => {
  const before = E.createState()
  const snapshot = JSON.stringify(before)
  E.applyAnswer(before, q('a'), false)
  assert.equal(JSON.stringify(before), snapshot)
})

test('module mastery moves toward 1 on correct and toward 0 on wrong', () => {
  const up = E.applyAnswer(E.createState(), q('a', 'mA'), true)
  assert.ok(up.mastery.mA > 0.5)
  const down = E.applyAnswer(E.createState(), q('a', 'mA'), false)
  assert.ok(down.mastery.mA < 0.5)
})

test('a missed question enters the review box and is due after 3 answers', () => {
  let s = E.createState()
  s = E.applyAnswer(s, q('miss'), false)
  assert.equal(s.boxes.miss.box, 0)
  assert.equal(s.boxes.miss.dueAt, s.count + 3)
})

test('correct answer promotes the box, and finishing the last box removes it', () => {
  let s = E.createState()
  s = E.applyAnswer(s, q('miss'), false)
  s = E.applyAnswer(s, q('miss'), true)
  assert.equal(s.boxes.miss.box, 1)
  assert.equal(s.boxes.miss.dueAt, s.count + 7)
  s = E.applyAnswer(s, q('miss'), true)
  assert.equal(s.boxes.miss.box, 2)
  assert.equal(s.boxes.miss.dueAt, s.count + 15)
  s = E.applyAnswer(s, q('miss'), true)
  assert.equal(s.boxes.miss, undefined)
})

test('a miss while boxed resets to the first box', () => {
  let s = E.createState()
  s = E.applyAnswer(s, q('miss'), false)
  s = E.applyAnswer(s, q('miss'), true)
  s = E.applyAnswer(s, q('miss'), false)
  assert.equal(s.boxes.miss.box, 0)
})

test('pickQuestion returns a due review question first in adaptive mode', () => {
  const bank = makeBank()
  let s = E.createState()
  const target = bank[0]
  s = E.applyAnswer(s, target, false)
  for (let i = 0; i < 12; i += 1) s = E.applyAnswer(s, q(`filler-${i}`, 'mB', 2), true)
  const rng = rngFrom(1)
  const picked = E.pickQuestion(s, bank, { mode: 'adaptive', rng })
  assert.equal(picked.id, target.id)
})

test('pickQuestion never repeats a question inside the recent window', () => {
  const bank = makeBank(10)
  let s = { ...E.createState(), level: 3 }
  const rng = rngFrom(42)
  const shown = []
  for (let i = 0; i < 40; i += 1) {
    const pick = E.pickQuestion(s, bank, { mode: 'adaptive', rng })
    assert.ok(pick)
    const window = shown.slice(-E.RECENT_BLOCK)
    assert.ok(!window.includes(pick.id), `repeat ${pick.id} at ${i}`)
    shown.push(pick.id)
    s = { ...E.applyAnswer(s, pick, true), level: 3 }
  }
})

test('pickQuestion falls back to the nearest level when the level is empty', () => {
  const bank = makeBank(3, ['mA']).filter((x) => x.level !== 3)
  const s = { ...E.createState(), level: 3 }
  const pick = E.pickQuestion(s, bank, { mode: 'adaptive', rng: rngFrom(7) })
  assert.ok([2, 4].includes(pick.level))
})

test('weak modules are chosen more often than strong ones', () => {
  const bank = makeBank(30)
  const s = { ...E.createState(), level: 2, mastery: { mA: 0.1, mB: 0.95 } }
  const rng = rngFrom(99)
  let a = 0
  let b = 0
  for (let i = 0; i < 2000; i += 1) {
    const pick = E.pickQuestion({ ...s, recent: [] }, bank, { mode: 'adaptive', rng })
    if (pick.module === 'mA') a += 1
    else b += 1
  }
  assert.ok(a > b * 1.3, `a=${a} b=${b}`)
})

test('focus mode only returns questions from the chosen module', () => {
  const bank = makeBank()
  const s = E.createState()
  const rng = rngFrom(5)
  for (let i = 0; i < 30; i += 1) {
    const pick = E.pickQuestion({ ...s, recent: [] }, bank, { mode: 'focus', module: 'mB', rng })
    assert.equal(pick.module, 'mB')
  }
})

test('review mode returns only boxed questions and null when none', () => {
  const bank = makeBank()
  const empty = E.pickQuestion(E.createState(), bank, { mode: 'review', rng: rngFrom(1) })
  assert.equal(empty, null)
  const s = E.applyAnswer(E.createState(), bank[4], false)
  const pick = E.pickQuestion(s, bank, { mode: 'review', rng: rngFrom(1) })
  assert.equal(pick.id, bank[4].id)
})

test('shuffleOptions keeps the correct option and is a permutation', () => {
  const question = makeBank(1, ['mA'])[0]
  const view = E.shuffleOptions(question, rngFrom(11))
  assert.equal(view.options.length, 4)
  const original = question.options[question.answer]
  assert.deepEqual(view.options[view.answer], original)
  const texts = view.options.map((o) => o.en).sort()
  assert.deepEqual(texts, question.options.map((o) => o.en).sort())
})

test('restore rejects a malformed saved state and returns defaults', () => {
  const s = E.restore({ level: 99, count: 'x' })
  assert.equal(s.level, 1)
  const ok = E.restore({ ...E.createState(), level: 4, count: 10 })
  assert.equal(ok.level, 4)
  assert.equal(E.restore(null).level, 1)
})

test('summarize reports accuracy and lists weakest touched modules first', () => {
  let s = E.createState()
  s = E.applyAnswer(s, q('a', 'mA'), true)
  s = E.applyAnswer(s, q('b', 'mB'), false)
  s = E.applyAnswer(s, q('c', 'mB'), false)
  const sum = E.summarize(s)
  assert.equal(sum.answered, 3)
  assert.equal(sum.correct, 1)
  assert.equal(sum.accuracy, 33)
  assert.equal(sum.weakest[0].module, 'mB')
})

test('prefers an unseen question at a nearby level over repeating a seen one', () => {
  const bank = makeBank(2, ['mA'])
  const atLevel = bank.filter((x) => x.level === 3)
  let s = { ...E.createState(), level: 3, seen: atLevel.map((x) => x.id), recent: [] }
  const pick = E.pickQuestion(s, bank, { mode: 'adaptive', rng: rngFrom(3) })
  assert.notEqual(pick.level, 3)
  assert.ok([2, 4].includes(pick.level))
})

test('repeats a seen question only when every nearby question has been seen', () => {
  const bank = makeBank(2, ['mA'])
  const s = { ...E.createState(), level: 3, seen: bank.map((x) => x.id), recent: [] }
  const pick = E.pickQuestion(s, bank, { mode: 'adaptive', rng: rngFrom(3) })
  assert.equal(pick.level, 3)
})

test('in review mode one correct answer clears a missed question, and a wrong answer keeps it', () => {
  const missed = E.applyAnswer(E.createState(), q('a'), false)
  const cleared = E.applyAnswer(missed, q('a'), true, { mode: 'review' })
  assert.deepEqual(cleared.boxes, {})
  const kept = E.applyAnswer(missed, q('a'), false, { mode: 'review' })
  assert.equal(kept.boxes.a.box, 0)
})

test('outside review mode a missed question still needs three correct answers to clear', () => {
  let state = E.applyAnswer(E.createState(), q('a'), false)
  state = E.applyAnswer(state, q('a'), true, { mode: 'adaptive' })
  state = E.applyAnswer(state, q('a'), true, { mode: 'focus' })
  assert.ok(state.boxes.a)
  state = E.applyAnswer(state, q('a'), true)
  assert.deepEqual(state.boxes, {})
})

test('review mode works through every missed question once, and the missed count drops with each correct answer', () => {
  const bank = [q('a'), q('b'), q('c'), q('d')]
  let state = E.createState()
  for (const item of bank) state = E.applyAnswer(state, item, false)
  const counts = []
  for (let i = 0; i < bank.length; i += 1) {
    counts.push(E.missedCount(state, bank))
    const next = E.pickQuestion(state, bank, { mode: 'review' })
    state = E.applyAnswer(state, next, true, { mode: 'review' })
  }
  assert.deepEqual(counts, [4, 3, 2, 1])
  assert.equal(E.missedCount(state, bank), 0)
  assert.equal(E.pickQuestion(state, bank, { mode: 'review' }), null)
})

test('missedCount ignores missed ids that are no longer in the bank', () => {
  let state = E.applyAnswer(E.createState(), q('gone'), false)
  state = E.applyAnswer(state, q('a'), false)
  assert.equal(E.missedCount(state, [q('a')]), 1)
})

test('prune drops box, recent and seen ids that no longer exist in the bank', () => {
  let state = E.createState()
  for (const id of ['a', 'gone', 'b']) state = E.applyAnswer(state, q(id), false)
  const pruned = E.prune(state, [q('a'), q('b')])
  assert.deepEqual(Object.keys(pruned.boxes).sort(), ['a', 'b'])
  assert.deepEqual(pruned.recent, ['a', 'b'])
  assert.deepEqual(pruned.seen, ['a', 'b'])
  assert.equal(pruned.answered, state.answered)
  assert.ok(Object.keys(state.boxes).includes('gone'), 'the input state is not mutated')
})
