/* Profile: rank progress, moderator picks, leaderboard opt-out, backup. */
(function () {
  'use strict'
  const App = window.App
  const E = window.QuizEngine
  const Mod = window.Moderators
  const Coach = window.Coach
  const el = App.el
  const $ = (id) => document.getElementById(id)
  const Q = {
      title: 'Profile', next: (n, xp) => `${xp} XP to ${n}`, top: 'Top rank reached', stats: { answered: 'Quiz answers', math: 'Math answers', solved: 'Arena solved', streak: 'Day streak', gear: 'Quiz gear' },
      hostTitle: 'Choose your host (team principal)', mateTitle: 'Choose your teammate (driver)', season: (y) => `Grid ${y}. Fan-made roleplay in each person's public style: not real quotes, not endorsed by anyone. Photos are from OpenF1.`,
      settings: 'Settings', optOut: 'Hide me from the leaderboard', export: 'Download backup', import: 'Restore backup', badFile: 'That file is not a valid backup.', restored: 'Backup restored.',
  }
  const q = () => Q

  function stat(label, value) { return el('div', { class: 'stat' }, el('b', { text: String(value) }), el('span', { class: 'muted', text: label })) }

  function renderRank() {
    const { engine, math } = App.store
    const xp = engine.xp + math.xp
    const p = E.rankProgress(xp)
    const name = App.TEXT.rankNames[p.rank.id]
    const nextText = p.next ? q().next(App.TEXT.rankNames[p.next.id], p.next.minXp - xp) : q().top
    $('rankCard').replaceChildren(
      el('div', { class: 'row' }, el('span', { class: 'rank-badge', 'data-rank': p.rank.id, text: name }), el('b', { text: `${xp} ${App.TEXT.xp}` })),
      el('div', { class: `bar${p.rank.id === 'champion' ? ' gold' : ''}`, role: 'img', 'aria-label': nextText }, el('i', { style: `width:${Math.round(p.fraction * 100)}%` })),
      el('p', { class: 'muted', text: nextText }),
      el('div', { class: 'stats' }, stat(q().stats.answered, engine.answered), stat(q().stats.math, math.answered), stat(q().stats.solved, engine.solved.length),
        stat(q().stats.streak, Math.max(engine.dayStreak, math.dayStreak)), stat(q().stats.gear, engine.level)))
  }

  // Builds each button once; a pick only flips aria-pressed so the avatars and photos are not rebuilt.
  function picker(role, key, container, titleId, title) {
    $(titleId).textContent = title
    if (!container.childElementCount) {
      container.replaceChildren(...Mod.roster.filter((p) => p.role === role).map((p) => el('button', {
        class: 'pick', type: 'button', 'data-id': p.id, onclick: () => { App.setPrefs({ [key]: p.id }); render() },
      }, App.avatar(p), el('span', {}, el('b', { text: p.name }), el('small', { text: p.team }), el('small', { class: 'trait', text: p.trait })))))
    }
    for (const button of container.children) button.setAttribute('aria-pressed', String(App.store.prefs[key] === button.dataset.id))
  }

  const DEFAULT_STYLE = { hostStyle: 'strategist', mateStyle: 'hype' }
  function stylePicker(key, container, who) {
    const current = Coach.STYLES.includes(App.store.prefs[key]) ? App.store.prefs[key] : DEFAULT_STYLE[key]
    const sample = [Coach.say(current, 'sessionGood', { correct: 8, answered: 10, pct: 80 }), Coach.say(current, 'weakTopicWhy', { topic: 'NLP', mastery: 45 })]
    container.replaceChildren(
      el('h3', { class: 'pit-sub', text: `Coaching style for your ${who}` }),
      el('div', { class: 'chips', role: 'group', 'aria-label': `Coaching style for your ${who}` }, Coach.STYLES.map((st) => el('button', {
        class: 'chip', type: 'button', 'aria-pressed': String(st === current), onclick: () => { App.setPrefs({ [key]: st }); render() },
      }, `${Coach.STYLE_LABELS[st]}: ${Coach.STYLE_BLURBS[st]}`))),
      el('p', { class: 'bubble', text: sample.join(' ') }))
  }

  function renderSettings() {
    const note = el('p', { class: 'muted', role: 'status' })
    const optOut = el('input', { type: 'checkbox', id: 'optOut', checked: App.store.prefs.optOut })
    optOut.addEventListener('change', () => App.setPrefs({ optOut: optOut.checked }))
    const file = el('input', { type: 'file', accept: 'application/json', hidden: true })
    file.addEventListener('change', async () => {
      try {
        const data = JSON.parse(await file.files[0].text())
        if (!data || !data.engine) throw new Error('shape')
        App.update({ engine: E.restore(data.engine), math: E.restore(data.math) })
        note.textContent = q().restored
        render()
      } catch (e) { note.textContent = q().badFile }
    })
    const download = () => {
      const blob = new Blob([JSON.stringify({ engine: App.store.engine, math: App.store.math, prefs: App.store.prefs }, null, 2)], { type: 'application/json' })
      const link = el('a', { href: URL.createObjectURL(blob), download: 'pit-wall-ml-backup.json' })
      link.click()
      URL.revokeObjectURL(link.href)
    }
    $('settingsCard').replaceChildren(el('h2', { text: q().settings }),
      el('label', { class: 'row' }, optOut, el('span', { text: q().optOut })),
      el('div', { class: 'actions' }, el('button', { class: 'btn secondary', type: 'button', text: q().export, onclick: download }), el('button', { class: 'btn secondary', type: 'button', text: q().import, onclick: () => file.click() }), file),
      el('div', { class: 'actions' }, el('button', { class: 'btn secondary', type: 'button', text: App.TEXT.logout, onclick: App.logout })),
      note, el('p', { class: 'fan-note', text: q().season(Mod.ROSTER_SEASON) }))
  }

  function render() {
    renderRank()
    picker('principal', 'host', $('hostRoster'), 'hostTitle', q().hostTitle)
    picker('driver', 'mate', $('mateRoster'), 'mateTitle', q().mateTitle)
    stylePicker('hostStyle', $('hostStyle'), 'host')
    stylePicker('mateStyle', $('mateStyle'), 'teammate')
    renderSettings()
  }

  async function init() {
    await App.start({ id: 'profile', title: Q.title, back: '/' })
    if (!App.isLoggedIn()) {
      $('auth').hidden = false
      $('auth').replaceChildren(App.authCard(() => { $('auth').hidden = true; $('me').hidden = false; App.renderPit($('pit')); render() }))
      return
    }
    $('me').hidden = false
    render()
  }
  init()
})()
