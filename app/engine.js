(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.QuizEngine = factory()
})(typeof self !== 'undefined' ? self : this, function () {
  const LEVEL_MIN = 1
  const LEVEL_MAX = 5
  const STREAK_TO_MOVE = 2
  const RECENT_BLOCK = 10
  const LEITNER_GAPS = [3, 7, 15]
  const MASTERY_ALPHA = 0.3
  const MASTERY_START = 0.5
  const STATE_VERSION = 3
  const TRAIL_LENGTH = 20
  const XP_PER_LEVEL = 10
  const RUN_BONUS_EVERY = 3
  const RUN_BONUS_XP = 5
  const MATH_BONUS_XP = 5
  const PROBLEM_XP = { 1: 50, 2: 100, 3: 200 }
  const HINT_COST_XP = 10
  const PROBLEM_MIN_XP = 10
  const RANKS = [
    { id: 'karting', minXp: 0 },
    { id: 'f4', minXp: 100 },
    { id: 'f3', minXp: 400 },
    { id: 'f2', minXp: 1000 },
    { id: 'rookie', minXp: 2200 },
    { id: 'winner', minXp: 4500 },
    { id: 'champion', minXp: 9000 },
  ]

  function createState() {
    return {
      version: STATE_VERSION,
      level: LEVEL_MIN,
      streakCorrect: 0,
      streakWrong: 0,
      count: 0,
      answered: 0,
      correct: 0,
      mastery: {},
      boxes: {},
      recent: [],
      seen: [],
      trail: [],
      xp: 0,
      run: 0,
      solved: [],
      dayStreak: 0,
      lastDay: '',
    }
  }

  function clampLevel(level) {
    return Math.min(LEVEL_MAX, Math.max(LEVEL_MIN, level))
  }

  function nextStreakState(state, isCorrect) {
    const streakCorrect = isCorrect ? state.streakCorrect + 1 : 0
    const streakWrong = isCorrect ? 0 : state.streakWrong + 1
    if (streakCorrect >= STREAK_TO_MOVE) {
      return { level: clampLevel(state.level + 1), streakCorrect: 0, streakWrong: 0 }
    }
    if (streakWrong >= STREAK_TO_MOVE) {
      return { level: clampLevel(state.level - 1), streakCorrect: 0, streakWrong: 0 }
    }
    return { level: state.level, streakCorrect, streakWrong }
  }

  function nextMastery(mastery, moduleId, isCorrect) {
    const current = mastery[moduleId] === undefined ? MASTERY_START : mastery[moduleId]
    const target = isCorrect ? 1 : 0
    return { ...mastery, [moduleId]: current + MASTERY_ALPHA * (target - current) }
  }

  // In review mode the learner is working through the missed list on purpose, so one correct
  // answer clears the question. Elsewhere a missed question needs three correct answers, spaced out.
  function nextBoxes(boxes, id, isCorrect, count, clearOnCorrect) {
    const { [id]: existing, ...rest } = boxes
    if (!isCorrect) return { ...rest, [id]: { box: 0, dueAt: count + LEITNER_GAPS[0] } }
    if (!existing) return boxes
    if (clearOnCorrect) return rest
    const box = existing.box + 1
    if (box >= LEITNER_GAPS.length) return rest
    return { ...rest, [id]: { box, dueAt: count + LEITNER_GAPS[box] } }
  }

  function applyAnswer(state, question, isCorrect, options = {}) {
    const count = state.count + 1
    const streak = nextStreakState(state, isCorrect)
    const run = isCorrect ? state.run + 1 : 0
    const gained = isCorrect
      ? XP_PER_LEVEL * question.level + (options.bonusXp || 0) + (run % RUN_BONUS_EVERY === 0 ? RUN_BONUS_XP : 0)
      : 0
    return {
      ...state,
      ...streak,
      run,
      xp: state.xp + gained,
      count,
      answered: state.answered + 1,
      correct: state.correct + (isCorrect ? 1 : 0),
      mastery: nextMastery(state.mastery, question.module, isCorrect),
      boxes: nextBoxes(state.boxes, question.id, isCorrect, count, options.mode === 'review'),
      recent: [...state.recent, question.id].slice(-RECENT_BLOCK),
      trail: [...state.trail, isCorrect ? 1 : 0].slice(-TRAIL_LENGTH),
      seen: state.seen.includes(question.id) ? state.seen : [...state.seen, question.id],
    }
  }

  function rankFor(xp) {
    return RANKS.reduce((best, rank) => (xp >= rank.minXp ? rank : best), RANKS[0])
  }

  function rankProgress(xp) {
    const rank = rankFor(xp)
    const next = RANKS[RANKS.indexOf(rank) + 1] || null
    const fraction = next ? (xp - rank.minXp) / (next.minXp - rank.minXp) : 1
    return { rank, next, fraction }
  }

  function solveProblem(state, problem, { hintsUsed = 0 } = {}) {
    if (state.solved.includes(problem.id)) return state
    const base = PROBLEM_XP[problem.tier] || PROBLEM_XP[1]
    const gained = Math.max(PROBLEM_MIN_XP, base - HINT_COST_XP * hintsUsed)
    return { ...state, xp: state.xp + gained, solved: [...state.solved, problem.id] }
  }

  function dayNumber(iso) {
    return Math.floor(Date.parse(`${iso}T00:00:00Z`) / 86400000)
  }

  function touchDay(state, today) {
    if (state.lastDay === today) return state
    const consecutive = state.lastDay && dayNumber(today) - dayNumber(state.lastDay) === 1
    return { ...state, lastDay: today, dayStreak: consecutive ? state.dayStreak + 1 : 1 }
  }

  function randomIndex(length, rng) {
    return Math.min(length - 1, Math.floor(rng() * length))
  }

  function chooseWeighted(items, weightOf, rng) {
    const weights = items.map(weightOf)
    const total = weights.reduce((sum, w) => sum + w, 0)
    let cursor = rng() * total
    for (let i = 0; i < items.length; i += 1) {
      cursor -= weights[i]
      if (cursor < 0) return items[i]
    }
    return items[items.length - 1]
  }

  function byId(bank) {
    return Object.fromEntries(bank.map((question) => [question.id, question]))
  }

  function dueReview(state, bank, mode, moduleId) {
    const lookup = byId(bank)
    const ids = Object.keys(state.boxes).filter((id) => lookup[id])
    const isEligible = (id) => {
      if (mode === 'review') return true
      if (moduleId && lookup[id].module !== moduleId) return false
      return state.boxes[id].dueAt <= state.count
    }
    const eligible = ids.filter(isEligible)
    const notRecent = eligible.filter((id) => !state.recent.includes(id))
    const usable = notRecent.length || mode !== 'review' ? notRecent : eligible
    usable.sort((a, b) => state.boxes[a].dueAt - state.boxes[b].dueAt)
    return usable.length ? lookup[usable[0]] : null
  }

  function nearestLevelMatch(state, list) {
    for (let distance = 0; distance <= LEVEL_MAX; distance += 1) {
      const levels = distance === 0 ? [state.level] : [state.level - distance, state.level + distance]
      const found = list.filter((question) => levels.includes(question.level))
      if (found.length) return found
    }
    return []
  }

  function levelCandidates(state, pool) {
    const fresh = pool.filter((question) => !state.recent.includes(question.id))
    const unseen = fresh.filter((question) => !state.seen.includes(question.id))
    const preferred = nearestLevelMatch(state, unseen)
    return preferred.length ? preferred : nearestLevelMatch(state, fresh)
  }

  function pickQuestion(state, bank, options = {}) {
    const { mode = 'adaptive', module: moduleId = null, rng = Math.random } = options
    if (mode === 'review') return dueReview(state, bank, 'review', null)
    const pool = moduleId ? bank.filter((question) => question.module === moduleId) : bank
    const due = dueReview(state, pool, mode, moduleId)
    if (due) return due
    const candidates = levelCandidates(state, pool)
    if (!candidates.length) return null
    const modules = [...new Set(candidates.map((question) => question.module))]
    const chosenModule = chooseWeighted(
      modules,
      (id) => 1 + (1 - (state.mastery[id] === undefined ? MASTERY_START : state.mastery[id])),
      rng,
    )
    const inModule = candidates.filter((question) => question.module === chosenModule)
    return inModule[randomIndex(inModule.length, rng)]
  }

  function shuffleOptions(question, rng = Math.random) {
    const order = question.options.map((_, index) => index)
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    return {
      options: order.map((index) => question.options[index]),
      answer: order.indexOf(question.answer),
    }
  }

  function isValidState(value) {
    if (!value || typeof value !== 'object') return false
    const numbers = ['level', 'streakCorrect', 'streakWrong', 'count', 'answered', 'correct']
    if (!numbers.every((key) => Number.isFinite(value[key]))) return false
    if (value.level < LEVEL_MIN || value.level > LEVEL_MAX) return false
    if (!value.mastery || typeof value.mastery !== 'object') return false
    if (!value.boxes || typeof value.boxes !== 'object') return false
    return Array.isArray(value.recent) && Array.isArray(value.seen)
  }

  function restore(saved) {
    if (!isValidState(saved)) return createState()
    const merged = { ...createState(), ...saved, version: STATE_VERSION }
    const count = (value) => (Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0)
    return {
      ...merged,
      xp: count(merged.xp),
      run: count(merged.run),
      dayStreak: count(merged.dayStreak),
      trail: Array.isArray(merged.trail) ? merged.trail.filter((v) => v === 0 || v === 1).slice(-TRAIL_LENGTH) : [],
      solved: Array.isArray(merged.solved) ? merged.solved.filter((id) => typeof id === 'string').slice(0, 200) : [],
      lastDay: /^\d{4}-\d{2}-\d{2}$/.test(merged.lastDay) ? merged.lastDay : '',
    }
  }

  // Missed questions that still exist in the bank (ids of removed questions cannot be answered).
  function missedCount(state, bank) {
    const lookup = byId(bank)
    return Object.keys(state.boxes).filter((id) => lookup[id]).length
  }

  // Drops ids of questions that no longer exist from the saved state.
  function prune(state, bank) {
    const lookup = byId(bank)
    const keep = (id) => Boolean(lookup[id])
    return {
      ...state,
      boxes: Object.fromEntries(Object.entries(state.boxes).filter(([id]) => keep(id))),
      recent: state.recent.filter(keep),
      seen: state.seen.filter(keep),
    }
  }

  function summarize(state) {
    const accuracy = state.answered ? Math.round((state.correct / state.answered) * 100) : 0
    const weakest = Object.entries(state.mastery)
      .map(([module, mastery]) => ({ module, mastery }))
      .sort((a, b) => a.mastery - b.mastery)
    return { answered: state.answered, correct: state.correct, accuracy, level: state.level, weakest }
  }

  return {
    LEVEL_MIN,
    LEVEL_MAX,
    RECENT_BLOCK,
    LEITNER_GAPS,
    RANKS,
    TRAIL_LENGTH,
    PROBLEM_XP,
    PROBLEM_MIN_XP,
    MATH_BONUS_XP,
    rankFor,
    rankProgress,
    solveProblem,
    touchDay,
    createState,
    applyAnswer,
    pickQuestion,
    shuffleOptions,
    restore,
    prune,
    missedCount,
    summarize,
  }
})
