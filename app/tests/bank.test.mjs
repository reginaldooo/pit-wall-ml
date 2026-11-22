import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { buildSite } from '../scripts/build-learn.mjs'

const require = createRequire(import.meta.url)
const concept = require('../questions.js')
const math = require('../math.js')
const { articleAnchors } = buildSite()

const text = (v) => typeof v === 'string' && v.trim().length > 0

function refResolves(ref) {
  const [article, anchor] = ref.split('#')
  const anchors = articleAnchors.get(article)
  if (!anchors) return false
  return anchor ? anchors.has(anchor) : true
}

const tracks = [
  { name: 'concept', data: concept, prefix: /^m\d\d-\d{3}$/, minPerModule: 10, minPerLevel: 12 },
  { name: 'math', data: { modules: math.modules, questions: math.questions }, prefix: /^x\d\d-\d{3}$/, minPerModule: 4, minPerLevel: 4 },
]

for (const { name, data, prefix, minPerModule, minPerLevel } of tracks) {
  const ids = data.modules.map((m) => m.id)

  test(`${name}: modules have unique ids and names`, () => {
    assert.equal(new Set(ids).size, ids.length)
    for (const m of data.modules) assert.ok(text(m.name), m.id)
  })

  test(`${name}: question ids are unique and well formed`, () => {
    const all = data.questions.map((x) => x.id)
    assert.equal(new Set(all).size, all.length)
    for (const x of data.questions) {
      assert.match(x.id, prefix, x.id)
      assert.ok(x.id.startsWith(`${x.module}-`), `${x.id} id/module mismatch`)
    }
  })

  test(`${name}: every question has the required shape`, () => {
    for (const x of data.questions) {
      assert.ok(ids.includes(x.module), `${x.id} module`)
      assert.ok(Number.isInteger(x.level) && x.level >= 1 && x.level <= 5, `${x.id} level`)
      assert.ok(text(x.q), `${x.id} question`)
      assert.equal(x.options.length, 4, `${x.id} options`)
      for (const o of x.options) assert.ok(text(o), `${x.id} option`)
      assert.equal(new Set(x.options).size, 4, `${x.id} duplicate options`)
      assert.ok(Number.isInteger(x.answer) && x.answer >= 0 && x.answer <= 3, `${x.id} answer`)
      assert.ok(text(x.explain), `${x.id} explain`)
    }
  })

  test(`${name}: every ref points to a published article heading`, () => {
    for (const x of data.questions) assert.ok(refResolves(x.ref), `${x.id} ref ${x.ref}`)
  })

  test(`${name}: enough questions per module and per level`, () => {
    for (const id of ids) assert.ok(data.questions.filter((x) => x.module === id).length >= minPerModule, `module ${id}`)
    for (let level = 1; level <= 5; level += 1) {
      assert.ok(data.questions.filter((x) => x.level === level).length >= minPerLevel, `level ${level}`)
    }
  })

  test(`${name}: correct answers are not all in one position`, () => {
    const counts = [0, 0, 0, 0]
    for (const x of data.questions) counts[x.answer] += 1
    assert.ok(counts.filter((n) => n > 0).length >= 3, counts.join(','))
    assert.ok(Math.max(...counts) / data.questions.length < 0.6, counts.join(','))
  })
}
