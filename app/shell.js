/* Sidebar for every page (app pages and generated Learn pages).
   Wide screens: always visible, as a 72px icon rail (default) or an expanded panel; the choice is remembered.
   Narrower screens: hidden until opened, then an overlay drawer that closes on Esc, scrim click, or a link. */
(function () {
  'use strict'
  const KEY = 'pwml.nav'
  const OVERLAY_BELOW = 1024
  const SIGNED_IN_KEY = 'pwml.signedin'
  const LOCK_MESSAGE = 'Log in to use this page.'
  const wide = () => window.innerWidth >= OVERLAY_BELOW
  let open = false
  let scrim = null

  function remembered() {
    try { return wide() && localStorage.getItem(KEY) === 'open' } catch (e) { return false }
  }
  function remember() {
    try { if (wide()) localStorage.setItem(KEY, open ? 'open' : 'closed') } catch (e) { /* optional */ }
  }

  // Pages that need an account (links marked data-gated) are disabled while signed out. This is a UI hint only:
  // the data itself is protected by the backend. app.js keeps the flag in sync after every sign in and out.
  function signedIn() {
    try { return localStorage.getItem(SIGNED_IN_KEY) === '1' } catch (e) { return false }
  }

  function applyLock() {
    const locked = !signedIn()
    document.querySelectorAll('[data-gated]').forEach((node) => {
      if (locked) {
        node.setAttribute('aria-disabled', 'true')
        node.classList.add('is-locked')
        node.setAttribute('title', LOCK_MESSAGE)
      } else {
        node.removeAttribute('aria-disabled')
        node.classList.remove('is-locked')
        node.removeAttribute('title')
      }
    })
  }

  function notify(message) {
    const old = document.querySelector('.toast.lock-toast')
    if (old) old.remove()
    const node = document.createElement('div')
    node.className = 'toast lock-toast'
    node.setAttribute('role', 'status')
    node.textContent = message
    document.body.append(node)
    setTimeout(() => node.remove(), 3000)
  }

  function apply({ focus } = {}) {
    applyLock()
    document.body.dataset.nav = open ? 'open' : 'closed'
    const side = document.getElementById('sidenav')
    if (side) {
      const shown = wide() || open
      side.hidden = !shown
      if (shown) side.removeAttribute('inert'); else side.setAttribute('inert', '')
    }
    document.querySelectorAll('[data-nav-toggle]').forEach((b) => { b.setAttribute('aria-expanded', String(open)); b.setAttribute('aria-label', open ? 'Close menu' : 'Open menu') })
    if (scrim) scrim.hidden = !(open && !wide())
    if (focus && open && !wide() && side) { const first = side.querySelector('a'); if (first) first.focus() }
    if (focus && !open && !wide()) { const btn = document.querySelector('[data-nav-toggle]'); if (btn) btn.focus() }
  }

  function toggle(next) {
    open = typeof next === 'boolean' ? next : !open
    remember()
    apply({ focus: true })
  }

  // Search: hides navigation entries and articles that do not match, and opens the article group while typing.
  function filter(value) {
    const query = value.trim().toLowerCase()
    const side = document.getElementById('sidenav')
    if (!side) return
    side.querySelectorAll('.nav-list .nav-link, .nav-sub > li').forEach((node) => {
      node.hidden = Boolean(query) && !node.textContent.toLowerCase().includes(query)
    })
    const group = side.querySelector('.nav-group')
    if (group && query) group.open = true
  }

  function init() {
    scrim = document.createElement('div')
    scrim.className = 'scrim'
    scrim.hidden = true
    scrim.addEventListener('click', () => toggle(false))
    document.body.append(scrim)
    open = remembered()
    apply()
    document.addEventListener('click', (event) => {
      const gated = event.target.closest('[data-gated]')
      if (gated && gated.classList.contains('is-locked')) { event.preventDefault(); event.stopPropagation(); notify(LOCK_MESSAGE); return }
      if (event.target.closest('[data-nav-toggle]')) { toggle(); return }
      if (open && !wide() && event.target.closest('#sidenav a')) toggle(false)
    })
    document.addEventListener('input', (event) => {
      if (event.target.matches('.side-search input')) filter(event.target.value)
    })
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && open && !wide()) toggle(false) })
    window.addEventListener('resize', () => { const shouldShow = remembered(); if (wide() && open !== shouldShow) { open = shouldShow; apply() } if (scrim) scrim.hidden = !(open && !wide()) })
  }

  window.Shell = { toggle, apply, applyLock, isOpen: () => open }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init()
})()
