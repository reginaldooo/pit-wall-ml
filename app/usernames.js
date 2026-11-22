// Username rules shared by the login form, both backends and the tests.
// Supabase Auth needs an email, so a username maps to a private, never-mailed address.
;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.Usernames = factory()
})(typeof self !== 'undefined' ? self : this, function () {
  const PATTERN = /^[a-z0-9_-]{3,20}$/
  const PASSWORD_MIN = 8
  const PASSWORD_MAX = 72
  const EMAIL_DOMAIN = 'pitwall-ml.app'

  const normalize = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '')

  function validate(input) {
    const source = input && typeof input === 'object' ? input : {}
    const username = normalize(source.username)
    if (!PATTERN.test(username)) return { ok: false, error: 'invalid_username' }
    const password = source.password
    if (typeof password !== 'string' || password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) return { ok: false, error: 'invalid_password' }
    return { ok: true, username, password }
  }

  const toEmail = (username) => `${username}@${EMAIL_DOMAIN}`
  const fromEmail = (email) => (typeof email === 'string' && email.endsWith(`@${EMAIL_DOMAIN}`) ? email.slice(0, -(EMAIL_DOMAIN.length + 1)) : '')

  return { PATTERN, PASSWORD_MIN, PASSWORD_MAX, EMAIL_DOMAIN, normalize, validate, toEmail, fromEmail }
})
