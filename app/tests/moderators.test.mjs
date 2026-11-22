import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const Mod = require('../moderators.js')
const Personas = require('../personas.js')

test('roster ids are unique and roles are valid', () => {
  const ids = Mod.roster.map((p) => p.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const p of Mod.roster) {
    assert.match(p.id, /^[a-z0-9-]{1,30}$/, p.id)
    assert.ok(['principal', 'driver'].includes(p.role), p.id)
    assert.ok(p.name && p.team, p.id)
  }
  assert.ok(Mod.roster.filter((p) => p.role === 'principal').length >= 8)
  assert.ok(Mod.roster.filter((p) => p.role === 'driver').length >= 20)
})

test('defaults exist in the roster with the right roles', () => {
  assert.equal(Mod.byId(Mod.DEFAULTS.host).role, 'principal')
  assert.equal(Mod.byId(Mod.DEFAULTS.mate).role, 'driver')
})

test('every event has lines for both roles', () => {
  for (const [event, roles] of Object.entries(Mod.LINES)) {
    for (const role of ['principal', 'driver']) {
      assert.ok(roles[role] && roles[role].length >= 1, `${event}/${role}`)
      for (const line of roles[role]) assert.ok(typeof line === 'string' && line.trim(), `${event}/${role}`)
    }
  }
  for (const needed of ['correct', 'wrong', 'streak3', 'streak5', 'levelUp', 'levelDown', 'rankUp', 'solved', 'timeout']) assert.ok(Mod.LINES[needed], needed)
})

test('say is deterministic and falls back for unknown ids and events', () => {
  assert.equal(Mod.say('correct', 'toto-wolff', 1), Mod.say('correct', 'toto-wolff', 1))
  assert.ok(Mod.say('correct', 'nobody').length > 0)
  assert.ok(Mod.say('unknown-event', 'lando-norris').length > 0)
})

test('avatars show initials on a signature colour; photos are optional', () => {
  const p = Mod.byId('lando-norris')
  assert.equal(Mod.initials(p), 'LN')
  assert.equal(Mod.color(p), p.accent)
  assert.match(Mod.color({ id: 'nobody', accent: null }), /^hsl\(\d+ 52% 38%\)$/)
  for (const q of Mod.roster) assert.ok(q.photo === null || /^https:\/\/media\.formula1\.com\//.test(q.photo), q.id)
})

test('every person has a persona with an accent, a trait and their own lines', () => {
  const required = ['welcome', 'correct', 'wrong', 'streak3', 'streak5', 'levelUp', 'rankUp', 'solved', 'timeout']
  for (const p of Mod.roster) {
    assert.match(p.accent || '', /^#[0-9a-f]{6}$/i, `${p.id} accent`)
    assert.ok(p.trait.length > 10, `${p.id} trait`)
    const own = Personas[p.id].lines
    for (const event of required) assert.ok(own[event] && own[event].length >= 1 && own[event].every((l) => l.trim()), `${p.id}/${event}`)
    assert.ok(own.correct.length >= 2 && own.wrong.length >= 2, `${p.id} varied lines`)
  }
  for (const id of Object.keys(Personas)) assert.ok(Mod.byId(id), `persona without roster entry: ${id}`)
})

test('say uses the persona line and people sound different from each other', () => {
  assert.ok(Personas['max-verstappen'].lines.correct.includes(Mod.say('correct', 'max-verstappen', 0)))
  const voices = new Set(Mod.roster.map((p) => Mod.say('wrong', p.id, 0)))
  assert.equal(voices.size, Mod.roster.length)
  assert.ok(Mod.LINES.hint.driver.includes(Mod.say('hint', 'max-verstappen', 0)))
})

test('roster reflects the current grid', () => {
  assert.ok(Mod.byId('marcin-budkowski'))
  assert.equal(Mod.byId('graeme-lowdon'), null)
  const teams = new Set(Mod.roster.filter((p) => p.role === 'principal').map((p) => p.team))
  assert.equal(teams.size, 11)
})
