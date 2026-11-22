// Pit-wall coach: turns the learner's saved state into a debrief, next actions and a readiness check.
// Rule-based and deterministic (no network). The facts come from the engine state; the wording comes from
// one neutral sentence per situation plus a short flavour phrase for the avatar's coaching style.
;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./engine.js'))
  else root.Coach = factory(root.QuizEngine)
})(typeof self !== 'undefined' ? self : this, function (E) {
  const WEAK_BELOW = 0.6
  const MASTERED_FROM = 0.7
  const MIN_RECENT = 10
  const GOOD_ACCURACY = 70
  const GRAND_PRIX_UNLOCK = 20
  const MAX_ACTIONS = 3
  const MAX_DEBRIEF = 4
  const READY_SCORE = 80
  const CLOSE_SCORE = 50
  const MODULE_ARTICLE = {
    m01: ['01-machine-learning', 'Machine Learning'], m02: ['02-deep-learning', 'Deep Learning'], m03: ['03-nlp', 'Natural Language Processing'],
    m04: ['04-pytorch', 'PyTorch'], m05: ['05-tensorflow-keras', 'TensorFlow and Keras'], m06: ['09-tools-and-implementation', 'Tools and implementation'],
    x01: ['06-math-formulas', 'Math formulas'], x02: ['06-math-formulas', 'Math formulas'], x03: ['06-math-formulas', 'Math formulas'],
    x04: ['06-math-formulas', 'Math formulas'], x05: ['06-math-formulas', 'Math formulas'], x06: ['06-math-formulas', 'Math formulas'], x07: ['07-math-priorities', 'Math priorities'],
  }
  const RANK_NAMES = { karting: 'Karting', f4: 'Formula 4', f3: 'Formula 3', f2: 'Formula 2', rookie: 'F1 Rookie', winner: 'Race Winner', champion: 'World Champion' }
  const STYLES = ['strategist', 'hype', 'analyst', 'calm']
  const STYLE_LABELS = { strategist: 'Strategist', hype: 'Hype', analyst: 'Analyst', calm: 'Calm' }
  const STYLE_BLURBS = { strategist: 'Plans and trade-offs', hype: 'Energy and streaks', analyst: 'Numbers and weak spots', calm: 'Steady encouragement' }
  const TONES = ['good', 'neutral', 'tough', 'plan']

  // Short lead-ins per style and tone. Every combination needs at least two so repeats vary.
  const FLAVOR = {
    strategist: { good: ['Plan on track.', 'Good call.', 'Strategy working.'], neutral: ['Reading the race:', 'Position check:', 'Status:'], tough: ['Adjust and go again.', 'Costly stint, fixable.', 'Time to change the plan.'], plan: ['Here is the plan:', 'Next move:', 'Strategy call:'] },
    hype: { good: ["Let's go!", 'Boom!', 'Yes! Keep it flat out!'], neutral: ['Okay, listen up:', 'Quick update:', 'Heads up:'], tough: ['Shake it off!', 'Next lap is ours!', 'We bounce back!'], plan: ['Here is how we win:', 'Game plan:', 'Next up:'] },
    analyst: { good: ['Data says yes.', 'Strong signal.', 'Numbers are up.'], neutral: ['Data check:', 'By the numbers:', 'Readout:'], tough: ['Noted: a dip.', 'The data shows a gap.', 'Variance, not doom.'], plan: ['Highest-impact next step:', 'Recommended:', 'Optimal move:'] },
    calm: { good: ['Nicely done.', 'Steady and strong.', 'That felt smooth.'], neutral: ['Taking stock:', 'A quiet note:', 'Where you are:'], tough: ['That is okay.', 'No rush, learning takes laps.', 'Breathe, then go again.'], plan: ['A gentle next step:', 'When you are ready:', 'Whenever you like:'] },
  }

  // One neutral sentence per situation. {slots} are filled from the facts; a missing slot is an error.
  const CORES = {
    sessionGood: ['good', 'You got {correct} of {answered} right ({pct}%).'],
    sessionOk: ['neutral', 'You got {correct} of {answered} right ({pct}%), a solid base to build on.'],
    sessionTough: ['tough', 'You got {correct} of {answered} right ({pct}%). The explanations are where the points are.'],
    xp: ['neutral', 'You earned {xpGained} XP, {xp} in total. {nextLine}'],
    rankUp: ['good', 'Promotion to {rank}!'],
    gearUp: ['good', 'Gear up to {gear}: harder questions from here.'],
    gearDown: ['tough', 'Gear down to {gear} to rebuild the basics.'],
    misses: ['tough', 'Most misses were in {topic}.'],
    streak: ['good', '{streak} days in a row.'],
    welcomeBack: ['neutral', 'Welcome back after {gap} days. A short lap gets the rhythm back.'],
    lastSession: ['neutral', 'Last time you answered {answered} in {track} and got {correct} right.'],
    newcomer: ['plan', 'No laps yet. Start with a practice session to set your gear.'],
    pointer: ['plan', 'Open Next stint for the plan.'],
    reviewWhy: ['plan', '{count} missed questions are waiting; fixing them first gives the fastest gains.'],
    weakTopicWhy: ['plan', '{topic} is your lowest topic at {mastery}% mastery.'],
    readWhy: ['plan', 'Read {title} before more questions on {topic}.'],
    exploreWhy: ['plan', 'You have not tried {topic} yet, and coverage matters.'],
    arenaWhy: ['plan', '{title} fits your gear and trains implementation, not only recall.'],
    grandPrixWhy: ['plan', 'Your recent accuracy is {pct}%, enough to test yourself for double XP.'],
    streakWhy: ['plan', 'You have a {streak}-day streak; one quick lap keeps it.'],
    newStartWhy: ['plan', 'A practice lap sets your starting gear.'],
    ready: ['good', 'You look ready for a Grand Prix: {okCount} of {total} checks are green.'],
    close: ['neutral', 'Close: {okCount} of {total} checks are green. Fix the red ones first.'],
    early: ['tough', 'Early days: {okCount} of {total} checks are green. Keep stacking laps.'],
    tip: ['plan', 'Tip for {topic}: {tip}'],
  }

  function fill(template, slots) {
    return template.replace(/\{(\w+)\}/g, (_, name) => {
      if (slots[name] === undefined || slots[name] === null) throw new Error(`Missing slot "${name}" in: ${template}`)
      return String(slots[name])
    })
  }

  // style: one of STYLES; kind: a key of CORES; turn rotates the flavour phrase.
  function say(style, kind, slots, turn = 0) {
    const [tone, core] = CORES[kind]
    const phrases = (FLAVOR[style] || FLAVOR.strategist)[tone]
    return `${phrases[turn % phrases.length]} ${fill(core, slots)}`
  }

  // ---------- facts ----------
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : null)

  function topicsOf(store, catalog) {
    return catalog.modules.map((m) => {
      const mastery = (m.track === 'math' ? store.math : store.engine).mastery[m.id]
      return { id: m.id, name: m.name, track: m.track, mastery: mastery === undefined ? null : mastery, touched: mastery !== undefined }
    })
  }

  function dayGap(from, to) {
    if (!from) return null
    return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000)
  }

  // ctx: { today, catalog: { modules: [{ id, name, track }] }, problems: [{ id, tier, title }], visited: [articleId], missed: { quiz, math }, last }
  function snapshot(store, ctx) {
    const { engine, math } = store
    const xp = engine.xp + math.xp
    const progress = E.rankProgress(xp)
    const trail = engine.trail.concat(math.trail).slice(-E.TRAIL_LENGTH)
    const topics = topicsOf(store, ctx.catalog)
    const touched = topics.filter((t) => t.touched).sort((a, b) => a.mastery - b.mastery)
    const solved = new Set(engine.solved)
    const tier = engine.level <= 2 ? 1 : engine.level === 3 ? 2 : 3
    const problems = ctx.problems || []
    const lastDay = [engine.lastDay, math.lastDay].sort().pop()
    const answered = engine.answered + math.answered
    return {
      xp, rank: progress.rank, next: progress.next, xpToNext: progress.next ? progress.next.minXp - xp : 0, fraction: progress.fraction,
      gear: { quiz: engine.level, math: math.level }, answered: { quiz: engine.answered, math: math.answered, total: answered },
      accuracy: { lifetime: pct(engine.correct + math.correct, answered), recent: trail.length ? pct(trail.reduce((s, v) => s + v, 0), trail.length) : null, recentN: trail.length },
      topics, touched, weakest: touched.find((t) => t.mastery < WEAK_BELOW) || null, untouched: topics.filter((t) => !t.touched),
      mastered: touched.filter((t) => t.mastery >= MASTERED_FROM).length,
      backlog: { quiz: (ctx.missed || {}).quiz || 0, math: (ctx.missed || {}).math || 0 },
      run: engine.run, streak: Math.max(engine.dayStreak, math.dayStreak), doneToday: lastDay === ctx.today, gapDays: dayGap(lastDay, ctx.today),
      solved: { total: solved.size, byTier: { 1: problems.filter((p) => p.tier === 1 && solved.has(p.id)).length, 2: problems.filter((p) => p.tier === 2 && solved.has(p.id)).length, 3: problems.filter((p) => p.tier === 3 && solved.has(p.id)).length } },
      nextProblem: problems.find((p) => p.tier <= tier && !solved.has(p.id)) || null,
      visited: ctx.visited || [], last: ctx.last || null, isNew: answered === 0 && solved.size === 0,
    }
  }

  // ---------- mood ----------
  function mood(facts) {
    const last = facts.last
    if (last && last.rankAfter && last.rankBefore && last.rankAfter !== last.rankBefore) return 'celebrating'
    if (last && last.answered >= 5 && pct(last.correct, last.answered) >= 80) return 'celebrating'
    if (facts.run >= 3 || facts.streak >= 3) return 'fired'
    if ((facts.accuracy.recentN >= 5 && facts.accuracy.recent < 50) || facts.backlog.quiz + facts.backlog.math >= 6 || (facts.gapDays !== null && facts.gapDays >= 5)) return 'concerned'
    return 'focused'
  }
  const MOOD_LABELS = { celebrating: 'Celebrating', fired: 'Fired up', concerned: 'Concerned', focused: 'Focused' }

  // ---------- debrief ----------
  const trackName = (t) => (t === 'math' ? 'math drills' : t === 'arena' ? 'the arena' : 'the concept quiz')

  function debrief(facts, style, turn = 0) {
    const out = []
    const add = (kind, slots) => out.push({ kind, text: say(style, kind, slots, turn + out.length) })
    const s = facts.last
    const nextLine = facts.next ? `${facts.xpToNext} XP to ${RANK_NAMES[facts.next.id]}.` : 'You are at the top rank.'
    if (s && s.answered > 0) {
      const p = pct(s.correct, s.answered)
      add(p >= GOOD_ACCURACY ? 'sessionGood' : p >= 40 ? 'sessionOk' : 'sessionTough', { correct: s.correct, answered: s.answered, pct: p })
      add('xp', { xpGained: s.xpGained, xp: facts.xp, nextLine })
      if (s.rankAfter && s.rankBefore && s.rankAfter !== s.rankBefore) add('rankUp', { rank: RANK_NAMES[s.rankAfter] || s.rankAfter })
      if (s.gearAfter > s.gearBefore) add('gearUp', { gear: s.gearAfter })
      else if (s.gearAfter < s.gearBefore) add('gearDown', { gear: s.gearAfter })
      if (s.missedTopics && s.missedTopics.length) add('misses', { topic: s.missedTopics[0] })
    } else if (facts.isNew) {
      add('newcomer', {})
    } else if (facts.gapDays !== null && facts.gapDays >= 3) {
      add('welcomeBack', { gap: facts.gapDays })
    }
    if (facts.streak >= 2 && out.length < MAX_DEBRIEF) add('streak', { streak: facts.streak })
    if (!out.length && s) add('lastSession', { answered: s.answered, track: trackName(s.track), correct: s.correct })
    if (!facts.isNew && !out.length) add('xp', { xpGained: 0, xp: facts.xp, nextLine })
    const kept = out.slice(0, facts.isNew ? MAX_DEBRIEF : MAX_DEBRIEF - 1)
    if (!facts.isNew) kept.push({ kind: 'pointer', text: say(style, 'pointer', {}, turn + kept.length) })
    return kept
  }

  // ---------- next stint ----------
  const topicHref = (t) => `/${t.track === 'math' ? 'math' : 'quiz'}?module=${t.id}`

  function candidates(facts) {
    const list = []
    const total = facts.backlog.quiz + facts.backlog.math
    if (facts.isNew) list.push({ id: 'newStart', priority: 100, label: 'Take your first practice lap', href: '/quiz', slots: {} })
    if (!facts.doneToday && facts.streak > 0) list.push({ id: 'streak', priority: 90, label: 'Keep your streak: one quick lap', href: '/quiz', slots: { streak: facts.streak } })
    if (total >= 3) list.push({ id: 'review', priority: 85, label: `Pit stop: review ${total} mistakes`, href: facts.backlog.quiz >= facts.backlog.math ? '/quiz?mode=review' : '/math?mode=review', slots: { count: total } })
    if (facts.weakest) {
      const w = facts.weakest
      list.push({ id: 'weakTopic', priority: 80, label: `Focus: ${w.name}`, href: topicHref(w), slots: { topic: w.name, mastery: Math.round(w.mastery * 100) } })
      const [article, title] = MODULE_ARTICLE[w.id] || []
      if (article && !facts.visited.includes(article)) list.push({ id: 'read', priority: 75, label: `Read: ${title}`, href: `/learn/${article}`, slots: { title, topic: w.name } })
    }
    if (facts.answered.quiz >= GRAND_PRIX_UNLOCK && facts.accuracy.recent !== null && facts.accuracy.recent >= GOOD_ACCURACY) list.push({ id: 'grandPrix', priority: 70, label: 'Enter a Grand Prix (double XP)', href: '/quiz?mode=boss', slots: { pct: facts.accuracy.recent } })
    if (facts.untouched.length && facts.answered.total >= 5) {
      const t = facts.untouched[0]
      list.push({ id: 'explore', priority: 60, label: `Try a new topic: ${t.name}`, href: topicHref(t), slots: { topic: t.name } })
    }
    if (facts.nextProblem && facts.answered.total >= 10) list.push({ id: 'arena', priority: 55, label: `Arena: ${facts.nextProblem.title}`, href: `/arena#${facts.nextProblem.id}`, slots: { title: facts.nextProblem.title } })
    if (!list.length) list.push({ id: 'newStart', priority: 10, label: 'Take a practice lap', href: '/quiz', slots: {} })
    return list.sort((a, b) => b.priority - a.priority)
  }

  // skip rotates past the first actions ("Not now").
  function nextStint(facts, style, skip = 0, turn = 0) {
    const all = candidates(facts)
    const start = all.length > MAX_ACTIONS ? skip % (all.length - MAX_ACTIONS + 1) : 0
    return all.slice(start, start + MAX_ACTIONS).map((c, i) => ({ id: c.id, label: c.label, href: c.href, why: say(style, `${c.id}Why`, c.slots, turn + i) }))
  }

  // ---------- evaluate ----------
  function evaluate(facts, style, turn = 0) {
    const total = facts.backlog.quiz + facts.backlog.math
    const n = facts.accuracy.recentN
    const touchedCount = facts.touched.length
    const need = Math.ceil(facts.topics.length / 3)
    const checks = [
      { id: 'accuracy', label: `Recent accuracy at least ${GOOD_ACCURACY}%`, ok: n >= MIN_RECENT && facts.accuracy.recent >= GOOD_ACCURACY, detail: n < MIN_RECENT ? `${n}/${MIN_RECENT} answers so far` : `${facts.accuracy.recent}% over the last ${n}` },
      { id: 'coverage', label: `Tried at least ${need} topics`, ok: touchedCount >= need, detail: `${touchedCount}/${facts.topics.length} topics` },
      { id: 'mastery', label: 'Three topics at 70% mastery', ok: facts.mastered >= 3, detail: `${facts.mastered} so far` },
      { id: 'backlog', label: 'Two or fewer mistakes waiting', ok: total <= 2, detail: `${total} waiting` },
      { id: 'arena', label: 'Three Arena cases solved', ok: facts.solved.total >= 3, detail: `${facts.solved.total} solved` },
    ]
    const okCount = checks.filter((c) => c.ok).length
    const score = Math.round((okCount / checks.length) * 100)
    const kind = score >= READY_SCORE ? 'ready' : score >= CLOSE_SCORE ? 'close' : 'early'
    const checkpoint = facts.answered.quiz >= GRAND_PRIX_UNLOCK && kind === 'ready'
      ? { label: 'Prove it in a Grand Prix', href: '/quiz?mode=boss' }
      : { label: facts.answered.total >= MIN_RECENT ? 'Measure yourself in Qualifying' : 'Start with a practice lap', href: facts.answered.total >= MIN_RECENT ? '/quiz?mode=qualifying' : '/quiz' }
    return { checks, score, kind, verdict: say(style, kind, { okCount, total: checks.length }, turn), checkpoint,
      milestone: { label: facts.next ? `${facts.xpToNext} XP to the next rank` : 'Top rank reached', fraction: facts.fraction } }
  }

  // Tip for the avatar tap: about the weakest topic, else a rotating one. tips: { moduleId: [string] }.
  function tip(facts, tips, style, turn = 0) {
    const topic = facts.weakest || facts.touched[0] || facts.topics[turn % facts.topics.length]
    const list = (tips && tips[topic.id]) || []
    if (!list.length) return null
    return say(style, 'tip', { topic: topic.name, tip: list[turn % list.length] }, turn)
  }

  return { RANK_NAMES, STYLES, STYLE_LABELS, STYLE_BLURBS, TONES, FLAVOR, CORES, MOOD_LABELS, MODULE_ARTICLE, fill, say, snapshot, mood, debrief, nextStint, evaluate, tip, candidates }
})
