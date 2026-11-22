/* Pit Wall ML: shared client core. Loaded by every app page.
   Owns: saved progress (localStorage cache + backend sync), attempt log, login form, shell, moderator rail.
   Data goes through window.Backend (Supabase, or the local demo backend); see backend.js. */
(function () {
  'use strict'
  const E = window.QuizEngine
  const Mod = window.Moderators
  const U = window.Usernames
  const STORAGE_KEY = 'pwml.progress.v3'
  const SIGNED_IN_KEY = 'pwml.signedin'
  const SYNC_DELAY_MS = 2000
  const ATTEMPT_BATCH_MAX = 50

  const TEXT = {
    signedIn: (u) => `Signed in as ${u}`, logout: 'Log out', login: 'Log in', signup: 'Sign up', username: 'Username', password: 'Password',
    loginTitle: 'Log in to continue', signupTitle: 'Create an account',
    authIntro: 'Your progress is saved to your account, so you can continue on any device.',
    authNote: 'Username: 3-20 characters (a-z, 0-9, _ -). Password: 8 or more characters. There is no password reset.',
    toSignup: 'Create an account', toLogin: 'I already have an account',
    syncSaved: 'Saved', syncPending: 'Saving...', syncOffline: 'Offline, saved on this device',
    demoMode: 'Demo mode: accounts and progress stay in this browser.',
    errors: {
      invalid_username: 'Username must be 3-20 characters: a-z, 0-9, _ -', invalid_password: 'Password must be 8 to 72 characters.', taken: 'That username is taken.',
      bad_credentials: 'Wrong username or password.', confirm_required: 'The project still requires email confirmation. Turn it off in Supabase Auth settings.',
      server_error: 'Server problem. Try again later.', network: 'Cannot reach the server.',
    },
    gear: 'Gear', xp: 'XP', pitWall: 'Your pit wall', host: 'Host', teammate: 'Teammate',
    fanNote: 'Fan-made roleplay. Lines are generic coaching, not real quotes.',
    rankNames: { karting: 'Karting', f4: 'Formula 4', f3: 'Formula 3', f2: 'Formula 2', rookie: 'F1 Rookie', winner: 'Race Winner', champion: 'World Champion' },
    rankUpToast: (r) => `Promotion: ${r}!`, menu: 'Open menu',
  }

  const store = { engine: E.createState(), math: E.createState(), prefs: { host: Mod.DEFAULTS.host, mate: Mod.DEFAULTS.mate, hostStyle: 'strategist', mateStyle: 'hype', optOut: false }, last: null, owner: null }
  let user = null
  let backend = null
  let canSave = true
  let syncState = 'saved'
  let dirtyVersion = 0
  let syncedVersion = 0
  let syncTimer = null
  let inflight = false
  let authMode = 'login'
  let attemptQueue = []
  const listeners = []

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag)
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value === false || value === null || value === undefined) continue
      if (key === 'class') node.className = value
      else if (key === 'text') node.textContent = value
      else if (key.startsWith('on')) node.addEventListener(key.slice(2), value)
      else node.setAttribute(key, value === true ? '' : value)
    }
    for (const child of children.flat()) if (child !== null && child !== undefined) node.append(child)
    return node
  }

  // Renders text containing $tex$ segments into node, using KaTeX when it is loaded. Never uses innerHTML.
  function texInto(node, text) {
    node.replaceChildren()
    String(text).split(/(\$[^$]+\$)/g).forEach((part) => {
      if (part.length > 2 && part[0] === '$' && part[part.length - 1] === '$') {
        const span = document.createElement('span')
        const tex = part.slice(1, -1)
        if (window.katex) {
          try { window.katex.render(tex, span, { throwOnError: false }) } catch (e) { span.textContent = tex }
        } else span.textContent = tex
        node.append(span)
      } else if (part) node.append(document.createTextNode(part))
    })
    return node
  }

  // ---------- state ----------
  function persistLocal() {
    if (!canSave) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)) } catch (e) { canSave = false }
  }

  function loadLocal() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      if (saved) {
        store.engine = E.restore(saved.engine)
        store.math = E.restore(saved.math)
        store.prefs = { ...store.prefs, ...(saved.prefs || {}) }
        store.last = saved.last && typeof saved.last === 'object' ? saved.last : null
        store.owner = typeof saved.owner === 'string' ? saved.owner : null
      }
    } catch (e) { canSave = false }
  }

  function notify() { listeners.forEach((fn) => fn()) }

  // Tells shell.js (also on the static Learn pages) whether gated links are usable.
  function setSignedIn(on) {
    try { if (on) localStorage.setItem(SIGNED_IN_KEY, '1'); else localStorage.removeItem(SIGNED_IN_KEY) } catch (e) { /* hint only */ }
    if (window.Shell) window.Shell.applyLock()
  }

  function update(patch) {
    Object.assign(store, patch)
    store.owner = user
    persistLocal()
    if (user) markDirty()
    notify()
  }

  // ---------- sync ----------
  function setSync(state) { syncState = state; renderAccount() }
  function markDirty() {
    dirtyVersion += 1
    setSync('pending')
    clearTimeout(syncTimer)
    syncTimer = setTimeout(flushProgress, SYNC_DELAY_MS)
  }

  function logAttempt(row) {
    if (!user) return
    attemptQueue.push({ track: row.track, item_id: String(row.item).slice(0, 40), correct: Boolean(row.correct), level: Math.min(5, Math.max(1, row.level || 1)) })
    if (attemptQueue.length >= ATTEMPT_BATCH_MAX) flushAttempts()
  }
  async function flushAttempts() {
    if (!attemptQueue.length || !backend) return
    const rows = attemptQueue
    attemptQueue = []
    try { await backend.logAttempts(rows) } catch (e) { /* history is best effort */ }
  }

  async function flushProgress() {
    clearTimeout(syncTimer)
    flushAttempts()
    if (!user || inflight || dirtyVersion === syncedVersion) return
    inflight = true
    const version = dirtyVersion
    const result = await backend.saveProgress({ engine: store.engine, math: store.math, prefs: store.prefs, last: store.last })
    inflight = false
    if (result === 'ok') {
      syncedVersion = Math.max(syncedVersion, version)
      if (dirtyVersion !== syncedVersion) { syncTimer = setTimeout(flushProgress, SYNC_DELAY_MS); setSync('pending') } else setSync('saved')
    } else if (result === 'unauthorized') {
      user = null
      setSignedIn(false)
      location.reload()
    } else if (result === 'rejected') {
      syncedVersion = version
      setSync('saved')
    } else setSync('offline')
  }
  window.addEventListener('online', () => { if (user) flushProgress() })
  window.addEventListener('pagehide', () => { flushProgress() })
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushProgress() })

  // A browser copy made before logging in, or by this same user, is kept when it has more answers than the
  // account copy. A copy owned by someone else is ignored.
  function applyAccountProgress(serverProgress) {
    const localTotal = store.engine.count + store.math.count
    const localUsable = (store.owner === null || store.owner === user) && localTotal > 0
    const server = serverProgress && serverProgress.engine ? {
      engine: E.restore(serverProgress.engine), math: E.restore(serverProgress.math), prefs: { ...store.prefs, ...(serverProgress.prefs || {}) },
      last: serverProgress.last && typeof serverProgress.last === 'object' ? serverProgress.last : null,
    } : null
    const serverTotal = server ? server.engine.count + server.math.count : 0
    if (server && !(localUsable && localTotal > serverTotal)) Object.assign(store, server)
    else if (!localUsable) Object.assign(store, { engine: E.createState(), math: E.createState(), last: null })
    store.owner = user
    persistLocal()
    const total = store.engine.count + store.math.count
    if (total > 0 && (!server || total > serverTotal)) { markDirty(); flushProgress() } else { syncedVersion = dirtyVersion; setSync('saved') }
  }

  async function boot() {
    const me = await backend.session()
    if (me) {
      user = me.username
      const result = await backend.loadProgress()
      if (result.status === 'ok') applyAccountProgress(result.progress)
      else if (result.status === 'unauthorized') user = null
      else if (store.owner === user) setSync('offline')
    }
    setSignedIn(Boolean(user))
    return user
  }

  // ---------- login form ----------
  function authCard(onDone) {
    const msg = el('p', { class: 'muted', role: 'alert' })
    const userInput = el('input', { id: 'username', name: 'username', type: 'text', autocomplete: 'username', autocapitalize: 'none', spellcheck: 'false', maxlength: '20', required: true })
    const passInput = el('input', { id: 'password', name: 'password', type: 'password', autocomplete: 'current-password', maxlength: '72', required: true })
    const title = el('h2')
    const note = el('p', { class: 'muted' })
    const submit = el('button', { class: 'btn', type: 'submit' })
    const toggle = el('button', { class: 'btn secondary', type: 'button' })
    function paint() {
      const signup = authMode === 'signup'
      title.textContent = signup ? TEXT.signupTitle : TEXT.loginTitle
      submit.textContent = signup ? TEXT.signup : TEXT.login
      toggle.textContent = signup ? TEXT.toLogin : TEXT.toSignup
      note.textContent = signup ? TEXT.authNote : ''
      passInput.setAttribute('autocomplete', signup ? 'new-password' : 'current-password')
    }
    toggle.addEventListener('click', () => { authMode = authMode === 'signup' ? 'login' : 'signup'; msg.textContent = ''; paint() })
    const form = el('form', { novalidate: true },
      el('label', { class: 'field' }, el('span', { text: TEXT.username }), userInput), el('label', { class: 'field' }, el('span', { text: TEXT.password }), passInput),
      el('div', { class: 'actions' }, submit, toggle), msg, note)
    form.addEventListener('submit', async (event) => {
      event.preventDefault()
      const checked = U.validate({ username: userInput.value, password: passInput.value })
      if (!checked.ok) { msg.textContent = TEXT.errors[checked.error]; return }
      submit.disabled = true
      const result = await (authMode === 'signup' ? backend.signUp : backend.signIn)(checked.username, checked.password)
      submit.disabled = false
      if (!result.ok) { msg.textContent = TEXT.errors[result.error] || TEXT.errors.server_error; return }
      user = result.username
      setSignedIn(true)
      const loaded = await backend.loadProgress()
      applyAccountProgress(loaded.status === 'ok' ? loaded.progress : null)
      renderShell()
      onDone()
    })
    paint()
    const demo = backend.kind === 'local' ? el('p', { class: 'fan-note', text: TEXT.demoMode }) : null
    return el('section', { class: 'card' }, title, el('p', { class: 'muted', text: TEXT.authIntro }), form, demo)
  }

  // ---------- shell ----------
  let page = { id: 'home', title: '', back: null }

  function svgIcon(d) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true')
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', d); svg.append(path)
    return svg
  }

  function totalXp() { return store.engine.xp + store.math.xp }
  function rankChip() {
    const rank = E.rankFor(totalXp())
    return el('span', { class: 'rank-badge', 'data-rank': rank.id, text: `${TEXT.rankNames[rank.id]} · ${totalXp()} ${TEXT.xp}` })
  }

  function renderShell() {
    const side = document.getElementById('sidenav')
    if (side) {
      side.replaceChildren()
      side.insertAdjacentHTML('afterbegin', window.AppNav.render(page.id))
      side.append(el('div', { class: 'nav-foot' }, el('div', { id: 'account', class: 'muted' })))
      const group = side.querySelector('.nav-group')
      if (group && page.id === 'learn') group.open = true
    }
    const head = document.getElementById('pagehead')
    if (head) {
      head.replaceChildren(el('button', { class: 'menu-btn', type: 'button', 'data-nav-toggle': true, 'aria-controls': 'sidenav', 'aria-expanded': 'false', 'aria-label': TEXT.menu }, svgIcon('M4 6h16M4 12h16M4 18h16')))
      if (page.back) head.append(el('a', { class: 'back', href: page.back, 'aria-label': 'Back' }, svgIcon('m15 5-7 7 7 7')))
      head.append(el('p', { class: 'pagehead-title', text: page.title }))
      if (page.xp !== false) head.append(rankChip())
    }
    document.title = `${page.title} | ${window.AppNav.BRAND}`
    if (window.Shell) window.Shell.apply()
    renderAccount()
    notify()
  }

  function renderAccount() {
    const box = document.getElementById('account')
    if (!box) return
    box.replaceChildren()
    if (!user) return
    box.append(el('div', { text: TEXT.signedIn(user) }), el('div', { text: { saved: TEXT.syncSaved, pending: TEXT.syncPending, offline: TEXT.syncOffline }[syncState] }),
      el('button', { class: 'btn secondary small', type: 'button', text: TEXT.logout, onclick: logout }))
  }

  async function logout() {
    await flushProgress()
    await backend.signOut()
    user = null
    setSignedIn(false)
    try { localStorage.removeItem(STORAGE_KEY) } catch (e) { canSave = false }
    location.href = '/'
  }

  // ---------- pit wall (see pit.js) ----------
  function avatar(person) {
    const node = el('span', { class: 'avatar', style: `background:${Mod.color(person)}`, 'aria-hidden': 'true', text: Mod.initials(person) })
    if (person.photo) {
      // The photo covers the initials; if it fails to load it removes itself and the initials show.
      const img = el('img', { src: person.photo, alt: '', width: '48', height: '48', loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer' })
      img.addEventListener('error', () => img.remove())
      node.append(img)
    }
    return node
  }

  const renderPit = (container) => { container.hidden = false; if (window.App.pit) window.App.pit.mount(container) }
  const say = (event, tone) => { if (window.App.pit) window.App.pit.reaction(event, tone) }

  function react(before, after, isCorrect, otherXp = 0) {
    const rankBefore = E.rankFor(before.xp + otherXp).id
    const rankAfter = E.rankFor(after.xp + otherXp).id
    if (rankBefore !== rankAfter && before.xp < after.xp) { say('rankUp', 'hype'); toast(TEXT.rankUpToast(TEXT.rankNames[rankAfter])); return }
    if (after.level > before.level) return say('levelUp', 'hype')
    if (after.level < before.level) return say('levelDown', 'bad')
    if (isCorrect && after.run === 5) return say('streak5', 'hype')
    if (isCorrect && after.run === 3) return say('streak3', 'hype')
    say(isCorrect ? 'correct' : 'wrong', isCorrect ? '' : 'bad')
  }

  function toast(message) {
    const node = el('div', { class: 'toast', role: 'status', text: message })
    document.body.append(node)
    setTimeout(() => node.remove(), 3500)
  }

  async function start(config) {
    page = { id: config.id, title: config.title, back: config.back || null, xp: config.xp }
    loadLocal()
    backend = await window.BackendReady
    await boot()
    renderShell()
    // The coach needs a learner to coach: signed-out visitors do not get a pit wall.
    const pit = document.getElementById('pit')
    if (pit) { if (user) renderPit(pit); else pit.hidden = true }
    return { user }
  }

  window.App = {
    TEXT, el, texInto, store, update, start, authCard, logout, say, react, renderPit, renderShell, toast, flushProgress, logAttempt,
    leaderboard: () => backend.leaderboard(),
    // Flushes the pending attempt queue first so a session that just ended is included.
    loadAttempts: async (limit) => { await flushAttempts(); return user ? backend.loadAttempts(limit) : [] },
    onChange: (fn) => listeners.push(fn), isLoggedIn: () => user !== null, username: () => user, totalXp,
    todayIso: () => new Date().toISOString().slice(0, 10), avatar,
    setPrefs: (prefs) => { update({ prefs: { ...store.prefs, ...prefs } }); const pit = document.getElementById('pit'); if (pit) renderPit(pit) },
  }
})()
