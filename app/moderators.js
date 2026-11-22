// Moderators: a fan-made roleplay layer. Pick a team principal as host and a driver as teammate.
// Each person has a persona in personas.js (original lines in their public style, never real quotes). Photos, when
// present, come from headshots.js (OpenF1 driver headshots, hotlinked); everyone falls back to initials on a signature
// colour. The roster is plain data: edit it when the grid changes.
;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./personas.js'), require('./headshots.js'))
  else root.Moderators = factory(root.Personas, root.Headshots)
})(typeof self !== 'undefined' ? self : this, function (personas, headshots) {
  const ROSTER_SEASON = 2026
  const slug = (name) => name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const person = (name, team, role) => {
    const id = slug(name)
    const persona = (personas || {})[id] || {}
    return { id, name, team, role, accent: persona.accent || null, trait: persona.trait || '', photo: (headshots || {})[id] || null }
  }
  const roster = [
    person('Toto Wolff', 'Mercedes', 'principal'), person('Fred Vasseur', 'Ferrari', 'principal'), person('Laurent Mekies', 'Red Bull', 'principal'),
    person('Andrea Stella', 'McLaren', 'principal'), person('James Vowles', 'Williams', 'principal'), person('Ayao Komatsu', 'Haas', 'principal'),
    person('Jonathan Wheatley', 'Audi', 'principal'), person('Marcin Budkowski', 'Cadillac', 'principal'), person('Alan Permane', 'Racing Bulls', 'principal'),
    person('Adrian Newey', 'Aston Martin', 'principal'), person('Flavio Briatore', 'Alpine', 'principal'),
    person('George Russell', 'Mercedes', 'driver'), person('Kimi Antonelli', 'Mercedes', 'driver'), person('Charles Leclerc', 'Ferrari', 'driver'),
    person('Lewis Hamilton', 'Ferrari', 'driver'), person('Max Verstappen', 'Red Bull', 'driver'), person('Isack Hadjar', 'Red Bull', 'driver'),
    person('Lando Norris', 'McLaren', 'driver'), person('Oscar Piastri', 'McLaren', 'driver'), person('Fernando Alonso', 'Aston Martin', 'driver'),
    person('Lance Stroll', 'Aston Martin', 'driver'), person('Pierre Gasly', 'Alpine', 'driver'), person('Franco Colapinto', 'Alpine', 'driver'),
    person('Alex Albon', 'Williams', 'driver'), person('Carlos Sainz', 'Williams', 'driver'), person('Liam Lawson', 'Racing Bulls', 'driver'),
    person('Arvid Lindblad', 'Racing Bulls', 'driver'), person('Esteban Ocon', 'Haas', 'driver'), person('Oliver Bearman', 'Haas', 'driver'),
    person('Nico Hulkenberg', 'Audi', 'driver'), person('Gabriel Bortoleto', 'Audi', 'driver'), person('Sergio Perez', 'Cadillac', 'driver'),
    person('Valtteri Bottas', 'Cadillac', 'driver'),
  ]
  const DEFAULTS = { host: 'toto-wolff', mate: 'lando-norris' }

  // Principals sound like a strategist on the pit wall, drivers like a racer on the radio.
  const LINES = {
    welcome: {
      principal: ['Lights out soon. Pick a mode and let us build a strategy.', 'Pit wall is ready. Show me a clean opening stint.'],
      driver: ['Out lap done. Tyres are in the window, let us go.', 'Radio check. Ready when you are.'],
    },
    correct: {
      principal: ['Good call. That is the right decision.', 'Clean execution. Keep that rhythm.', 'Data agrees with you. Next.'],
      driver: ['Purple sector! Nice one.', 'That felt good. Keep pushing.', 'Great lap. Next corner.'],
    },
    wrong: {
      principal: ['Not this time. Read the explanation, then we adjust.', 'A setback, not a retirement. Review and move on.', 'We lost time there. Learn the line and go again.'],
      driver: ['Missed the apex. It happens, reset.', 'Lock-up. Check the mistake and keep going.', 'Off track, but the car is fine. Back on it.'],
    },
    streak3: {
      principal: ['Three in a row. The pace is real.'],
      driver: ['Three clean laps! Momentum is building.'],
    },
    streak5: {
      principal: ['Five straight. That is a championship run.'],
      driver: ['Five in a row, on a roll! Do not lift now.'],
    },
    levelUp: {
      principal: ['Shifting up: new gear unlocked. Harder questions ahead.', 'You earned a faster car. Use it.'],
      driver: ['Upshift! Higher gear, higher speed.', 'Faster track now. Stay sharp.'],
    },
    levelDown: {
      principal: ['Downshift for stability. Rebuild the basics.'],
      driver: ['Dropping a gear to find grip. We will be back.'],
    },
    rankUp: {
      principal: ['Promotion confirmed. New rank, new responsibilities.'],
      driver: ['Podium! You moved up a rank.'],
    },
    solved: {
      principal: ['All tests green. That is how you ship a solution.'],
      driver: ['Chequered flag! Every test passed.'],
    },
    failedTests: {
      principal: ['Some tests failed. Read the failing case, then adjust the strategy.'],
      driver: ['Not a clean lap yet. Check the failing case.'],
    },
    timeout: {
      principal: ['Time limit hit. Look for a faster approach.'],
      driver: ['Too slow, the stewards stopped the run. Simplify.'],
    },
    hint: {
      principal: ['A hint costs points, but a good engineer uses all the data.'],
      driver: ['Radio hint coming in. Listen carefully.'],
    },
    boss: {
      principal: ['Grand Prix day. Mixed questions, no easy laps.'],
      driver: ['Race start! Stay calm on the first lap.'],
    },
  }

  function hash(text) {
    let h = 2166136261
    for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
    return h >>> 0
  }

  const lineBank = (id) => ((personas || {})[id] || {}).lines || {}
  const byId = (id) => roster.find((p) => p.id === id) || null
  const initials = (p) => p.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  // Signature colour from the persona; a stable generated one for anyone without a persona.
  const color = (p) => p.accent || `hsl(${hash(p.id) % 360} 52% 38%)`

  // Picks a line for an event. `turn` rotates through the variants so repeats feel fresh but stay deterministic.
  function say(event, personId, turn = 0) {
    const p = byId(personId) || byId(DEFAULTS.host)
    const own = lineBank(p.id)[event]
    const options = own && own.length ? own : (LINES[event] || LINES.welcome)[p.role]
    return options[(hash(p.id) + turn) % options.length]
  }

  return { ROSTER_SEASON, roster, LINES, DEFAULTS, byId, initials, color, say, hash }
})
