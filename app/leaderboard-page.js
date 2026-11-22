/* Leaderboard: top learners by career XP. XP is self-reported by the browser (practice tool, not a ranking). */
(function () {
  'use strict'
  const App = window.App
  const el = App.el
  const Q = { title: 'Leaderboard', head: 'Top learners', intro: 'Career XP across quiz, math and arena. Scores are self-reported, so this is for fun. Opt out on the Profile page.', empty: 'No one on the board yet. Be the first!', error: 'Could not load the leaderboard.', you: 'you' }
  const q = () => Q
  const rankOf = (row) => window.QuizEngine.rankFor(row.xp)
  let entries = null
  let failed = false

  function render() {
    document.getElementById('lbTitle').textContent = q().head
    document.getElementById('lbIntro').textContent = q().intro
    const box = document.getElementById('lbList')
    if (failed) return box.replaceChildren(el('p', { class: 'muted', text: q().error }))
    if (!entries) return box.replaceChildren()
    if (!entries.length) return box.replaceChildren(el('p', { class: 'muted', text: q().empty }))
    const me = App.username()
    box.replaceChildren(...entries.map((row, index) => el('div', { class: 'rank-row' },
      el('span', { class: 'pos', text: String(index + 1) }),
      el('span', {}, el('b', { text: row.username }), row.username === me ? el('small', { class: 'muted', text: ` (${q().you})` }) : null, el('br'), el('span', { class: 'rank-badge', 'data-rank': rankOf(row).id, text: App.TEXT.rankNames[rankOf(row).id] })),
      el('b', { text: `${row.xp} XP` }))))
  }

  async function init() {
    await App.start({ id: 'leaderboard', title: Q.title, back: '/', xp: false })
    if (!App.isLoggedIn()) {
      document.getElementById('lbList').replaceChildren(App.authCard(() => location.reload()))
      document.getElementById('lbTitle').textContent = 'Leaderboard'
      document.getElementById('lbIntro').textContent = 'Log in to see the leaderboard.'
      return
    }
    App.onChange(render)
    render()
    const result = await App.leaderboard()
    if (result.entries) entries = result.entries; else failed = true
    render()
  }
  init()
})()
