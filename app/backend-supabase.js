/* Supabase backend: Auth (username mapped to a private email), progress and attempts tables protected by
   Row Level Security, and the leaderboard() function. See supabase/migrations/20261122000000_schema.sql. */
(function () {
  'use strict'
  const U = window.Usernames
  const { supabaseUrl, supabaseAnonKey } = window.PWML_CONFIG
  const client = window.supabase.createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'pwml.auth' } })

  const isNetwork = (error) => !error || /fetch|network|Failed to/i.test(error.message || '') || error.status === 0

  function authError(error) {
    const text = `${error.message || ''}`.toLowerCase()
    if (/already registered|already exists|database error saving new user|duplicate/.test(text)) return 'taken'
    if (/invalid login credentials/.test(text)) return 'bad_credentials'
    if (/email not confirmed/.test(text)) return 'confirm_required'
    if (/password/.test(text)) return 'invalid_password'
    return /fetch|network/.test(text) ? 'network' : 'server_error'
  }

  async function user() {
    const { data } = await client.auth.getSession()
    return data.session ? { username: (data.session.user.user_metadata || {}).username || U.fromEmail(data.session.user.email) } : null
  }

  window.Backend = {
    kind: 'supabase',
    session: user,
    async signUp(username, password) {
      const { data, error } = await client.auth.signUp({ email: U.toEmail(username), password, options: { data: { username } } })
      if (error) return { ok: false, error: authError(error) }
      if (!data.session) return { ok: false, error: 'confirm_required' }
      return { ok: true, username }
    },
    async signIn(username, password) {
      const { error } = await client.auth.signInWithPassword({ email: U.toEmail(username), password })
      return error ? { ok: false, error: authError(error) } : { ok: true, username }
    },
    async signOut() { await client.auth.signOut() },
    async loadProgress() {
      const me = await user()
      if (!me) return { status: 'unauthorized' }
      const { data, error } = await client.from('progress').select('data').maybeSingle()
      if (error) return { status: error.status === 401 || error.code === 'PGRST301' ? 'unauthorized' : 'offline' }
      return { status: 'ok', progress: data ? data.data : null }
    },
    async saveProgress(progress) {
      const { data: auth } = await client.auth.getSession()
      if (!auth.session) return 'unauthorized'
      const { error } = await client.from('progress').upsert({ user_id: auth.session.user.id, data: progress, updated_at: new Date().toISOString() })
      if (!error) return 'ok'
      if (error.status === 401 || error.code === 'PGRST301') return 'unauthorized'
      if (error.code === '23514' || error.code === '22P02') return 'rejected'
      return isNetwork(error) ? 'offline' : 'rejected'
    },
    async logAttempts(rows) {
      const { data: auth } = await client.auth.getSession()
      if (!auth.session || !rows.length) return
      await client.from('attempts').insert(rows.map((r) => ({ ...r, user_id: auth.session.user.id })))
    },
    async loadAttempts(limit = 500) {
      const { data, error } = await client.from('attempts').select('track,item_id,correct,level,created_at').order('created_at', { ascending: false }).limit(limit)
      if (error || !data) return []
      return data.map((r) => ({ track: r.track, item_id: r.item_id, correct: r.correct, level: r.level, at: Date.parse(r.created_at) }))
    },
    async leaderboard() {
      const { data, error } = await client.rpc('leaderboard')
      return error ? { error: 'server_error' } : { entries: data.map((row) => ({ username: row.username, xp: row.xp })) }
    },
  }
})()
