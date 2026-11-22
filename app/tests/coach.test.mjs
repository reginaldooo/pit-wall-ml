import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const E = require('../engine.js')
const C = require('../coach.js')
const tips = require('../bank/tips.js')
const concept = require('../questions.js')
const math = require('../math.js')
const { problems } = require('../problems.js')

const catalog = { modules: [...concept.modules.map((m) => ({ ...m, track: 'quiz' })), ...math.modules.map((m) => ({ ...m, track: 'math' }))] }
const problemList = problems.map((p) => ({ id: p.id, tier: p.tier, title: p.title }))
const ctx = (extra = {}) => ({ today: '2026-03-10', catalog, problems: problemList, visited: [], missed: { quiz: 0, math: 0 }, last: null, ...extra })
const store = (engine = {}, mathState = {}) => ({ engine: { ...E.createState(), ...engine }, math: { ...E.createState(), ...mathState }, prefs: {} })
const everySlot = Object.fromEntries(['correct', 'answered', 'pct', 'xpGained', 'xp', 'nextLine', 'rank', 'gear', 'topic', 'streak', 'gap', 'track', 'count', 'mastery', 'title', 'okCount', 'total', 'tip'].map((k) => [k, 1]))

test('every style has at least two flavour phrases for every tone', () => {
  for (const style of C.STYLES) for (const tone of C.TONES) assert.ok(C.FLAVOR[style][tone].length >= 2, `${style}/${tone}`)
})

