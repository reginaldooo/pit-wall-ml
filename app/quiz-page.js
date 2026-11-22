/* Quiz page controller for both tracks: concept quiz (data-track="concept") and math drills (data-track="math").
   Modes: Practice (adaptive, one question at a time), Focus (one module), Review (missed questions),
   Qualifying (10 questions on one page with a Submit bar) and Grand Prix (harder set, double XP). */
(function () {
  'use strict'
  const App = window.App
  const E = window.QuizEngine
  const el = App.el
  const isMath = document.body.dataset.track === 'math'
  const DATA = isMath ? window.MATH_DATA : window.QUIZ_DATA
  const BANK = isMath ? DATA.bank : DATA.questions
  const KEY = isMath ? 'math' : 'engine'
  const OTHER = isMath ? 'engine' : 'math'
  const SET_SIZE = 10
  const SET_SECONDS = 600
  const GRAND_PRIX_UNLOCK = 20
  const GRAND_PRIX_MIN_LEVEL = 3
  const $ = (id) => document.getElementById(id)

  const Q = {
      title: isMath ? 'Math drills' : 'Concept quiz',
      startTitle: isMath ? 'Warm up your math' : 'Test your understanding',
      intro: isMath ? 'Numeric drills and concept questions on the math behind ML. Numbers change every time.' : 'Adaptive questions from the notes. Two correct in a row shifts you up a gear, two wrong shifts you down.',
      practice: 'Practice', practiceHelp: 'Adaptive questions, one at a time, with instant feedback.',
      focus: 'Focus on one topic', review: 'Pit stop (review mistakes)', reviewHelp: (n) => `${n} question(s) to review`,
      qualifying: 'Qualifying (10 questions, 10 minutes)', qualifyingHelp: 'All questions on one page, then Submit.',
      grandPrix: 'Grand Prix (double XP)', grandPrixHelp: (n) => (n ? 'Harder set with double XP.' : `Unlocks after ${GRAND_PRIX_UNLOCK} answers.`),
      start: 'Start', reset: 'Reset progress', resetConfirm: 'Erase all progress for this track?',
      resume: (g, n, a, x) => `Gear ${g} · ${n} answered · ${a}% correct · ${x} XP`,
      question: (i, n) => `${i}/${n}`, gear: (g) => `Gear ${g}`, submit: 'Submit', next: 'Next', finish: 'Finish', check: 'Check',
      enterAnswer: 'Enter answer', right: 'Correct', wrong: 'Not quite', answerWas: (a) => `Answer: ${a}`, source: 'Read in the notes',
      sumTitle: 'Session summary', answered: 'Answered', correct: 'Correct', accuracy: 'Accuracy', gearNow: 'Gear', xpGained: 'XP gained',
      topics: 'Topics (weakest first)', toReview: 'Review these sections', again: 'Another session',
      empty: 'No questions available for this mode yet.', left: 'Time left', unanswered: (n) => `${n} unanswered`,
      keyHint: 'Keys: 1-4 select, Enter submits.', score: (c, n) => `${c} of ${n} correct`,
  }
  const q = () => Q
  const state = () => App.store[KEY]
  const otherXp = () => App.store[OTHER].xp

  let session = null
  let current = null
  let answered = false
  let selected = -1
  let shuffled = null
  let timer = null

  const moduleName = (id) => (DATA.modules.find((m) => m.id === id) || { name: id }).name
  const randomSeed = () => Math.floor(Math.random() * 1e9) + 1
  const linkFor = (ref) => { const [a, h] = ref.split('#'); return `/learn/${a}${h ? `#${h}` : ''}` }
  const show = (name) => ['auth', 'start', 'quiz', 'qualify', 'summary'].forEach((id) => { $(id).hidden = id !== name })

  function materialize(item) {
    return item.kind === 'generator' ? window.MATH_DATA.materialize(item, randomSeed()) : item
  }

  function save(next) { App.update({ [KEY]: E.touchDay(next, App.todayIso()) }) }

  // ---------- start screen ----------
  function renderStart() {
    const s = state()
    const grandOk = s.answered >= GRAND_PRIX_UNLOCK
    $('startTitle').textContent = q().startTitle
    $('startIntro').textContent = q().intro
    const modes = [
      ['adaptive', q().practice, q().practiceHelp], ['focus', q().focus, null], ['review', q().review, q().reviewHelp(E.missedCount(s, BANK))],
      ['qualifying', q().qualifying, q().qualifyingHelp], ['boss', q().grandPrix, q().grandPrixHelp(grandOk)],
    ]
    const keep = (document.querySelector('input[name=mode]:checked') || {}).value || 'adaptive'
    const select = el('select', { id: 'moduleSelect', 'aria-label': q().focus }, DATA.modules.map((m) => el('option', { value: m.id, text: `${m.id.slice(1)} · ${m.name}` })))
    $('modes').replaceChildren(...modes.map(([value, label, help]) => el('label', { class: `mode${value === 'boss' && !grandOk ? ' locked' : ''}` },
      el('input', { type: 'radio', name: 'mode', value, checked: value === keep, disabled: value === 'boss' && !grandOk }),
      el('span', {}, el('b', { text: label }), el('br'), value === 'focus' ? select : el('span', { class: 'muted', text: help })))))
    $('resume').hidden = s.answered === 0
    $('resume').textContent = s.answered ? q().resume(s.level, s.answered, E.summarize(s).accuracy, s.xp) : ''
    $('startBtn').textContent = q().start
    $('resetBtn').textContent = q().reset
  }

  function startSession() {
    const mode = document.querySelector('input[name=mode]:checked').value
    const moduleId = mode === 'focus' ? $('moduleSelect').value : null
    session = { mode, moduleId, answered: 0, correct: 0, missed: [], startXp: state().xp, startLevel: state().level, startRank: E.rankFor(App.totalXp()).id }
    if (mode === 'qualifying' || mode === 'boss') return startSet(mode)
    App.say('welcome')
    nextQuestion()
  }

  // ---------- practice (one at a time) ----------
  function nextQuestion() {
    const picked = E.pickQuestion(state(), BANK, { mode: session.mode, module: session.moduleId })
    if (!picked) return finish(q().empty)
    current = materialize(picked)
    answered = false
    selected = -1
    shuffled = current.kind === 'numeric' ? null : E.shuffleOptions(current)
    show('quiz')
    renderQuestion()
  }

  function questionBody(question, sh, count, index) {
    const meta = el('div', { class: 'qmeta' }, el('span', { text: q().question(index, count) }), el('span', { class: 'tag plain', text: `${q().gear(question.level)} · ${moduleName(question.module)}` }))
    const text = App.texInto(el('p', { class: 'question' }), question.q)
    if (question.kind === 'numeric') {
      const input = el('input', { type: 'text', inputmode: 'decimal', class: 'num-input', 'aria-label': q().enterAnswer, placeholder: q().enterAnswer, autocomplete: 'off' })
      return { nodes: [meta, text, input], input }
    }
    const opts = sh.options.map((o, i) => {
      const b = el('button', { type: 'button', class: 'opt', role: 'radio', 'aria-checked': 'false', 'data-index': String(i) }, el('span', { class: 'dot' }), App.texInto(el('span'), o))
      return b
    })
    return { nodes: [meta, text, el('div', { class: 'opts', role: 'radiogroup' }, opts)], opts }
  }

  function renderQuestion() {
    const body = questionBody(current, shuffled, session.answered + 1, session.answered + 1)
    $('qBody').replaceChildren(...body.nodes)
    $('qBody').querySelector('.qmeta span').textContent = `#${session.answered + 1}`
    current.ui = body
    if (body.opts) body.opts.forEach((b) => b.addEventListener('click', () => choose(Number(b.dataset.index))))
    $('feedback').hidden = true
    $('submitBtn').textContent = q().submit
    $('submitBtn').disabled = current.kind !== 'numeric'
    $('nextBtn').hidden = true
    $('finishBtn').textContent = q().finish
    $('keyHint').textContent = q().keyHint
    $('footCount').textContent = `${session.answered} ✓`
    $('footProgress').style.width = '100%'
    if (body.input) body.input.focus()
  }

  function choose(index) {
    if (answered) return
    selected = index
    current.ui.opts.forEach((b, i) => b.setAttribute('aria-checked', String(i === index)))
    $('submitBtn').disabled = false
  }

  function gradeOne(question, sh, pickedIndex, input) {
    if (question.kind === 'numeric') return window.MATH_DATA.isNumericCorrect(question, input)
    return pickedIndex === sh.answer
  }

  function applyOne(question, correct, multiplier = 1) {
    const before = state()
    let next = E.applyAnswer(before, question, correct, { mode: session.mode, bonusXp: question.kind === 'numeric' ? E.MATH_BONUS_XP : 0 })
    if (multiplier > 1) next = { ...next, xp: before.xp + (next.xp - before.xp) * multiplier }
    save(next)
    App.logAttempt({ track: isMath ? 'math' : 'quiz', item: question.id, correct, level: question.level })
    return { before, next }
  }

  function submit() {
    if (answered) return
    const input = current.ui.input ? current.ui.input.value : ''
    if (current.kind === 'numeric' && !input.trim()) return
    if (current.kind !== 'numeric' && selected < 0) return
    answered = true
    const correct = gradeOne(current, shuffled, selected, input)
    const { before, next } = applyOne(current, correct)
    session.answered += 1
    if (correct) session.correct += 1; else session.missed.push(current)
    if (current.ui.opts) current.ui.opts.forEach((b, i) => { b.disabled = true; if (i === shuffled.answer) b.classList.add('right'); else if (i === selected) b.classList.add('wrong') })
    if (current.ui.input) current.ui.input.disabled = true
    showFeedback(current, shuffled, correct)
    App.react(before, next, correct, otherXp())
    App.renderShell()
    $('submitBtn').disabled = true
    $('nextBtn').hidden = false
    $('nextBtn').textContent = q().next
    $('nextBtn').focus()
    $('footCount').textContent = `${session.answered} ✓`
  }

  function showFeedback(question, sh, correct) {
    const box = $('feedback')
    box.className = `feedback ${correct ? 'ok' : 'bad'}`
    const shown = question.kind === 'numeric' ? String(question.answer) : sh.options[sh.answer]
    box.replaceChildren(el('b', { text: correct ? q().right : q().wrong }),
      correct ? null : App.texInto(el('p'), q().answerWas(shown)),
      App.texInto(el('p'), question.explain),
      el('a', { href: linkFor(question.ref), text: q().source }))
    box.hidden = false
  }

  // ---------- qualifying / grand prix (a whole set on one page) ----------
  function pickSet(mode) {
    let temp = { ...state(), recent: [] }
    const chosen = []
    const pool = mode === 'boss' ? BANK.filter((x) => x.level >= Math.min(GRAND_PRIX_MIN_LEVEL, state().level)) : BANK
    for (let i = 0; i < SET_SIZE; i += 1) {
      const picked = E.pickQuestion({ ...temp, boxes: {} }, pool, { mode: 'adaptive' })
      if (!picked) break
      chosen.push(picked)
      temp = { ...temp, recent: [...temp.recent, picked.id] }
    }
    return chosen.map((item) => { const question = materialize(item); return { question, shuffled: question.kind === 'numeric' ? null : E.shuffleOptions(question), selected: -1, input: null, ui: null } })
  }

  function startSet(mode) {
    session.set = pickSet(mode)
    if (!session.set.length) return finish(q().empty)
    session.deadline = Date.now() + SET_SECONDS * 1000
    App.say(mode === 'boss' ? 'boss' : 'welcome')
    show('qualify')
    $('setCards').replaceChildren(...session.set.map((item, index) => {
      const body = questionBody(item.question, item.shuffled, index + 1, index + 1)
      item.ui = body
      body.nodes[0].querySelector('span').textContent = q().question(index + 1, session.set.length)
      if (body.opts) body.opts.forEach((b) => b.addEventListener('click', () => { item.selected = Number(b.dataset.index); body.opts.forEach((x, i) => x.setAttribute('aria-checked', String(i === item.selected))); updateSetBar() }))
      if (body.input) body.input.addEventListener('input', updateSetBar)
      return el('article', { class: 'qcard' }, body.nodes)
    }))
    $('setSubmit').textContent = q().submit
    $('setSubmit').onclick = submitSet
    updateSetBar()
    clearInterval(timer)
    timer = setInterval(tick, 1000)
    tick()
  }

  function answeredInSet() {
    return session.set.filter((item) => (item.question.kind === 'numeric' ? item.ui.input.value.trim() : item.selected >= 0)).length
  }
  function updateSetBar() {
    const n = answeredInSet()
    $('setCount').textContent = `${n}/${session.set.length}`
    $('setProgress').style.width = `${(n / session.set.length) * 100}%`
  }
  function tick() {
    const left = Math.max(0, Math.round((session.deadline - Date.now()) / 1000))
    $('setTimer').textContent = `${q().left} ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`
    if (left === 0) submitSet()
  }

  function submitSet() {
    clearInterval(timer)
    const multiplier = session.mode === 'boss' ? 2 : 1
    const before = state()
    session.set.forEach((item) => {
      const input = item.ui.input ? item.ui.input.value : ''
      const correct = gradeOne(item.question, item.shuffled, item.selected, input)
      applyOne(item.question, correct, multiplier)
      session.answered += 1
      if (correct) session.correct += 1; else session.missed.push(item.question)
    })
    const after = state()
    const ratio = session.correct / session.set.length
    if (E.rankFor(before.xp + otherXp()).id !== E.rankFor(after.xp + otherXp()).id) App.say('rankUp', 'hype')
    else App.say(ratio >= 0.7 ? 'streak3' : 'wrong', ratio >= 0.7 ? 'hype' : 'bad')
    App.renderShell()
    finish(q().score(session.correct, session.set.length))
  }

  // ---------- summary ----------
  function stat(label, value) { return el('div', { class: 'stat' }, el('b', { text: String(value) }), el('span', { class: 'muted', text: label })) }

  function finish(note) {
    clearInterval(timer)
    const s = state()
    const sum = E.summarize(s)
    $('sumTitle').textContent = q().sumTitle
    $('sumNote').textContent = note || ''
    $('sumStats').replaceChildren(stat(q().answered, session.answered), stat(q().correct, session.correct),
      stat(q().accuracy, `${session.answered ? Math.round((session.correct / session.answered) * 100) : 0}%`), stat(q().gearNow, s.level), stat(q().xpGained, `+${s.xp - session.startXp}`))
    $('sumModulesTitle').textContent = q().topics
    $('sumBars').replaceChildren(...DATA.modules.map((m) => ({ m, v: s.mastery[m.id] === undefined ? 0.5 : s.mastery[m.id] })).sort((a, b) => a.v - b.v).map(({ m, v }) =>
      el('div', {}, el('div', { class: 'row' }, el('span', { text: m.name }), el('span', { class: 'muted', text: `${Math.round(v * 100)}%` })), el('div', { class: 'bar' }, el('i', { style: `width:${Math.round(v * 100)}%` })))))
    const refs = [...new Map(session.missed.map((x) => [x.ref.split('#')[0], x])).values()]
    $('sumRefsWrap').hidden = refs.length === 0
    $('sumRefsTitle').textContent = q().toReview
    $('sumRefs').replaceChildren(...refs.map((x) => el('li', {}, el('a', { href: linkFor(x.ref), text: ((window.AppNav.ARTICLES.find(([id]) => id === x.ref.split('#')[0]) || [])[1]) || x.ref.split('#')[0] }))))
    $('againBtn').textContent = q().again
    show('summary')
    recordSession()
    void sum
  }

  // Hands the finished session to the pit wall so the host can debrief it.
  function recordSession() {
    if (!session || session.recorded || session.answered === 0 || !App.pit) return
    session.recorded = true
    const counts = new Map()
    session.missed.forEach((x) => counts.set(x.module, (counts.get(x.module) || 0) + 1))
    const missedTopics = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([id]) => moduleName(id))
    App.pit.record({ track: isMath ? 'math' : 'quiz', mode: session.mode, answered: session.answered, correct: session.correct, xpGained: state().xp - session.startXp,
      gearBefore: session.startLevel, gearAfter: state().level, rankBefore: session.startRank, rankAfter: E.rankFor(App.totalXp()).id, missedTopics })
  }

  function backToStart() { clearInterval(timer); renderStart(); show('start') }

  function onKey(event) {
    if ($('quiz').hidden || event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
      if (!$('quiz').hidden && event.key === 'Enter') { event.preventDefault(); answered ? nextQuestion() : submit() }
      return
    }
    if (event.key >= '1' && event.key <= '4' && !answered && shuffled) choose(Number(event.key) - 1)
    else if (event.key === 'Enter') { event.preventDefault(); answered ? nextQuestion() : submit() }
  }

  function wire() {
    $('startBtn').addEventListener('click', startSession)
    $('resetBtn').addEventListener('click', () => { if (confirm(q().resetConfirm)) { App.update({ [KEY]: E.createState() }); App.renderShell(); renderStart() } })
    $('submitBtn').addEventListener('click', submit)
    $('nextBtn').addEventListener('click', nextQuestion)
    $('finishBtn').addEventListener('click', () => finish(''))
    $('againBtn').addEventListener('click', backToStart)
    document.addEventListener('keydown', onKey)
    App.onChange(() => { if (!$('start').hidden) renderStart() })
  }

  async function init() {
    await App.start({ id: isMath ? 'math' : 'quiz', title: Q.title, back: '/' })
    wire()
    if (!App.isLoggedIn()) {
      show('auth')
      $('auth').replaceChildren(App.authCard(() => { App.renderPit($('pit')); backToStart() }))
      return
    }
    backToStart()
    if (location.hash === '#boss') {
      const boss = document.querySelector('input[name=mode][value=boss]')
      if (boss && !boss.disabled) boss.checked = true
    }
    // Links from the pit wall (?mode=review|qualifying|boss, ?module=m03) open the right mode and start at once.
    const params = new URLSearchParams(location.search)
    const wantedMode = params.get('mode')
    const wanted = params.get('module')
    if (wanted && DATA.modules.some((m) => m.id === wanted)) {
      document.querySelector('input[name=mode][value=focus]').checked = true
      $('moduleSelect').value = wanted
      startSession()
    } else if (['review', 'qualifying', 'boss'].includes(wantedMode)) {
      const radio = document.querySelector(`input[name=mode][value=${wantedMode}]`)
      if (radio && !radio.disabled) { radio.checked = true; startSession() }
    }
  }
  init()
})()
