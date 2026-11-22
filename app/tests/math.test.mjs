import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const M = require('../math.js')

const SEEDS = Array.from({ length: 200 }, (_, i) => i + 1)

test('every generator is deterministic for a seed', () => {
  for (const g of M.generators) {
    for (const seed of [1, 7, 42, 199]) {
      assert.deepEqual(M.materialize(g, seed), M.materialize(g, seed), g.id)
    }
  }
})

test('every generator yields finite answers, text and varied questions', () => {
  for (const g of M.generators) {
    const seen = new Set()
    for (const seed of SEEDS) {
      const q = M.materialize(g, seed)
      assert.ok(Number.isFinite(q.answer), `${g.id} seed ${seed}`)
      assert.ok(q.tolerance > 0, g.id)
      for (const field of [q.q, q.explain]) assert.ok(typeof field === 'string' && field.trim(), g.id)
      assert.ok(!/NaN|undefined|Infinity/.test(q.q + q.explain), `${g.id} seed ${seed}: ${q.q}`)
      seen.add(q.q)
    }
    assert.ok(seen.size >= 10, `${g.id} only produced ${seen.size} distinct questions`)
  }
})

test('generator ids are unique and cover every module', () => {
  const ids = M.generators.map((g) => g.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const m of M.modules) assert.ok(M.generators.some((g) => g.module === m.id), m.id)
})

test('known values: dot product, softmax, F1', () => {
  const dot = M.generators.find((g) => g.id === 'x01-g01')
  const q = M.materialize(dot, 5)
  const nums = [...q.q.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1].split(',').map(Number))
  assert.equal(q.answer, nums[0].reduce((s, x, i) => s + x * nums[1][i], 0))

  const soft = M.materialize(M.generators.find((g) => g.id === 'x05-g03'), 3)
  const z = [...soft.q.matchAll(/\[([^\]]+)\]/g)][0][1].split(',').map(Number)
  const cls = Number(/class (\d)/.exec(soft.q)[1]) - 1
  const e = z.map(Math.exp)
  assert.ok(Math.abs(soft.answer - e[cls] / e.reduce((a, b) => a + b, 0)) < 1e-3)

  const f1 = M.materialize(M.generators.find((g) => g.id === 'x06-g02'), 9)
  const [tp, fp, fn] = [...f1.q.matchAll(/=(\d+)/g)].map((m) => Number(m[1]))
  assert.ok(Math.abs(f1.answer - (2 * tp) / (2 * tp + fp + fn)) < 1e-3)
})

test('isNumericCorrect accepts values within tolerance and comma decimals, rejects junk', () => {
  const q = { answer: 3.14, tolerance: 0.01 }
  assert.equal(M.isNumericCorrect(q, '3.14'), true)
  assert.equal(M.isNumericCorrect(q, '3,145'), true)
  assert.equal(M.isNumericCorrect(q, '3.2'), false)
  assert.equal(M.isNumericCorrect(q, ''), false)
  assert.equal(M.isNumericCorrect(q, 'abc'), false)
})

test('bank mixes static questions and generator templates with engine fields', () => {
  assert.ok(M.bank.length > M.questions.length)
  for (const item of M.bank) assert.ok(item.id && item.module && item.level >= 1 && item.level <= 5 && item.ref)
})

test('materialize accepts a bank entry (id only) as well as the generator itself', () => {
  const entry = M.bank.find((item) => item.kind === 'generator')
  const viaBank = M.materialize(entry, 11)
  const viaTemplate = M.materialize(M.generators.find((g) => g.id === entry.id), 11)
  assert.deepEqual(viaBank, viaTemplate)
})