test('every situation has a valid tone and fills with a full slot set', () => {
  for (const [kind, [tone, core]] of Object.entries(C.CORES)) {
    assert.ok(C.TONES.includes(tone), kind)
    for (const style of C.STYLES) assert.doesNotMatch(C.say(style, kind, everySlot), /\{|undefined/, `${style}/${kind}`)
    assert.ok(core.length > 10, kind)
  }
})

test('a missing slot fails loudly instead of printing undefined', () => {
  assert.throws(() => C.fill('Hello {name}', {}), /Missing slot "name"/)
})

test('new learner: start with a practice lap, debrief says no laps yet, readiness is early', () => {
  const facts = C.snapshot(store(), ctx())
  assert.equal(facts.isNew, true)
  assert.equal(facts.xpToNext, E.RANKS[1].minXp)
  assert.equal(C.nextStint(facts, 'strategist')[0].id, 'newStart')
  assert.match(C.debrief(facts, 'calm')[0].text, /No laps yet/)
  assert.equal(C.evaluate(facts, 'analyst').kind, 'early')
})

test('weakest topic is the lowest touched mastery below 60%', () => {
  const facts = C.snapshot(store({ answered: 30, mastery: { m01: 0.9, m03: 0.3, m02: 0.55 } }), ctx())
  assert.equal(facts.weakest.id, 'm03')
  assert.equal(facts.mastered, 1)
  assert.equal(facts.untouched.some((t) => t.id === 'm03'), false)
})

test('next stint priorities: streak, then review backlog, then weak topic, then reading', () => {
  const base = store({ answered: 30, level: 2, dayStreak: 3, lastDay: '2026-03-09', mastery: { m03: 0.3 } })
  const ids = (c) => C.nextStint(C.snapshot(base, c), 'hype').map((a) => a.id)
  assert.deepEqual(ids(ctx({ missed: { quiz: 5, math: 0 } })), ['streak', 'review', 'weakTopic'])
  assert.deepEqual(ids(ctx()), ['streak', 'weakTopic', 'read'])
  assert.ok(!ids(ctx({ visited: ['03-nlp'] })).includes('read'))
})

test('review links to the track that has more mistakes', () => {
  const s = store({ answered: 30, level: 2 })
  assert.equal(C.nextStint(C.snapshot(s, ctx({ missed: { quiz: 1, math: 4 } })), 'calm')[0].href, '/math?mode=review')
  assert.equal(C.nextStint(C.snapshot(s, ctx({ missed: { quiz: 4, math: 1 } })), 'calm')[0].href, '/quiz?mode=review')
})

test('Grand Prix is only suggested with 20+ answers and recent accuracy of 70%+', () => {
  const trail = Array(20).fill(1)
  const good = C.snapshot(store({ answered: 25, correct: 22, trail, lastDay: '2026-03-10', mastery: { m01: 0.8 } }), ctx())
  assert.ok(C.nextStint(good, 'strategist').some((a) => a.id === 'grandPrix'))
  const early = C.snapshot(store({ answered: 12, trail, lastDay: '2026-03-10' }), ctx())
  assert.ok(!C.nextStint(early, 'strategist').some((a) => a.id === 'grandPrix'))
  const weak = C.snapshot(store({ answered: 25, trail: Array(20).fill(0), lastDay: '2026-03-10' }), ctx())
  assert.ok(!C.nextStint(weak, 'strategist').some((a) => a.id === 'grandPrix'))
})

test('Not now rotates the list when there are more than three candidates', () => {
  const s = store({ answered: 30, level: 3, trail: Array(20).fill(1), lastDay: '2026-03-10', mastery: { m03: 0.3, m01: 0.8 } })
  const facts = C.snapshot(s, ctx({ missed: { quiz: 4, math: 0 } }))
  const first = C.nextStint(facts, 'hype', 0).map((a) => a.id)
  const second = C.nextStint(facts, 'hype', 1).map((a) => a.id)
  assert.notDeepEqual(first, second)
  assert.equal(first.length, 3)
})

test('every next-stint item has a label, a local link and a why', () => {
  const facts = C.snapshot(store({ answered: 40, level: 4, mastery: { m03: 0.2 } }), ctx({ missed: { quiz: 3, math: 0 } }))
  for (const a of C.nextStint(facts, 'analyst')) {
    assert.ok(a.label.length > 3 && a.why.length > 10)
    assert.match(a.href, /^\/[a-z]/)
  }
})

test('evaluate: five transparent checks, ready when all are green, with the right checkpoint', () => {
  const s = store({ answered: 40, correct: 34, trail: Array(20).fill(1), solved: ['p01', 'p02', 'p03'], mastery: { m01: 0.9, m02: 0.8, m03: 0.75, m04: 0.7, m05: 0.6, m06: 0.6 }, lastDay: '2026-03-10' })
  const result = C.evaluate(C.snapshot(s, ctx()), 'strategist')
  assert.equal(result.checks.length, 5)
  assert.equal(result.checks.filter((c) => c.ok).length, 5)
  assert.equal(result.kind, 'ready')
  assert.equal(result.checkpoint.href, '/quiz?mode=boss')
  const mid = C.evaluate(C.snapshot(store({ answered: 15, trail: Array(15).fill(1) }), ctx()), 'calm')
  assert.equal(mid.checkpoint.href, '/quiz?mode=qualifying')
  assert.ok(mid.checks.every((c) => typeof c.detail === 'string' && c.detail.length))
})

test('debrief after a session names the result, XP and next rank, rank-ups and misses, and points to Next stint', () => {
  const last = { track: 'quiz', mode: 'qualifying', answered: 10, correct: 8, xpGained: 130, gearBefore: 2, gearAfter: 3, rankBefore: 'karting', rankAfter: 'f4', missedTopics: ['PyTorch'] }
  const facts = C.snapshot(store({ answered: 20, xp: 130, level: 3, dayStreak: 2, lastDay: '2026-03-10' }), ctx({ last }))
  const lines = C.debrief(facts, 'analyst')
  const text = lines.map((l) => l.text).join(' ')
  assert.ok(lines.length <= 4 && lines.length >= 3)
  assert.match(lines[0].text, /8 of 10/)
  assert.match(text, /130 XP/)
  assert.match(text, /Formula 4/)
  assert.match(lines.at(-1).text, /Next stint/)
  assert.equal(lines.at(-1).kind, 'pointer')
  assert.ok(lines.map((l) => l.kind).includes('xp'))
})

test('moods follow results, streaks and backlog', () => {
  const facts = (s, c) => C.snapshot(store(...s), ctx(c))
  assert.equal(C.mood(facts([{ answered: 10, run: 4 }])), 'fired')
  assert.equal(C.mood(facts([{ answered: 10, trail: Array(10).fill(0) }])), 'concerned')
  assert.equal(C.mood(facts([{ answered: 10 }], { last: { answered: 10, correct: 9 } })), 'celebrating')
  assert.equal(C.mood(facts([{ answered: 10 }])), 'focused')
  assert.equal(C.mood(facts([{ answered: 10 }], { missed: { quiz: 7, math: 0 } })), 'concerned')
})

test('tips cover every topic with at least two entries and are chosen by the weakest topic', () => {
  for (const m of catalog.modules) assert.ok((tips[m.id] || []).length >= 2, m.id)
  const facts = C.snapshot(store({ answered: 20, mastery: { m04: 0.2 } }), ctx())
  assert.match(C.tip(facts, tips, 'calm'), /PyTorch/)
})

test('200 random learners never produce undefined, NaN or raw slots in any style', () => {
  let seed = 7
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  const topicIds = catalog.modules.map((m) => m.id)
  for (let i = 0; i < 200; i += 1) {
    const mastery = Object.fromEntries(topicIds.filter(() => rnd() < 0.5).map((id) => [id, rnd()]))
    const answered = Math.floor(rnd() * 80)
    const s = store({ answered, correct: Math.floor(answered * rnd()), level: 1 + Math.floor(rnd() * 5), xp: Math.floor(rnd() * 5000), dayStreak: Math.floor(rnd() * 5), run: Math.floor(rnd() * 6), lastDay: rnd() < 0.5 ? '2026-03-10' : '2026-03-01', trail: Array.from({ length: Math.floor(rnd() * 20) }, () => (rnd() < 0.6 ? 1 : 0)), mastery, solved: problemList.filter(() => rnd() < 0.3).map((p) => p.id) })
    const last = rnd() < 0.5 ? null : { track: 'quiz', mode: 'adaptive', answered: 1 + Math.floor(rnd() * 10), correct: Math.floor(rnd() * 5), xpGained: Math.floor(rnd() * 100), gearBefore: 2, gearAfter: 1 + Math.floor(rnd() * 5), rankBefore: 'karting', rankAfter: rnd() < 0.2 ? 'f4' : 'karting', missedTopics: rnd() < 0.5 ? ['NLP'] : [] }
    const facts = C.snapshot(s, ctx({ last, missed: { quiz: Math.floor(rnd() * 8), math: Math.floor(rnd() * 8) } }))
    for (const style of C.STYLES) {
      const all = [...C.debrief(facts, style, i).map((l) => l.text), ...C.nextStint(facts, style, i, i).flatMap((a) => [a.label, a.why]), C.evaluate(facts, style, i).verdict, C.tip(facts, tips, style, i) || 'ok']
      for (const text of all) assert.doesNotMatch(text, /undefined|NaN|\{\w+\}|null/, `${style}: ${text}`)
    }
  }
})

test('catalog.js is up to date with the banks and problems', async () => {
  const { buildCatalog } = await import('../scripts/build-catalog.mjs')
  const fs = await import('node:fs')
  const file = new URL('../catalog.js', import.meta.url)
  assert.equal(fs.readFileSync(file, 'utf8'), buildCatalog(), 'run: npm run build:catalog')
})
