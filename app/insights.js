// Dashboard maths: turns saved attempts and learner state into the numbers the Home dashboard shows.
// Pure functions, no DOM. Attempt rows look like { track, item_id, correct, level, at } with `at` in milliseconds.
;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.Insights = factory()
})(typeof self !== 'undefined' ? self : this, function () {
  const MINUTE = 60 * 1000
  const DAY = 24 * 60 * MINUTE
  const SESSION_GAP_MINUTES = 20

  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)

  // 'm03-012' -> 'm03', 'x01-g02' -> 'x01'; arena ids and junk -> null.
  function moduleOf(itemId) {
    const match = /^([mx]\d\d)-/.exec(String(itemId || ''))
    return match ? match[1] : null
  }

  // A session is a run of answers on one track with no gap longer than gapMinutes. Newest first.
  function sessionsFrom(rows, gapMinutes = SESSION_GAP_MINUTES) {
    const sorted = [...rows].sort((a, b) => a.at - b.at)
    const sessions = []
    for (const r of sorted) {
      const last = sessions[sessions.length - 1]
      if (last && last.track === r.track && r.at - last.at <= gapMinutes * MINUTE) {
        last.answered += 1
        last.correct += r.correct ? 1 : 0
        last.at = r.at
      } else sessions.push({ track: r.track, at: r.at, answered: 1, correct: r.correct ? 1 : 0 })
    }
    return sessions.map((s) => ({ ...s, accuracy: pct(s.correct, s.answered) })).reverse()
  }

  function topicAccuracy(rows, days = 30, now = Date.now()) {
    const since = now - days * DAY
    const out = {}
    for (const r of rows) {
      const id = moduleOf(r.item_id)
      if (!id || r.at < since) continue
      const t = out[id] || (out[id] = { answered: 0, correct: 0, pct: 0 })
      t.answered += 1
      t.correct += r.correct ? 1 : 0
      t.pct = pct(t.correct, t.answered)
    }
    return out
  }

  // One entry per day, oldest first, for the last `days` days ending on `today` (YYYY-MM-DD, UTC).
  function dailyActivity(rows, today, days = 14) {
    const end = Date.parse(`${today}T00:00:00Z`)
    const list = Array.from({ length: days }, (_, i) => ({ date: new Date(end - (days - 1 - i) * DAY).toISOString().slice(0, 10), answered: 0, correct: 0 }))
    const index = new Map(list.map((d, i) => [d.date, i]))
    for (const r of rows) {
      const i = index.get(new Date(r.at).toISOString().slice(0, 10))
      if (i === undefined) continue
      list[i].answered += 1
      list[i].correct += r.correct ? 1 : 0
    }
    return list
  }

  // Points for a polyline inside a w x h box with padding; the largest value is at the top.
  function sparklinePoints(values, w, h, pad = 2) {
    if (!values.length) return []
    if (values.length === 1) return [[w / 2, h / 2]]
    const max = Math.max(...values)
    const min = Math.min(...values)
    const span = max - min
    return values.map((v, i) => [pad + (i / (values.length - 1)) * (w - 2 * pad), span === 0 ? h / 2 : pad + (1 - (v - min) / span) * (h - 2 * pad)])
  }

  function mistakesByTopic(boxes) {
    const out = {}
    for (const id of Object.keys(boxes || {})) {
      const m = moduleOf(id)
      if (m) out[m] = (out[m] || 0) + 1
    }
    return out
  }

  function arenaByTier(solvedIds, problems) {
    const solved = new Set(solvedIds)
    const out = { 1: { solved: 0, total: 0 }, 2: { solved: 0, total: 0 }, 3: { solved: 0, total: 0 } }
    for (const p of problems) {
      if (!out[p.tier]) continue
      out[p.tier].total += 1
      if (solved.has(p.id)) out[p.tier].solved += 1
    }
    return out
  }

  function relativeTime(at, now = Date.now()) {
    const diff = Math.max(0, now - at)
    if (diff < MINUTE) return 'just now'
    if (diff < 60 * MINUTE) return `${Math.floor(diff / MINUTE)} min ago`
    if (diff < DAY) return `${Math.floor(diff / (60 * MINUTE))} h ago`
    const days = Math.floor(diff / DAY)
    return days === 1 ? 'yesterday' : `${days} days ago`
  }

  return { SESSION_GAP_MINUTES, moduleOf, sessionsFrom, topicAccuracy, dailyActivity, sparklinePoints, mistakesByTopic, arenaByTier, relativeTime }
})
