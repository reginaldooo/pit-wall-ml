/* Picks the data backend. With a Supabase URL + anon key in config.js the app uses Supabase; otherwise a
   local demo backend (localStorage). Exposes window.BackendReady, a promise for window.Backend.

   Backend interface (all async):
     session()                    -> { username } | null
     signUp(username, password)   -> { ok: true, username } | { ok: false, error }
     signIn(username, password)   -> same
     signOut()
     loadProgress()               -> { status: 'ok', progress | null } | { status: 'unauthorized' | 'offline' }
     saveProgress(progress)       -> 'ok' | 'unauthorized' | 'rejected' | 'offline'
     logAttempts(rows)            -> void (best effort)
     loadAttempts(limit = 500)    -> [{ track, item_id, correct, level, at }] newest first ([] when signed out)
     leaderboard()                -> { entries: [{ username, xp }] } | { error }
   Error codes: invalid_username, invalid_password, taken, bad_credentials, confirm_required, network, server_error. */
(function () {
  'use strict'
  const config = window.PWML_CONFIG || {}
  const useSupabase = Boolean(config.supabaseUrl && config.supabaseAnonKey)

  function load(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = resolve
      script.onerror = () => reject(new Error(`Could not load ${src}`))
      document.head.append(script)
    })
  }

  window.BackendReady = (async () => {
    if (useSupabase) {
      await load('/vendor/supabase/supabase.js')
      await load('/backend-supabase.js')
    } else {
      await load('/backend-local.js')
    }
    return window.Backend
  })()
})()
