/* Home: the personal-insight dashboard. KPIs, topic mastery, today's plan, Arena progress, mistakes, and
   recent sessions, all from the saved learner state plus the attempt history. Logged-out visitors see a
   login form and a greyed sample. Maths lives in insights.js and coach.js; this file only draws. */
(function () {
  'use strict'
  const App = window.App
  const E = window.QuizEngine
  const Coach = window.Coach
  const I = window.Insights
  const el = App.el
  const $ = (id) => document.getElementById(id)
  const SVG_NS = 'http://www.w3.org/2000/svg'
  const SPARK = { w: 120, h: 32 }
  const MAX_SESSIONS = 5
  const ACTIVITY_DAYS = 14
  const TRACK_NAMES = { quiz: 'Concept quiz', math: 'Math drills', arena: 'Arena' }
  const TIER_NAMES = { 1: 'Q1 Warm-up', 2: 'Q2 Midfield', 3: 'Q3 Pole position' }
  const QUICK = [['Practice', '/quiz'], ['Qualifying', '/quiz?mode=qualifying'], ['Grand Prix', '/quiz?mode=boss'], ['Math drills', '/math'], ['Arena', '/arena']]
  const WEAK = 0.6
  const GOOD = 0.7

  function visitedArticles() {
    try { return JSON.parse(localStorage.getItem('pwml.visited') || '[]') } catch (e) { return [] }
  }

  // ---------- data ----------
  function buildData(store, rows, today, now, catalog, last) {
    const facts = Coach.snapshot(store, {
      today, catalog, problems: catalog.problems, visited: visitedArticles(), last,
      missed: { quiz: Object.keys(store.engine.boxes).length, math: Object.keys(store.math.boxes).length },
    })
    return {
      store, facts, now, catalog,
      accuracy: I.topicAccuracy(rows, 30, now),
      daily: I.dailyActivity(rows, today, ACTIVITY_DAYS),
      sessions: I.sessionsFrom(rows).slice(0, MAX_SESSIONS),
      mistakes: { ...I.mistakesByTopic(store.engine.boxes), ...I.mistakesByTopic(store.math.boxes) },
      arena: I.arenaByTier(store.engine.solved, catalog.problems),
    }
  }

  // ---------- small drawing helpers ----------
  const meter = (value, tone) => el('div', { class: `meter ${tone || ''}`.trim(), role: 'img', 'aria-label': `${Math.round(value * 100)}%` }, el('i', { style: `width:${Math.round(Math.min(1, Math.max(0, value)) * 100)}%` }))

  function sparkline(values, label) {
    const svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('viewBox', `0 0 ${SPARK.w} ${SPARK.h}`)
    svg.setAttribute('class', 'spark')
    svg.setAttribute('role', 'img')
    svg.setAttribute('aria-label', label)
    const points = I.sparklinePoints(values, SPARK.w, SPARK.h)
    if (points.length > 1) {
      const line = document.createElementNS(SVG_NS, 'polyline')
      line.setAttribute('points', points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' '))
      svg.append(line)
    }
    return svg
  }

  const card = (title, ...children) => [el('h2', { class: 'small', text: title }), ...children]
  const rankName = (id) => App.TEXT.rankNames[id] || id
  const topicHref = (t) => `/${t.track === 'math' ? 'math' : 'quiz'}?module=${t.id}`

  // ---------- sections ----------
  function quickRow() {
    return el('nav', { class: 'quick', 'aria-label': 'Start a session' }, QUICK.map(([label, href]) => el('a', { class: 'chip', href, text: label })))
  }

  function kpi(label, value, ...extra) {
    return el('article', { class: 'card kpi' }, el('span', { class: 'kpi-label', text: label }), el('b', { class: 'kpi-value', text: value }), ...extra)
  }

  function kpis(d) {
    const f = d.facts
    const total = d.catalog.problems.length
    const days = d.daily.map((x) => x.answered)
    const active = days.filter((n) => n > 0).length
    return el('div', { class: 'kpis' },
      kpi(rankName(f.rank.id), `${f.xp} XP`, meter(f.fraction, f.rank.id === 'champion' ? 'gold' : ''), el('small', { text: f.next ? `${f.xpToNext} XP to ${rankName(f.next.id)}` : 'Top rank reached' })),
      kpi('Gear (quiz / math)', `${f.gear.quiz} / ${f.gear.math}`, el('small', { text: 'Gears run 1 to 5' })),
      kpi('Recent accuracy', f.accuracy.recent === null ? '-' : `${f.accuracy.recent}%`, el('small', { text: f.accuracy.recentN ? `last ${f.accuracy.recentN} answers${f.accuracy.lifetime !== null ? ` · ${f.accuracy.lifetime}% overall` : ''}` : 'No answers yet' })),
      kpi('Streak', `${f.streak} ${f.streak === 1 ? 'day' : 'days'}`, sparkline(days, `Answers per day over the last ${ACTIVITY_DAYS} days: active on ${active} days`), el('small', { text: `${active} active days in ${ACTIVITY_DAYS}` })),
      kpi('Arena solved', `${f.solved.total}/${total}`, meter(total ? f.solved.total / total : 0), el('small', { text: 'Python study cases' })))
  }

  function topics(d) {
    const sorted = [...d.facts.touched, ...d.facts.untouched]
    const rows = sorted.map((t) => {
      const acc = d.accuracy[t.id]
      const tone = t.mastery === null ? 'idle' : t.mastery < WEAK ? 'warn' : t.mastery >= GOOD ? 'good' : ''
      const note = t.mastery === null ? 'Not started' : `${Math.round(t.mastery * 100)}% mastery${acc ? ` · ${acc.pct}% of ${acc.answered} recent` : ''}`
      return el('li', { class: 'topic-row' }, el('a', { href: topicHref(t), text: t.name }), el('small', { text: note }), meter(t.mastery === null ? 0 : t.mastery, tone))
    })
    return el('section', { class: 'card dash-topics' }, ...card('Topic mastery', el('p', { class: 'muted', text: 'Weakest first. Select a topic to practise it.' }), el('ul', { class: 'topic-list' }, rows)))
  }

  function plan(d) {
    const actions = Coach.nextStint(d.facts, App.pit ? App.pit.hostStyle() : 'strategist', 0, 0)
    const list = App.pit ? App.pit.actionList(actions, 'dash') : el('ul', {}, actions.map((a) => el('li', {}, el('a', { href: a.href, text: a.label }))))
    return el('section', { class: 'card' }, ...card("Today's plan", list))
  }

  function arena(d) {
    const rows = [1, 2, 3].map((tier) => {
      const t = d.arena[tier]
      return el('li', { class: 'topic-row' }, el('span', { text: TIER_NAMES[tier] }), el('small', { text: `${t.solved} of ${t.total} solved` }), meter(t.total ? t.solved / t.total : 0))
    })
    return el('section', { class: 'card' }, ...card('Arena progress', el('ul', { class: 'topic-list' }, rows), el('a', { class: 'more', href: '/arena', text: 'Open the Arena' })))
  }

  function mistakes(d) {
    const entries = Object.entries(d.mistakes).sort((a, b) => b[1] - a[1])
    const total = entries.reduce((sum, [, n]) => sum + n, 0)
    const nameOf = (id) => (d.catalog.modules.find((m) => m.id === id) || { name: id }).name
    const body = total
      ? [el('div', { class: 'chips' }, entries.map(([id, n]) => el('a', { class: 'chip', href: id.startsWith('x') ? `/math?module=${id}` : `/quiz?module=${id}`, text: `${nameOf(id)} · ${n}` }))),
        el('a', { class: 'btn small', href: d.facts.backlog.quiz >= d.facts.backlog.math ? '/quiz?mode=review' : '/math?mode=review', text: `Review ${total} ${total === 1 ? 'mistake' : 'mistakes'}` })]
      : [el('p', { class: 'muted', text: 'No mistakes waiting. Missed questions come back here for review.' })]
    return el('section', { class: 'card' }, ...card('Mistakes to review', ...body))
  }

  function sessions(d) {
    const body = d.sessions.length
      ? el('ul', { class: 'list' }, d.sessions.map((s) => el('li', {}, el('div', { class: 'grow' }, el('b', { text: TRACK_NAMES[s.track] || s.track }), el('small', { text: `${s.answered} ${s.answered === 1 ? 'answer' : 'answers'} · ${I.relativeTime(s.at, d.now)}` })), el('span', { class: `tag ${s.accuracy >= GOOD * 100 ? '' : 'plain'}`.trim(), text: `${s.accuracy}%` }))))
      : el('p', { class: 'muted', text: 'No sessions yet. Start a practice lap and it shows up here.' })
    return el('section', { class: 'card dash-wide' }, ...card('Recent sessions', body))
  }

  function render(target, d) {
    target.replaceChildren(quickRow(), kpis(d), el('div', { class: 'dash-grid' }, topics(d), plan(d), arena(d), mistakes(d), sessions(d)))
  }

  // ---------- page ----------
  async function init() {
    await App.start({ id: 'home', title: 'Dashboard', xp: true })
    const catalog = window.CATALOG
    if (!App.isLoggedIn()) {
      // Signed out: only two ways forward, log in or start reading. Everything else is locked.
      $('guest').hidden = false
      $('pit').hidden = true
      const form = el('div', { id: 'gForm', hidden: true })
      const login = el('button', { class: 'btn', type: 'button', text: 'Log in or sign up' })
      login.addEventListener('click', () => {
        login.hidden = true
        form.hidden = false
        form.replaceChildren(App.authCard(() => location.reload()))
        const field = form.querySelector('input')
        if (field) field.focus()
      })
      $('gAuth').replaceChildren(el('section', { class: 'card welcome' },
        el('h1', { text: 'Learn machine learning, deep learning and NLP' }),
        el('p', { text: 'Read the notes without an account. Log in to unlock the quiz, math drills, the Python arena, your dashboard and your coach.' }),
        el('div', { class: 'actions' }, login, el('a', { class: 'btn secondary', href: '/learn', text: 'Start learning' })), form))
      return
    }
    const draw = async () => {
      const rows = await App.loadAttempts(500)
      render($('dash'), buildData(App.store, rows, App.todayIso(), Date.now(), catalog, App.store.last || null))
    }
    $('dash').hidden = false
    await draw()
  }
  init()
})()
