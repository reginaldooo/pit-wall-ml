// Shared by the browser (app.js) and the Learn build: navigation entries and the sidebar markup.
;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.AppNav = factory()
})(typeof self !== 'undefined' ? self : this, function () {
  const ICONS = {
    home: 'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    learn: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zm4 3h7m-7 4h7',
    quiz: 'M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.8.5-1.1 1-1.1 1.8M12 17.5v.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
    math: 'M5 12h14M12 5v14M6 19l12-14',
    arena: 'M8 7 3 12l5 5m8-10 5 5-5 5M14 4l-4 16',
    board: 'M5 20V10h4v10zm5 0V4h4v16zm5 0v-7h4v7z',
    profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0z',
    search: 'm21 21-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z',
  }
  const NAV = [
    { id: 'home', href: '/', icon: 'home', label: 'Dashboard' },
    { id: 'learn', href: '/learn', icon: 'learn', label: 'Learn' },
    { id: 'quiz', gated: true, href: '/quiz', icon: 'quiz', label: 'Quiz' },
    { id: 'math', gated: true, href: '/math', icon: 'math', label: 'Math' },
    { id: 'arena', gated: true, href: '/arena', icon: 'arena', label: 'Arena' },
    { id: 'leaderboard', gated: true, href: '/leaderboard', icon: 'board', label: 'Leaderboard' },
    { id: 'profile', gated: true, href: '/profile', icon: 'profile', label: 'Profile' },
  ]
  // Keep in sync with scripts/learn-manifest.json (a test compares them).
  const ARTICLES = [["01-machine-learning", "Machine Learning"], ["02-deep-learning", "Deep Learning"], ["03-nlp", "Natural Language Processing"], ["04-pytorch", "PyTorch"], ["05-tensorflow-keras", "TensorFlow and Keras"], ["06-math-formulas", "Math formulas"], ["07-math-priorities", "Math priorities"], ["08-cheat-sheet", "Formula cheat sheet"], ["09-tools-and-implementation", "Tools and implementation"], ["10-mini-projects", "Mini projects"], ["11-roadmap", "Checklist and roadmap"]]
  const BRAND = 'Pit Wall ML'

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${ICONS[name]}"/></svg>`

  // options.articleId: the open Learn article. options.toc: [{ id, text, level }] headings of that article.
  function render(current, options = {}) {
    const { articleId = null, toc = [] } = options
    const links = NAV.map((item) => {
      const aria = item.id === current ? ' aria-current="page"' : ''
      const gated = item.gated ? ' data-gated' : ''
      return `<a class="nav-link" href="${item.href}"${aria}${gated} data-tip="${item.label}">${icon(item.icon)}<span class="label">${item.label}</span></a>`
    }).join('')
    const nested = toc.length > 1
      ? `<ol class="toc">${toc.map((h) => `<li class="toc-l${h.level}"><a href="#${esc(h.id)}">${esc(h.text)}</a></li>`).join('')}</ol>`
      : ''
    const items = ARTICLES.map(([id, title]) => {
      const here = id === articleId
      return `<li><a href="/learn/${id}"${here ? ' aria-current="page"' : ''}>${esc(title)}</a>${here ? nested : ''}</li>`
    }).join('')
    return `<div class="side-head"><a class="brand" href="/" aria-label="${BRAND}"><span class="logo" aria-hidden="true">PW</span><span class="brand-text">${BRAND}</span></a></div>`
      + `<label class="side-search">${icon('search')}<input type="search" placeholder="Search" aria-label="Search pages and articles" autocomplete="off"></label>`
      + `<div class="side-scroll"><nav class="nav-list" aria-label="Main">${links}</nav>`
      + `<details class="nav-group"${articleId || current === 'learn' ? ' open' : ''}><summary>Study notes</summary><ul class="nav-sub">${items}</ul></details></div>`
  }

  return { NAV, ARTICLES, BRAND, ICONS, render }
})
