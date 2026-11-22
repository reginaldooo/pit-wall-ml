import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8')
const AppNav = require('../nav.js')

const pages = {
  'index.html': ['home-page.js'], 'quiz.html': ['quiz-page.js'], 'math.html': ['quiz-page.js'],
  'arena.html': ['arena-page.js'], 'leaderboard.html': ['leaderboard-page.js'], 'profile.html': ['profile-page.js'],
}

test('every element id used by a page script exists in its HTML', () => {
  for (const [html, scripts] of Object.entries(pages)) {
    const markup = read(html)
    const ids = new Set([...markup.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]))
    for (const script of scripts) {
      const used = new Set([...read(script).matchAll(/\$\('([A-Za-z0-9_-]+)'\)/g)].map((m) => m[1]))
      const created = new Set([...read(script).matchAll(/\bid: '([A-Za-z0-9_-]+)'/g)].map((m) => m[1]))
      for (const id of used) assert.ok(ids.has(id) || created.has(id), `${html}: script ${script} uses #${id} which is missing`)
    }
  }
})

test('every page loads its scripts in a working order and each referenced file exists', () => {
  for (const html of Object.keys(pages)) {
    const markup = read(html)
    const srcs = [...markup.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1])
    for (const src of srcs) assert.ok(fs.existsSync(path.join(root, src)), `${html}: ${src} missing`)
    const order = (name) => srcs.indexOf(name)
    assert.ok(order('/engine.js') < order('/app.js'), `${html}: engine before app`)
    assert.ok(order('/moderators.js') < order('/app.js'), `${html}: moderators before app`)
    assert.ok(order('/nav.js') < order('/app.js'), `${html}: nav before app`)
    assert.ok(order('/usernames.js') < order('/backend.js') && order('/backend.js') < order('/app.js'), `${html}: usernames, backend, then app`)
    assert.ok(order('/config.js') < order('/backend.js'), `${html}: config before backend`)
    assert.ok(order('/shell.js') > -1, `${html}: shell.js missing`)
    const aggregator = Math.max(order('/questions.js'), order('/math.js'))
    if (aggregator > -1) for (const bank of srcs.filter((s) => s.startsWith('/bank/') && s !== '/bank/tips.js')) assert.ok(order(bank) < aggregator, `${html}: ${bank} must load before its aggregator`)
    if (order('/home-page.js') > -1) assert.ok(order('/insights.js') > -1 && order('/insights.js') < order('/home-page.js') && order('/pit.js') < order('/home-page.js'), `${html}: insights and pit before home-page`)
    if (order('/pit.js') > -1) {
      assert.ok(order('/engine.js') < order('/coach.js') && order('/moderators.js') < order('/pit.js'), `${html}: engine, coach, moderators before pit`)
      assert.ok(order('/bank/tips.js') > -1 && order('/catalog.js') > -1 && order('/pit.js') > order('/app.js'), `${html}: tips, catalog, and app before pit`)
    }
  }
})

test('every nav entry points to an existing page', () => {
  for (const item of AppNav.NAV) {
    const file = item.href === '/' ? 'index.html' : item.href === '/learn' ? 'learn/index.html' : `${item.href.slice(1)}.html`
    assert.ok(fs.existsSync(path.join(root, file)), `${item.href} -> ${file}`)
  }
})

test('CSP allows the Arena (Pyodide CDN) and Supabase, and no other remote origin', () => {
  const config = JSON.parse(read('vercel.json'))
  const csp = config.headers[0].headers.find((h) => h.key === 'Content-Security-Policy').value
  assert.match(csp, /script-src[^;]*wasm-unsafe-eval/)
  assert.match(csp, /worker-src[^;]*'self'/)
  assert.match(csp, /connect-src[^;]*https:\/\/cdn\.jsdelivr\.net/)
  assert.match(csp, /connect-src[^;]*https:\/\/\*\.supabase\.co/)
  const hosts = [...csp.matchAll(/https?:\/\/[^\s;]+/g)].map((m) => m[0])
  assert.deepEqual([...new Set(hosts)].sort(), ['https://*.supabase.co', 'https://cdn.jsdelivr.net'])
  assert.match(csp, /frame-ancestors 'none'/)
})

test('the worker and harness are served from the app root', () => {
  assert.match(read('runner.worker.js'), /\/runner-harness\.py/)
  assert.ok(fs.existsSync(path.join(root, 'runner-harness.py')))
  assert.match(read('runner.worker.js'), /pyodide\/v0\.26\.4/)
})

test('sidebar article list matches the Learn manifest', () => {
  const manifest = JSON.parse(read('scripts/learn-manifest.json'))
  assert.deepEqual(AppNav.ARTICLES, manifest.articles.map((a) => [a.id, a.title]))
})

test('stylesheets have balanced braces (a stray brace silently drops the next rule)', () => {
  for (const file of ['site.css', 'learn.css']) {
    let depth = 0
    for (const ch of read(file)) {
      if (ch === '{') depth += 1
      if (ch === '}') depth -= 1
      assert.ok(depth >= 0, `${file}: extra closing brace`)
    }
    assert.equal(depth, 0, `${file}: unclosed brace`)
  }
})

test('gated navigation: only the dashboard and Learn are open to signed-out visitors', () => {
  const open = AppNav.NAV.filter((item) => !item.gated).map((item) => item.id)
  assert.deepEqual(open, ['home', 'learn'])
  const html = AppNav.render('home')
  assert.equal((html.match(/data-gated/g) || []).length, 5)
  assert.ok(!/href="\/learn"[^>]*data-gated/.test(html) && !/href="\/"[^>]*data-gated/.test(html))
})

test('the Learn pages mark their quiz button as gated and load shell.js', () => {
  assert.match(read('learn/index.html'), /href="\/quiz" data-gated/)
  assert.match(read('learn/01-machine-learning.html'), /<script src="\/shell\.js">/)
})
