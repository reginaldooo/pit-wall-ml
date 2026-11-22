/* Arena: study cases in Python. Code runs in a Web Worker (Pyodide) and is graded in the browser. */
(function () {
  'use strict'
  const App = window.App
  const E = window.QuizEngine
  const el = App.el
  const { problems } = window.PROBLEMS
  const $ = (id) => document.getElementById(id)
  const FAILS_TO_UNLOCK_SOLUTION = 3
  const DRAFT_PREFIX = 'pwml.draft.'

  const Q = {
      title: 'Arena', listTitle: 'Study cases', listIntro: 'Write Python, run it against hidden tests, earn XP. Python and NumPy run in your browser; each run is limited to 5 seconds.',
      all: 'All', tier: (n) => ({ 1: 'Q1 · Warm-up', 2: 'Q2 · Midfield', 3: 'Q3 · Pole position' }[n]), tierShort: (n) => `Q${n}`, solved: 'Solved', xp: (n) => `+${n} XP`,
      modules: { ml: 'Machine learning', dl: 'Deep learning', nlp: 'NLP', math: 'Math' },
      code: 'Your code (define solve)', run: 'Run tests', hint: (n, t) => `Hint (-10 XP) ${n}/${t}`, noHints: 'No more hints', reset: 'Reset code', solution: 'Show reference solution',
      loading: 'Loading Python... first run takes a while.', running: 'Running...', timeout: 'Time limit (5 s) exceeded. The run was stopped. Look for a faster approach.',
      failure: (m) => `Runner problem: ${m}`, allPass: 'All tests passed!', somePass: (p, n) => `${p} of ${n} tests passed.`, sample: 'Sample test', hidden: 'Hidden test',
      input: 'Input', expected: 'Expected', got: 'Your output', error: 'Error', printed: 'Printed',
      editorial: 'Editorial', solutionTitle: 'Reference solution', back: 'All study cases', needLogin: 'Log in to track solved cases and earn XP.',
  }
  const q = () => Q
  let tierFilter = 0
  let active = null
  let hintsUsed = 0
  let fails = 0
  let busy = false

  const XP_BY_TIER = E.PROBLEM_XP
  const isSolved = (id) => App.store.engine.solved.includes(id)

  // Small inline formatter for statements: **bold**, `code`, $math$.
  function inline(node, text) {
    text.split(/(\*\*[^*]+\*\*|`[^`]+`|\$[^$]+\$)/g).forEach((part) => {
      if (!part) return
      if (part.startsWith('**')) node.append(el('b', { text: part.slice(2, -2) }))
      else if (part.startsWith('`')) node.append(el('code', { class: 'code-inline', text: part.slice(1, -1) }))
      else if (part.startsWith('$')) node.append(App.texInto(el('span'), part))
      else node.append(document.createTextNode(part))
    })
    return node
  }

  function renderList() {
    $('listTitle').textContent = q().listTitle
    $('listIntro').textContent = q().listIntro
    $('tierFilter').replaceChildren(...[0, 1, 2, 3].map((n) => el('button', { class: 'chip', type: 'button', 'aria-pressed': String(tierFilter === n), text: n === 0 ? q().all : q().tierShort(n), onclick: () => { tierFilter = n; renderList() } })))
    const rows = problems.filter((p) => !tierFilter || p.tier === tierFilter)
    $('problemList').replaceChildren(...rows.map((p) => el('li', {},
      el('div', { class: 'grow' }, el('a', { href: `#${p.id}`, text: p.title }), el('small', { text: `${q().tier(p.tier)} · ${q().modules[p.module] || p.module}` })),
      isSolved(p.id) ? el('span', { class: 'tag', text: q().solved }) : el('span', { class: 'tag plain', text: q().xp(XP_BY_TIER[p.tier]) }))))
  }

  function open(id) {
    const p = problems.find((x) => x.id === id)
    if (!p) return showList()
    active = p
    hintsUsed = 0
    fails = 0
    $('list').hidden = true
    $('work').hidden = false
    window.ArenaRunner.warmUp().catch(() => {})
    let draft = null
    try { draft = localStorage.getItem(DRAFT_PREFIX + p.id) } catch (e) { draft = null }
    $('wCode').value = draft || p.starter
    renderProblem()
    $('results').replaceChildren(); $('hints').replaceChildren(); $('editorial').hidden = true; $('runStatus').textContent = ''
  }

  function showList() {
    active = null
    $('work').hidden = true
    $('list').hidden = false
    renderList()
  }

  function renderProblem() {
    if (!active) return
    const p = active
    $('wTier').textContent = q().tier(p.tier)
    $('wModule').textContent = q().modules[p.module] || p.module
    $('wTitle').textContent = p.title
    $('wStatement').replaceChildren(...p.statement.split(/\n\n/).map((para) => inline(el('p'), para)))
    $('wCodeLabel').textContent = q().code
    $('runBtn').textContent = q().run
    $('resetCodeBtn').textContent = q().reset
    $('solutionBtn').textContent = q().solution
    updateHintButton()
    const unlocked = isSolved(p.id) || fails >= FAILS_TO_UNLOCK_SOLUTION
    $('solutionBtn').hidden = !unlocked
  }

  function updateHintButton() {
    const total = active.hints.length
    $('hintBtn').textContent = hintsUsed >= total ? q().noHints : q().hint(hintsUsed, total)
    $('hintBtn').disabled = hintsUsed >= total
  }

  function showHint() {
    if (hintsUsed >= active.hints.length) return
    App.say('hint')
    $('hints').append(el('div', { class: 'feedback' }, inline(el('p'), active.hints[hintsUsed])))
    hintsUsed += 1
    updateHintButton()
  }

  function renderResults(results) {
    const passed = results.filter((r) => r.ok).length
    const rows = results.map((r, i) => {
      const test = active.tests[i]
      const kids = [el('b', { text: `${r.visible ? q().sample : q().hidden} ${i + 1}: ${r.ok ? '✓' : '✗'}` })]
      if (r.visible) {
        kids.push(el('pre', { text: `${q().input}: ${JSON.stringify(test.args)}` }))
        if (!r.ok && r.expected !== undefined) kids.push(el('pre', { text: `${q().expected}: ${r.expected}\n${q().got}: ${r.got}` }))
        if (r.error) kids.push(el('pre', { text: `${q().error}: ${r.error}` }))
        if (r.stdout) kids.push(el('pre', { text: `${q().printed}: ${r.stdout}` }))
      } else if (r.error) kids.push(el('span', { class: 'muted', text: r.error }))
      return el('div', { class: `test-row ${r.ok ? 'pass' : 'fail'}` }, kids)
    })
    $('results').replaceChildren(el('p', { class: 'row' }, el('b', { text: passed === results.length ? q().allPass : q().somePass(passed, results.length) })), ...rows)
    return passed === results.length
  }

  async function runCode() {
    if (busy || !active) return
    busy = true
    $('runBtn').disabled = true
    const code = $('wCode').value
    try { localStorage.setItem(DRAFT_PREFIX + active.id, code) } catch (e) { /* drafts are a convenience */ }
    $('runStatus').textContent = q().running
    const result = await window.ArenaRunner.run(code, active.tests.map((t) => ({ args: t.args, expected: t.expected, visible: t.visible })))
    busy = false
    $('runBtn').disabled = false
    if (result.status === 'timeout') { $('runStatus').textContent = q().timeout; App.say('timeout', 'bad'); fails += 1; renderProblem(); return }
    if (result.status === 'failure') { $('runStatus').textContent = q().failure(result.message); return }
    $('runStatus').textContent = ''
    const allPass = renderResults(result.results)
    App.logAttempt({ track: 'arena', item: active.id, correct: allPass, level: active.tier })
    if (!allPass) { fails += 1; App.say('failedTests', 'bad'); renderProblem(); return }
    complete()
  }

  function complete() {
    const before = App.store.engine
    const first = !isSolved(active.id)
    const next = E.touchDay(E.solveProblem(before, active, { hintsUsed }), App.todayIso())
    if (first) {
      App.update({ engine: next })
      const rankChanged = E.rankFor(before.xp + App.store.math.xp).id !== E.rankFor(next.xp + App.store.math.xp).id
      App.say(rankChanged ? 'rankUp' : 'solved', 'hype')
      App.renderShell()
    } else App.say('solved', 'hype')
    showEditorial(false)
    renderProblem()
    if (first && App.pit) {
      const after = App.store.engine
      App.pit.record({ track: 'arena', mode: 'solve', answered: 1, correct: 1, xpGained: after.xp - before.xp, gearBefore: before.level, gearAfter: after.level,
        rankBefore: E.rankFor(before.xp + App.store.math.xp).id, rankAfter: E.rankFor(after.xp + App.store.math.xp).id, missedTopics: [] })
    }
  }

  function showEditorial(withSolution) {
    const box = $('editorial')
    box.hidden = false
    box.replaceChildren(el('h2', { class: 'small', text: q().editorial }), inline(el('p'), active.editorial),
      withSolution ? el('div', {}, el('h2', { class: 'small', text: q().solutionTitle }), el('pre', { class: 'test-row', text: active.solution })) : null)
  }

  function wire() {
    $('runBtn').addEventListener('click', runCode)
    $('hintBtn').addEventListener('click', showHint)
    $('indentBtn').addEventListener('click', () => { const area = $('wCode'); area.setRangeText('    ', area.selectionStart, area.selectionEnd, 'end'); area.focus() })
    $('resetCodeBtn').addEventListener('click', () => { $('wCode').value = active.starter })
    $('solutionBtn').addEventListener('click', () => showEditorial(true))
    $('wCode').addEventListener('keydown', (event) => {
      if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault()
        const area = event.target
        const start = area.selectionStart
        area.setRangeText('    ', start, area.selectionEnd, 'end')
      }
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); runCode() }
    })
    window.addEventListener('hashchange', route)
    App.onChange(() => { if (!$('list').hidden) renderList(); else renderProblem() })
  }

  function route() {
    const id = location.hash.slice(1)
    if (id && active && active.id === id) return
    if (id) open(id); else { window.ArenaRunner.stop(); showList() }
  }

  async function init() {
    await App.start({ id: 'arena', title: Q.title, back: '/' })
    wire()
    if (!App.isLoggedIn()) {
      $('auth').hidden = false
      $('auth').replaceChildren(App.authCard(() => { $('auth').hidden = true; App.renderPit($('pit')); route() }))
      return
    }
    route()
  }
  init()
})()
