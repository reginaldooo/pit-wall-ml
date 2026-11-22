# Responsive audit

Method: headless Chrome driven over the DevTools protocol against `npm run dev` (local demo backend), light and dark. Widths 360, 390 (phones), 768, 820 (tablets), 1024, 1280, 1440, 1920 (desktops) on Home, Learn index and two articles, Quiz (practice), Math (practice), Arena (list and a problem), Leaderboard, Profile. Checks per page and width: horizontal page scroll, elements wider than the viewport (outside deliberate scroll areas), interactive elements under 44 x 44 px.

## Found and fixed

| Area | Problem | Fix |
|---|---|---|
| Navigation | Fixed bottom tab bar on phones overlapped the sticky quiz footer; the 76px icon rail on tablets cost width | Replaced both by one sidebar that is closed by default (menu button, drawer below 1024px, push layout above). `shell.js`, `site.css` |
| Moderator | The pit-wall card sat at the very bottom on phones and tablets | Moved to its own grid area: compact strip (avatar + speech bubble) above the content below 1200px, sticky card in the right column above |
| Learn | Two separate side lists (articles on the left, headings on the right) took width and split attention | One "Contents" panel: all articles, the current one expanded into its headings; sticky column on desktop, collapsible block on phones/tablets |
| Math drills | Starting a numeric question threw `template.gen is not a function` (generator templates lost their function in the engine bank) | `materialize` resolves the generator by id; test added |
| Tap targets | Small buttons (36px), filter chips (40px), "more" links, list links and contents links were 24-40px tall | 44px minimum for `.btn.small`, `.chip`, `.more`, list links, contents links |
| Arena | No Tab key on phones, so code could not be indented | Added an Indent button next to the editor |
| Safe areas | Sticky footer ignored the iPhone home indicator | `bottom: env(safe-area-inset-bottom)` on phones |

## Result after fixes
No horizontal page scroll and no overflowing elements at any audited width; no interactive element under 44px except inline links inside article prose (kept at text size on purpose). Re-run: start `npm run dev`, then the audit script from the session (checks listed above) or resize the browser through the same widths.

## Not covered
Real devices (iOS Safari rubber-banding, Android keyboard resizing the Arena editor), landscape phones below 480px height, browser zoom above 200%. The Arena first run downloads about 10 MB of Python runtime, which feels slow on mobile data.
