import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const Mod = require('../moderators.js')

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

test('avatars use generated colours and initials, not external assets', () => {
  const p = Mod.byId('lando-norris')
  assert.equal(Mod.initials(p), 'LN')
  assert.match(Mod.color(p), /^hsl\(\d+ 52% 38%\)$/)
})
