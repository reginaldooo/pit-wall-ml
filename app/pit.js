/* Pit wall: the coach card. Two avatars (host and teammate), each with a coaching style and a mood, and three
   tabs: Debrief (what you did and your XP), Next stint (what to do), Evaluate (are you ready, and how to check).
   The content comes from coach.js (rules over the saved learner state); live reactions come from moderators.js. */
(function () {
  'use strict'
  const App = window.App
  const E = window.QuizEngine
  const Mod = window.Moderators
  const Coach = window.Coach
  const el = App.el
  const TAB_KEY = 'pwml.pitTab'
  const VISITED_KEY = 'pwml.visited'
  const WIDE = '(min-width: 1200px)'
  const MAX_RECENT = 3
  const TABS = [['debrief', 'Debrief'], ['next', 'Next stint'], ['evaluate', 'Evaluate']]
  const DEFAULT_STYLES = { host: 'strategist', mate: 'hype' }
  // Tone of each live event, used to pick the flavour phrase of the teammate's coaching style.
  const EVENT_TONE = { correct: 'good', wrong: 'tough', streak3: 'good', streak5: 'good', levelUp: 'good', levelDown: 'tough', rankUp: 'good', solved: 'good', failedTests: 'tough', timeout: 'tough' }

  let root = null
  let tab = 'debrief'
  let speaker = 'host'
  let turn = 0
  let skip = 0
  let line = { text: '', tone: '' }
  let recent = []
  const openReasons = new Set()

  try { tab = sessionStorage.getItem(TAB_KEY) || tab } catch (e) { /* optional */ }
  if (!TABS.some(([id]) => id === tab)) tab = 'debrief'

  const style = (role) => {
    const prefs = App.store.prefs
    const chosen = role === 'host' ? prefs.hostStyle : prefs.mateStyle
    return Coach.STYLES.includes(chosen) ? chosen : DEFAULT_STYLES[role]
  }
  const person = (role) => Mod.byId(role === 'host' ? App.store.prefs.host : App.store.prefs.mate) || Mod.byId(Mod.DEFAULTS[role === 'host' ? 'host' : 'mate'])

  function visited() {
    try { return JSON.parse(localStorage.getItem(VISITED_KEY) || '[]') } catch (e) { return [] }
  }

  function facts() {
    const catalog = window.CATALOG
    return Coach.snapshot(App.store, {
      today: App.todayIso(), catalog, problems: catalog.problems, visited: visited(), last: App.store.last || null,
      missed: { quiz: Object.keys(App.store.engine.boxes).length, math: Object.keys(App.store.math.boxes).length },
    })
  }

  function rankName(id) { return App.TEXT.rankNames[id] || id }

  // ---------- header: avatars and the speech bubble ----------
  function avatarButton(role, f) {
    const p = person(role)
    const mood = Coach.mood(f)
    const label = role === 'host' ? 'Host' : 'Teammate'
    const button = el('button', { class: 'pit-avatar', type: 'button', 'aria-pressed': String(speaker === role), 'data-mood': mood, 'aria-label': `${label} ${p.name}, ${Coach.MOOD_LABELS[mood]}. Tap for a tip.` },
      App.avatar(p), el('span', { class: 'pit-name' }, el('b', { text: p.name }), el('small', { text: `${label} · ${Coach.STYLE_LABELS[style(role)]}` }), el('small', { class: 'mood', text: Coach.MOOD_LABELS[mood] })))
    button.addEventListener('click', () => { speaker = role; speakTip() })
    return button
  }

  function speakTip() {
    turn += 1
    const f = facts()
    const text = Coach.tip(f, window.QuizTips, style(speaker), turn) || Mod.say('welcome', person(speaker).id, turn)
    setLine(text, '')
    root.querySelectorAll('.pit-avatar').forEach((b, i) => b.setAttribute('aria-pressed', String((i === 0 ? 'host' : 'mate') === speaker)))
  }

  function setLine(text, tone) {
    line = { text, tone }
    const bubble = root && root.querySelector('.bubble')
    if (!bubble) return
    bubble.textContent = text
    bubble.className = `bubble ${tone || ''}`.trim()
  }

  // ---------- panels ----------
  function debriefPanel(f) {
    const host = style('host')
    const lines = Coach.debrief(f, host, turn)
    const feed = recent.length
      ? el('div', {}, el('h3', { class: 'pit-sub', text: 'Recent comments' }), el('ul', { class: 'pit-recent' }, recent.map((r) => el('li', { text: r }))))
      : null
    return [...lines.map((l) => el('p', { class: 'pit-line', text: l.text })), feed]
  }

  // Action buttons with a "Why?" toggle. Shared with the Home dashboard; idPrefix keeps element ids unique per place.
  function actionList(actions, idPrefix = 'pit') {
    const items = actions.map((a) => {
      const whyId = `${idPrefix}-why-${a.id}`
      const why = el('p', { class: 'pit-why', id: whyId, text: a.why, hidden: !openReasons.has(a.id) })
      const toggle = el('button', { class: 'chip small-chip', type: 'button', 'aria-expanded': String(openReasons.has(a.id)), 'aria-controls': whyId, text: 'Why?' })
      toggle.addEventListener('click', () => {
        if (openReasons.has(a.id)) openReasons.delete(a.id); else openReasons.add(a.id)
        why.hidden = !openReasons.has(a.id)
        toggle.setAttribute('aria-expanded', String(openReasons.has(a.id)))
      })
      return el('li', { class: 'pit-action' }, el('div', { class: 'row' }, el('a', { class: 'btn small', href: a.href, text: a.label }), toggle), why)
    })
    return el('ul', { class: 'pit-actions' }, items)
  }

  function nextPanel(f) {
    const actions = Coach.nextStint(f, style('host'), skip, turn)
    const notNow = el('button', { class: 'chip', type: 'button', text: 'Not now' })
    notNow.addEventListener('click', () => { skip += 1; renderPanels() })
    return [actionList(actions, 'pit'), notNow]
  }

  function evaluatePanel(f) {
    const result = Coach.evaluate(f, style('host'), turn)
    return [
      el('p', { class: 'pit-line', text: result.verdict }),
      el('div', { class: `bar${f.rank.id === 'champion' ? ' gold' : ''}`, role: 'img', 'aria-label': result.milestone.label }, el('i', { style: `width:${Math.round(result.milestone.fraction * 100)}%` })),
      el('p', { class: 'muted pit-meta', text: `${rankName(f.rank.id)} · ${result.milestone.label}` }),
      el('ul', { class: 'pit-checks' }, result.checks.map((c) => el('li', { class: c.ok ? 'ok' : 'todo' }, el('span', { class: 'mark', 'aria-hidden': 'true', text: c.ok ? '✓' : '○' }), el('span', { class: 'grow' }, el('b', { text: c.label }), el('small', { text: c.detail })), el('span', { class: 'sr-only', text: c.ok ? 'done' : 'not yet' })))),
      el('a', { class: 'btn small', href: result.checkpoint.href, text: result.checkpoint.label }),
    ]
  }

  function renderPanels() {
    if (!root) return
    const f = facts()
    const panel = root.querySelector('.pit-panel')
    const builders = { debrief: debriefPanel, next: nextPanel, evaluate: evaluatePanel }
    panel.replaceChildren(...builders[tab](f).filter(Boolean))
    panel.setAttribute('aria-labelledby', `pit-tab-${tab}`)
    root.querySelectorAll('[role=tab]').forEach((b) => { const on = b.dataset.tab === tab; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1 })
    root.querySelectorAll('.pit-avatar').forEach((b, i) => { const m = Coach.mood(f); b.dataset.mood = m; b.querySelector('.mood').textContent = Coach.MOOD_LABELS[m]; void i })
  }

  function selectTab(id, focus) {
    tab = id
    try { sessionStorage.setItem(TAB_KEY, id) } catch (e) { /* optional */ }
    renderPanels()
    if (focus) root.querySelector(`[data-tab="${id}"]`).focus()
  }

  // ---------- mount ----------
  function mount(container) {
    root = container
    const f = facts()
    const first = Coach.debrief(f, style('host'), turn)[0]
    line = { text: first ? first.text : Mod.say('welcome', person('host').id), tone: '' }
    const tabs = el('div', { class: 'pit-tabs', role: 'tablist', 'aria-label': 'Pit wall views' }, TABS.map(([id, label]) =>
      el('button', { class: 'pit-tab', type: 'button', role: 'tab', id: `pit-tab-${id}`, 'data-tab': id, text: label, onclick: () => selectTab(id) })))
    tabs.addEventListener('keydown', (event) => {
      const index = TABS.findIndex(([id]) => id === tab)
      if (event.key === 'ArrowRight') { event.preventDefault(); selectTab(TABS[(index + 1) % TABS.length][0], true) }
      if (event.key === 'ArrowLeft') { event.preventDefault(); selectTab(TABS[(index + TABS.length - 1) % TABS.length][0], true) }
    })
    const plan = el('details', { class: 'pit-plan' }, el('summary', { text: 'Plan' }), tabs, el('div', { class: 'pit-panel', role: 'tabpanel', tabindex: '0' }))
    const query = window.matchMedia(WIDE)
    plan.open = query.matches
    if (query.addEventListener) query.addEventListener('change', () => { plan.open = query.matches })
    container.replaceChildren(el('h2', { class: 'small pit-title', text: App.TEXT.pitWall }),
      el('div', { class: 'pit-head' }, el('div', { class: 'pit-people' }, avatarButton('host', f), avatarButton('mate', f)), el('p', { class: 'bubble', role: 'status', 'aria-live': 'polite', text: line.text })),
      plan, el('p', { class: 'fan-note', text: App.TEXT.fanNote }))
    renderPanels()
  }

  // ---------- events ----------
  // Live reaction from a page (answer, solve, timeout...). The teammate speaks, flavoured by their style.
  function reaction(event, tone) {
    if (!root) return
    turn += 1
    const mate = person('mate')
    const base = Mod.say(event, ['rankUp', 'levelUp', 'levelDown', 'solved', 'failedTests', 'hint', 'boss', 'welcome'].includes(event) ? person('host').id : mate.id, turn)
    const flavorTone = EVENT_TONE[event]
    const phrases = flavorTone ? Coach.FLAVOR[style('mate')][flavorTone] : null
    const text = phrases ? `${phrases[turn % phrases.length]} ${base}` : base
    setLine(text, tone || '')
    recent = [text, ...recent].slice(0, MAX_RECENT)
    renderPanels()
  }

  // A finished session: remember it and let the host debrief it.
  function record(session) {
    App.update({ last: { ...session, at: Date.now() } })
    skip = 0
    openReasons.clear()
    turn += 1
    tab = 'debrief'
    try { sessionStorage.setItem(TAB_KEY, tab) } catch (e) { /* optional */ }
    const first = Coach.debrief(facts(), style('host'), turn)[0]
    if (first) setLine(first.text, '')
    renderPanels()
  }

  function refresh() { if (root) { const f = facts(); setLine(line.text, line.tone); void f; renderPanels() } }

  App.pit = { mount, reaction, record, refresh, rankName, actionList, hostStyle: () => style('host'), facts }
  void E
})()
