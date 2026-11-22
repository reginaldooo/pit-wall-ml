/* Local demo backend: accounts, progress and leaderboard live in this browser's localStorage.
   For development and demos only. Passwords are salted SHA-256 hashes, which is fine for a demo and
   not a substitute for real auth; use the Supabase backend for anything shared. */
(function () {
  'use strict'
  const U = window.Usernames
  const KEY = 'pwml.local.db'
  const SESSION = 'pwml.local.session'

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{"users":{},"progress":{},"attempts":[]}') } catch (e) { return { users: {}, progress: {}, attempts: [] } }
  }
  function write(db) { try { localStorage.setItem(KEY, JSON.stringify(db)) } catch (e) { /* storage full or blocked */ } }
  async function hash(username, password) {
    const bytes = new TextEncoder().encode(`pwml:${username}:${password}`)
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  const current = () => { try { return localStorage.getItem(SESSION) } catch (e) { return null } }

  window.Backend = {
    kind: 'local',
    async session() { const u = current(); return u ? { username: u } : null },
    async signUp(username, password) {
      const db = read()
      if (db.users[username]) return { ok: false, error: 'taken' }
      db.users[username] = await hash(username, password)
      write(db)
      try { localStorage.setItem(SESSION, username) } catch (e) { /* ignore */ }
      return { ok: true, username }
    },
    async signIn(username, password) {
      const db = read()
      if (!db.users[username] || db.users[username] !== await hash(username, password)) return { ok: false, error: 'bad_credentials' }
      try { localStorage.setItem(SESSION, username) } catch (e) { /* ignore */ }
      return { ok: true, username }
    },
    async signOut() { try { localStorage.removeItem(SESSION) } catch (e) { /* ignore */ } },
    async loadProgress() {
      const u = current()
      if (!u) return { status: 'unauthorized' }
      return { status: 'ok', progress: read().progress[u] || null }
    },
    async saveProgress(progress) {
      const u = current()
      if (!u) return 'unauthorized'
      const db = read()
      db.progress[u] = progress
      write(db)
      return 'ok'
    },
    async logAttempts(rows) {
      const u = current()
      if (!u) return
      const db = read()
      db.attempts = [...db.attempts, ...rows.map((r) => ({ ...r, user: u, at: Date.now() }))].slice(-500)
      write(db)
    },
    async loadAttempts(limit = 500) {
      const u = current()
      if (!u) return []
      return read().attempts.filter((r) => r.user === u).sort((a, b) => b.at - a.at).slice(0, limit)
        .map(({ track, item_id, correct, level, at }) => ({ track, item_id, correct, level, at }))
    },
    async leaderboard() {
      const db = read()
      const entries = Object.entries(db.progress)
        .filter(([, p]) => !(p.prefs && p.prefs.optOut))
        .map(([username, p]) => ({ username, xp: ((p.engine && p.engine.xp) || 0) + ((p.math && p.math.xp) || 0) }))
        .sort((a, b) => b.xp - a.xp || a.username.localeCompare(b.username)).slice(0, 20)
      return { entries }
    },
  }
})()
