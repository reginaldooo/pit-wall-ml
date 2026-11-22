// Builds the public Learn pages from the study notes (../notes/machine_learning_deep_learning_nlp_notes.md).
// Run locally before deploying: npm run build:learn. Output (learn/, vendor/katex/) is committed, because
// `vercel --prod` uploads only this folder and the notes live one folder up.
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import MarkdownIt from 'markdown-it'
import katex from 'katex'

const require = createRequire(import.meta.url)
const AppNav = require('../nav.js')

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const WORDS_PER_MINUTE = 200
const FENCE = '```'

// Text that must never appear in a published page.
export const PUBLISHED_FORBIDDEN = [/\/Users\//, /\.env/, /linkedin\.com\/in/i]

export function loadManifest() {
  return JSON.parse(fs.readFileSync(path.join(here, 'learn-manifest.json'), 'utf8'))
}

export function defaultDirs() {
  return { studyDir: path.resolve(root, '..') }
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function slugify(text) {
  return String(text)
    .replace(/[*`_~]/g, (m) => (m === '_' ? '_' : ''))
    .trim().toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '')
    .replace(/\s/g, '-')
}

// ---------- source preparation ----------

function headingOf(line) {
  const m = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line)
  return m ? { level: m[1].length, text: m[2] } : null
}

// Keeps only the H2 sections whose heading starts with one of `titles`. A single-section article
// has its headings promoted one level (the section heading becomes the H1 that is then dropped,
// notes H3 become H2); a multi-section article keeps each section as an H2.
export function extractSections(raw, titles) {
  const wanted = titles.map((t) => t.replace(/^##\s+/, ''))
  const out = []
  let inFence = false
  let keep = false
  for (const line of raw.replace(/\r\n/g, '\n').split('\n')) {
    if (line.startsWith(FENCE)) inFence = !inFence
    const h = inFence ? null : headingOf(line)
    if (h && h.level <= 2) keep = h.level === 2 && wanted.some((t) => h.text.startsWith(t))
    if (!keep) continue
    const promote = wanted.length === 1 && h
    out.push(promote ? `${'#'.repeat(Math.max(1, h.level - 1))} ${h.text}` : line)
  }
  return out.join('\n')
}

// ---------- Markdown + math rendering ----------

const MATH_MARK = ['\uE000', '\uE001']
const CODE_MARK = ['\uE002', '\uE003']

function stash(list, value, [open, close]) {
  list.push(value)
  return `${open}${list.length - 1}${close}`
}

function renderTex(tex, displayMode) {
  return katex.renderToString(tex, { displayMode, throwOnError: true, output: 'htmlAndMathml' })
}

// Math is replaced by placeholders before Markdown runs (so `_` and `*` inside formulas survive),
// then rendered with KaTeX at build time: no math JavaScript is shipped for articles.
export function protectMath(markdown) {
  const code = []
  const math = []
  let text = markdown
    .replace(/```[\s\S]*?```/g, (m) => stash(code, m, CODE_MARK))
    .replace(/`[^`\n]+`/g, (m) => stash(code, m, CODE_MARK))
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => `\n\n${stash(math, renderTex(tex.trim(), true), MATH_MARK)}\n\n`)
  text = text.replace(/\$([^$\n]+?)\$/g, (_, tex) => stash(math, renderTex(tex.trim(), false), MATH_MARK))
  const unstash = (list, [open, close]) => (s) => s.replace(new RegExp(`${open}(\\d+)${close}`, 'g'), (_, i) => list[Number(i)])
  return { text: unstash(code, CODE_MARK)(text), math, restore: unstash(math, MATH_MARK) }
}

function plainText(tokens) {
  return tokens.map((t) => (t.type === 'text' || t.type === 'code_inline' ? t.content : t.children ? plainText(t.children) : '')).join('')
}

export function renderMarkdown(markdown) {
  const md = new MarkdownIt({ html: false, linkify: true, typographer: false, breaks: false })

  md.core.ruler.push('learn_heading_ids', (state) => {
    const seen = new Map()
    const headings = []
    state.tokens.forEach((token, i) => {
      if (token.type !== 'heading_open') return
      const inline = state.tokens[i + 1]
      const text = plainText(inline.children || [])
      const base = slugify(text)
      const count = seen.get(base) || 0
      seen.set(base, count + 1)
      const id = count === 0 ? base : `${base}-${count}`
      token.attrSet('id', id)
      headings.push({ level: Number(token.tag.slice(1)), text, id })
    })
    state.env.headings = headings
  })

  const rules = md.renderer.rules
  rules.link_open = (tokens, idx) => `<a href="${esc(tokens[idx].attrGet('href') || '')}" rel="noopener noreferrer">`
  rules.table_open = () => '<div class="table-wrap" tabindex="0" role="region" aria-label="Table, scroll to see all columns"><table>\n'
  rules.table_close = () => '</table></div>\n'

  const protectedText = protectMath(markdown)
  const env = {}
  const html = protectedText.restore(md.render(protectedText.text, env))
  const headings = (env.headings || []).map((h) => ({ ...h, text: protectedText.restore(h.text).replace(/<[^>]+>/g, '') }))
  return { html, headings }
}

// ---------- page templates ----------

const LABELS = {
  skip: 'Skip to content',
  outline: 'Contents', prev: 'Previous', next: 'Next', prereq: 'Prerequisites',
  estimate: 'Estimate', minutes: 'min read', start: 'Start with 01', practice: 'Practise with the quiz',
  homeTitle: 'Learn the notes',
  homeIntro: 'The study notes, one article per topic: machine learning, deep learning, NLP, frameworks, and the math behind them. Read freely, then test yourself in the quiz, math drills, and the coding arena.',
  footer: 'Personal study notes. Fan-made learning tool.',
  back: 'Learn',
}

function head({ title, description }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<meta name="robots" content="noindex">
<meta name="description" content="${esc(description)}">
<title>${esc(title)}</title>
<link rel="icon" href="data:,">
<link rel="stylesheet" href="/site.css">
<link rel="stylesheet" href="/learn.css">
<link rel="stylesheet" href="/vendor/katex/katex.min.css">
</head>`
}

const MENU_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>'

function shellOpen(titleHtml, withBack, navOptions = {}) {
  const back = withBack ? `<a class="back" href="/learn" aria-label="${LABELS.back}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></a>` : ''
  return `<a class="skip" href="#main">${LABELS.skip}</a>
<div class="app">
  <aside class="sidenav" id="sidenav">${AppNav.render('learn', navOptions)}</aside>
  <div class="content">
    <header class="pagehead" id="pagehead"><button class="menu-btn" type="button" data-nav-toggle aria-controls="sidenav" aria-expanded="false" aria-label="Open menu">${MENU_ICON}</button>${back}<p class="pagehead-title">${titleHtml}</p></header>`
}

const SHELL_CLOSE = `  </div>
</div>
<script src="/nav.js"></script>
<script src="/shell.js"></script>
<script src="/learn.js"></script>
</body>
</html>
`

function pager(prev, next) {
  const link = (a, label, cls) => (a ? `<a class="pager-link ${cls}" href="/learn/${a.id}"><span class="pager-label">${label}</span><span class="pager-title">${esc(a.title)}</span></a>` : '<span></span>')
  return `<nav class="pager" aria-label="${LABELS.prev} / ${LABELS.next}">${link(prev, LABELS.prev, 'prev')}${link(next, LABELS.next, 'next')}</nav>`
}

function articlePage({ manifest, article, body, headings, minutes, prev, next, prereqs }) {
  const prereqHtml = prereqs.length
    ? `<p class="prereq"><strong>${LABELS.prereq}:</strong> ${prereqs.map((p) => `<a href="/learn/${p.id}">${esc(p.title)}</a>`).join(', ')}</p>`
    : ''
  const meta = `<p class="meta"><span>${LABELS.estimate}: ${esc(article.estimate)}</span><span>&#8776; ${minutes} ${LABELS.minutes}</span></p>`
  return `${head({ title: `${article.title} | ${manifest.siteTitle}`, description: article.summary })}
<body class="learn">
${shellOpen(esc(article.title), true, { articleId: article.id, toc: headings.filter((h) => h.level >= 2 && h.level <= (article.tocMaxLevel || 3)) })}
    <div class="shell">
      <main id="main" tabindex="-1">
        <article lang="en">
          <h1>${esc(article.title)}</h1>
          ${meta}
          ${prereqHtml}
          <div class="prose">
${body}
          </div>
        </article>
        ${pager(prev, next)}
        <p class="footnote">${LABELS.footer}</p>
      </main>
    </div>
${SHELL_CLOSE}`
}

function indexPage({ manifest }) {
  const first = manifest.articles[0]
  const byId = new Map(manifest.articles.map((a) => [a.id, a.title]))
  const groups = manifest.groups.map((group) => {
    const cards = manifest.articles.filter((a) => a.group === group.id).map((a) => {
      const prereq = a.prerequisites.length ? `<span>${LABELS.prereq}: ${a.prerequisites.map((id) => esc(byId.get(id))).join(', ')}</span>` : ''
      return `<li class="card"><a class="card-link" href="/learn/${a.id}"><span class="card-title">${esc(a.title)}</span><span class="card-summary">${esc(a.summary)}</span><span class="card-meta"><span>${LABELS.estimate}: ${esc(a.estimate)}</span>${prereq}</span></a></li>`
    })
    return `<section class="group" aria-labelledby="${group.id}"><h2 id="${group.id}">${esc(group.title)}</h2><p class="group-summary">${esc(group.summary)}</p><ul class="cards">${cards.join('')}</ul></section>`
  })
  return `${head({ title: manifest.siteTitle, description: LABELS.homeIntro })}
<body class="learn home">
${shellOpen(LABELS.homeTitle, false)}
    <main id="main" tabindex="-1" class="home-main">
      <section class="hero">
        <h1>${LABELS.homeTitle}</h1>
        <p>${LABELS.homeIntro}</p>
        <p class="hero-actions"><a class="btn" href="/learn/${first.id}">${LABELS.start}</a><a class="btn secondary" href="/quiz" data-gated>${LABELS.practice}</a></p>
      </section>
      ${groups.join('\n      ')}
      <p class="footnote">${LABELS.footer}</p>
    </main>
${SHELL_CLOSE}`
}

// ---------- vendored KaTeX (stylesheet + woff2 fonts only) ----------

function katexVendorFiles() {
  const dist = path.join(root, 'node_modules', 'katex', 'dist')
  const css = fs.readFileSync(path.join(dist, 'katex.min.css'), 'utf8')
    .replace(/,url\([^)]*\.woff\) format\("woff"\)/g, '')
    .replace(/,url\([^)]*\.ttf\) format\("truetype"\)/g, '')
  const files = new Map([['vendor/katex/katex.min.css', css], ['vendor/katex/katex.min.js', fs.readFileSync(path.join(dist, 'katex.min.js'))]])
  for (const name of fs.readdirSync(path.join(dist, 'fonts')).filter((n) => n.endsWith('.woff2'))) {
    files.set(`vendor/katex/fonts/${name}`, fs.readFileSync(path.join(dist, 'fonts', name)))
  }
  return files
}

// ---------- site build ----------

export function buildSite(dirs = defaultDirs()) {
  const manifest = loadManifest()
  const files = new Map()
  const articleAnchors = new Map()
  const reading = []

  for (const article of manifest.articles) {
    const [kind, rel] = article.source.split(/:(.+)/)
    if (kind !== 'study') throw new Error(`Unknown source kind: ${article.source}`)
    const raw = fs.readFileSync(path.resolve(dirs.studyDir, rel), 'utf8')
    const prepared = extractSections(raw, article.sections).replace(/\n---\s*$/, '\n')
    if (!prepared.trim()) throw new Error(`No sections found for ${article.id}`)
    const combined = article.sections.length > 1 ? prepared : prepared.replace(/^#\s+.*\n+/, '')
    const { html, headings } = renderMarkdown(combined)
    const words = combined.replace(/\$\$?[^$]*\$\$?/g, ' ').split(/\s+/).filter(Boolean).length
    reading.push({ article: { ...article, tocMaxLevel: article.sections.length > 1 ? 2 : 3 }, html, headings, minutes: Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)) })
    articleAnchors.set(article.id, new Set(headings.map((h) => h.id)))
  }

  const byId = new Map(manifest.articles.map((a) => [a.id, a]))
  reading.forEach(({ article, html, headings, minutes }, i) => {
    files.set(`learn/${article.id}.html`, articlePage({
      manifest, article, body: html, headings, minutes,
      prev: i > 0 ? reading[i - 1].article : null,
      next: i < reading.length - 1 ? reading[i + 1].article : null,
      prereqs: article.prerequisites.map((id) => byId.get(id)),
    }))
  })
  files.set('learn/index.html', indexPage({ manifest }))
  const anchors = Object.fromEntries([...articleAnchors].map(([id, set]) => [id, [...set]]))
  files.set('learn/anchors.js', `// Generated by scripts/build-learn.mjs. Article ids and their heading anchors.\nwindow.LEARN_ANCHORS = ${JSON.stringify(anchors)};\n`)
  for (const [file, content] of katexVendorFiles()) files.set(file, content)
  return { files, articleAnchors }
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { recursive: true }).map((n) => path.join(dir, n)).filter((f) => fs.statSync(f).isFile())
}

export function writeSite(site, outRoot = root) {
  for (const [file, content] of site.files) {
    fs.mkdirSync(path.dirname(path.join(outRoot, file)), { recursive: true })
    fs.writeFileSync(path.join(outRoot, file), content)
  }
  const keep = new Set([...site.files.keys()].map((f) => path.join(outRoot, f)))
  for (const dir of ['learn', 'vendor/katex']) {
    for (const full of listFiles(path.join(outRoot, dir))) if (!keep.has(full)) fs.rmSync(full)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dirs = defaultDirs()
  const site = buildSite(dirs)
  if (process.argv.includes('--check')) {
    const stale = [...site.files].filter(([file, content]) => {
      const disk = path.join(root, file)
      return !fs.existsSync(disk) || !fs.readFileSync(disk).equals(Buffer.isBuffer(content) ? content : Buffer.from(content))
    }).map(([file]) => file)
    console.log(stale.length ? `Stale: ${stale.join(', ')}` : 'learn/ is up to date')
    process.exit(stale.length ? 1 : 0)
  }
  writeSite(site)
  console.log(`Wrote ${site.files.size} files`)
}
