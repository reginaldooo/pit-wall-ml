import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSite, extractSections, protectMath, loadManifest, PUBLISHED_FORBIDDEN } from '../scripts/build-learn.mjs'

const require = createRequire(import.meta.url)
const AppNav = require('../nav.js')
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const site = buildSite()
const pages = [...site.files].filter(([file]) => file.startsWith('learn/') && file.endsWith('.html'))

test('every manifest article builds a page with an H1 and a non-trivial body', () => {
  const manifest = loadManifest()
  assert.ok(manifest.articles.length >= 10)
  for (const article of manifest.articles) {
    const html = site.files.get(`learn/${article.id}.html`)
    assert.ok(html, article.id)
    assert.match(html, /<h1>/, article.id)
    assert.ok(html.length > 4000, `${article.id} is too short`)
  }
})

test('learn/ on disk is up to date with the notes', () => {
  const stale = [...site.files].filter(([file, content]) => {
    const disk = path.join(root, file)
    return !fs.existsSync(disk) || !fs.readFileSync(disk).equals(Buffer.isBuffer(content) ? content : Buffer.from(content))
  }).map(([file]) => file)
  assert.deepEqual(stale, [], 'run: npm run build:learn')
})

test('published pages contain no forbidden text, raw math delimiters, or KaTeX errors', () => {
  for (const [file, html] of pages) {
    for (const pattern of PUBLISHED_FORBIDDEN) assert.ok(!pattern.test(html), `${file} matches ${pattern}`)
    assert.ok(!html.includes('katex-error'), `${file} has a KaTeX error`)
    assert.ok(!/\$\$/.test(html), `${file} has raw $$`)
    assert.ok(!/[-]/.test(html), `${file} has a leftover placeholder`)
    assert.ok(!html.includes('{=tex}'), `${file} has pandoc residue`)
  }
})

test('prerequisites point to existing articles', () => {
  const manifest = loadManifest()
  const ids = new Set(manifest.articles.map((a) => a.id))
  for (const a of manifest.articles) for (const p of a.prerequisites) assert.ok(ids.has(p), `${a.id} -> ${p}`)
})

test('static shell navigation matches the shared nav list', () => {
  const [, html] = pages.find(([file]) => file === 'learn/01-machine-learning.html')
  for (const item of AppNav.NAV) assert.ok(html.includes(`href="${item.href}"`), item.href)
})

test('extractSections keeps only the requested H2 and promotes its headings', () => {
  const md = '# T\n\n## 1. A\n\ntext a\n\n### 1.1 Sub\n\nx\n\n## 2. B\n\ntext b\n'
  const out = extractSections(md, ['## 1. A'])
  assert.match(out, /^# 1\. A/)
  assert.match(out, /## 1\.1 Sub/)
  assert.ok(!out.includes('text b'))
})

test('protectMath renders formulas and leaves code untouched', () => {
  const { text, restore } = protectMath('inline $a_i+b_i$ and `$not math$`\n\n$$ x^2 $$\n\n```py\nprice = "$5 and $6"\n```')
  const html = restore(text)
  assert.ok(html.includes('class="katex"'))
  assert.ok(html.includes('`$not math$`'))
  assert.ok(html.includes('price = "$5 and $6"'))
})
