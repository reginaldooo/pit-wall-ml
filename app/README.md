# Pit Wall ML

A study app built from `../notes/machine_learning_deep_learning_nlp_notes.md` (English). Learn pages, an adaptive five-level quiz, math drills, Python study cases, career XP and ranks, and F1-themed moderators. Static pages on Vercel; accounts and saved progress on Supabase. The layout follows the reference test screen (question cards with a sticky Submit bar, a right-hand rail) with the PlayStation design tokens from `DESIGN-playstation.md`. The navigation sidebar is closed by default and opens from the menu button.

## What is in it

| Area | Page | What it does |
|---|---|---|
| Dashboard | `/` | Personal insight: XP and rank, gear, recent accuracy, streak, topic mastery (weakest first, with 30-day accuracy), today's plan from the coach, Arena progress, mistakes to review, and recent sessions. Logged-out visitors see a login form and a greyed sample. |
| Learn | `/learn` | 11 articles built from the notes (math rendered with KaTeX). One contents panel lists the articles and expands the current one into its headings. Public, no login. |
| Concept quiz | `/quiz` | 74 questions in 6 modules, gears 1-5, adaptive, with review of mistakes. |
| Math drills | `/math` | 35 multiple-choice questions plus 22 numeric generators (dot product, softmax, Bayes, F1, gradient descent...). Numbers change every time. |
| Arena | `/arena` | 12 Python study cases in 3 tiers. Code runs in your browser (Pyodide in a Web Worker, 5 second limit per run) against hidden tests. |
| Leaderboard | `/leaderboard` | Top 20 by career XP. Public; opt out on the Profile page. |
| Profile | `/profile` | Rank progress, choose your moderators, leaderboard opt-out, backup download/restore. |

### Levels, XP, ranks

- **Gear 1-5** per track (concept and math): two correct in a row shifts up, two wrong shifts down; weaker topics are picked more often; missed questions return after 3, 7, then 15 questions.
- **Career XP** (concept + math + arena): a correct answer is `10 x gear` XP, plus 5 for every third correct answer in a row, plus 5 for numeric answers. Arena solves give 50 / 100 / 200 XP (Q1 / Q2 / Q3), minus 10 XP per hint (minimum 10).
- **Ranks:** Karting (0), Formula 4 (100), Formula 3 (400), Formula 2 (1000), F1 Rookie (2200), Race Winner (4500), World Champion (9000). Thresholds are `RANKS` in `engine.js`.
- **Modes:** Practice (adaptive), Focus (one topic), Pit stop (review mistakes), Qualifying (10 questions on one page, 10 minutes, Submit), Grand Prix (harder set, double XP, unlocks after 20 answers in a track).

### Pit wall (coach)

A card with two avatars (host and teammate) and three tabs:

- **Debrief:** comments on what you just did and your XP: the result, XP earned, distance to the next rank, gear and rank changes, your weakest topic from the misses, streak, and a welcome-back after a gap. Recent live reactions are listed underneath.
- **Next stint:** up to three recommended actions as buttons, in priority order: keep your streak, review the mistake backlog, focus on your weakest topic, read the matching article, enter a Grand Prix, try an untouched topic, a fitting Arena case. Each has a "Why?" and "Not now" rotates the list. The links open the right mode and start at once (`/quiz?mode=review|qualifying|boss`, `?module=m03`).
- **Evaluate:** a readiness rubric with five visible checks (recent accuracy, topics tried, topics at 70% mastery, mistakes waiting, Arena cases solved), progress to the next rank, and one checkpoint button (Qualifying, or a Grand Prix when you are ready).

Tap an avatar for a tip about your weakest topic. Each avatar has a **mood** (Focused, Fired up, Concerned, Celebrating) shown as a ring colour, and a **coaching style** you choose on the Profile page: Strategist, Hype, Analyst, or Calm. The host voices the three tabs; the teammate voices live reactions and tips.

How it works: `coach.js` turns your saved state into facts (XP, rank, accuracy over the last 20 answers, topic mastery, mistakes, streak, solved cases) and applies rules; the wording is one neutral sentence per situation plus a short phrase from the avatar's style. It is deterministic and runs in the browser, with no AI service. The readiness rubric is a checklist, not a prediction. Reading suggestions use the articles opened on this device.

Moderators are **fan-made roleplay**: styles are archetypes you choose, not traits of real people; the lines are generic coaching, not quotes; avatars are generated initials and colours (no photos, logos, or team liveries). The roster is the plain data array in `moderators.js` (grid 2026 as known when written); check it against the current grid and edit if it changed.

## Files

| File | Purpose |
|---|---|
| `index.html`, `quiz.html`, `math.html`, `arena.html`, `leaderboard.html`, `profile.html` | Pages (static shell; scripts fill them) |
| `app.js` | Shared client core: saved progress (localStorage cache + backend sync every 2 s), attempt log, login form, shell, moderator rail |
| `shell.js` | Sidebar open/close (closed by default; drawer below 1024px, push layout above) |
| `backend.js`, `backend-supabase.js`, `backend-local.js`, `usernames.js`, `config.js` | Data backend: Supabase when `config.js` has a URL and anon key, otherwise a local demo backend |
| `engine.js` | Gears, picking, review boxes, XP, ranks, daily streak (pure functions) |
| `questions.js`, `bank/m01.js`-`m06.js` | Concept bank (compact rows, `[en, id]` pairs) |
| `math.js`, `bank/math-mcq.js` | Math bank and numeric generators |
| `problems.js` | Arena problems (**generated** by `scripts/build-problems.py`) |
| `runner.worker.js`, `runner-harness.py`, `arena-runner.js` | Python runner: worker, grading harness, main-thread time limit |
| `moderators.js` | Roster and live reaction lines |
| `insights.js`, `home-page.js` | Dashboard maths (sessions from attempts, topic accuracy, activity, mistakes by topic) and the dashboard page |
| `coach.js`, `pit.js`, `bank/tips.js`, `catalog.js` | Pit-wall coach: rules, UI card, study tips, and the topic/problem index (generated by `npm run build:catalog`) |
| `nav.js` | Navigation shared by the pages and the Learn build |
| `supabase/schema.sql` | Tables, Row Level Security, leaderboard function |
| `scripts/` | `build-learn.mjs`, `build-problems.py`, `dev-server.mjs` (static server) |
| `learn/`, `vendor/katex/`, `vendor/supabase/` | Generated Learn pages and KaTeX assets (committed; `vercel --prod` uploads only this folder) |
| `site.css`, `learn.css`, `learn.js` | Design tokens, shell, article styles |
| `tests/` | Node tests |

## Everyday commands

```
npm install
npm run dev            # http://localhost:3000, local demo mode (data stays in the browser)
npm test               # node --test
npm run build:learn    # after editing ../notes/machine_learning_deep_learning_nlp_notes.md or scripts/learn-manifest.json
npm run build:problems # after editing scripts/build-problems.py (needs python3 + numpy)
npm run build:catalog  # after changing topics or Arena problems (the tests fail if catalog.js is stale)
```

`node --test` fails if `learn/` is stale. The Arena tests run every reference solution through the real grading harness with local `python3` + `numpy` (skipped with a message if they are missing).

## Add content

**Concept question:** add a row to the right `bank/mNN.js`:

```js
{ id: 'm02-014', module: 'm02', level: 3, ref: '02-deep-learning#26-optimizer',
  q: ['English question', 'Pertanyaan Indonesia'],
  options: [['right', 'benar'], ['wrong', 'salah'], ['wrong', 'salah'], ['wrong', 'salah']],  // a plain string is shared by both languages
  answer: 0, explain: ['English why', 'Alasan Indonesia'] }
```

`ref` is `<article id>#<heading slug>` and must exist on the Learn pages (the tests check it). Use `$...$` for math. Options are rotated by id and shuffled when shown.

**Numeric generator:** add an object with `gen(rng)` to `generators` in `math.js`. It returns `{ q: [en, id], answer, tolerance?, explain: [en, id] }`; use `int(rng, lo, hi)` for randomness so a seed always replays the same numbers. The tests check determinism, finite answers, and at least 10 distinct questions per generator.

**Arena problem:** add `problem(...)` in `scripts/build-problems.py` with a reference solution and tests (`([args], visible, optional_hand_checked_value)`). The script computes expected outputs from the solution and refuses to build if a hand-checked sample disagrees.

## Setup and deploy (Supabase free plan + Vercel free plan)

1. Create a Supabase project (free plan).
2. Authentication > Providers > Email: turn **off** "Confirm email". Usernames are mapped to a private address (`name@pitwall-ml.app`) that is never emailed, so confirmation would block every sign-up.
3. SQL Editor: paste and run `supabase/schema.sql` (tables `profiles`, `progress`, `attempts`, Row Level Security, `leaderboard()`).
4. Project Settings > API: copy the Project URL and the `anon` public key into `config.js`. Both are public by design; Row Level Security is what protects the data.
5. `vercel` (preview), then `vercel --prod`. The app is static, so there are no serverless functions and no environment variables.

Without values in `config.js` the app runs in **local demo mode**: accounts and progress stay in that browser (useful for trying it out).

What is stored: `progress` (one JSON document per user: gears, mastery, XP, solved cases, moderator picks), `attempts` (the latest 2000 answers and arena runs per user: item id, correct, gear, time), and the username. Each user can read and write only their own rows. The leaderboard function returns only username and XP, and skips users who opted out.

Free-plan notes: Supabase pauses a project after about a week of inactivity (resume it in the dashboard). Anyone can sign up, so watch the 50,000 monthly-active-user and 500 MB database limits; the attempts table is capped per user. There is no password reset (a forgotten password means a new account). Usernames are 3-20 characters of `a-z 0-9 _ -`.

## Things to know

- **Scores are self-reported.** The answer keys are in the browser and the grading runs client-side, so this is a personal practice tool, not a ranking. The database only enforces a size limit and a maximum XP.
- **Pyodide comes from `cdn.jsdelivr.net`** (pinned to v0.26.4 in `runner.worker.js`); that host is the only remote origin in the Content-Security-Policy. A worker script cannot use Subresource Integrity, so for a stricter setup copy the Pyodide files into the app and point `PYODIDE_URL` at them. The first run downloads about 10 MB, then the browser caches it.
- **A run that exceeds 5 seconds is stopped** by terminating the worker; the next run starts a fresh one.
- **Fonts:** the UI uses the system font stack (Inter if installed) at the light display weight from the design notes; no font files are shipped.
- **Dashboard history:** recent sessions and topic accuracy come from the saved attempts (the latest 2000 per user); a new session starts after a 20-minute gap or a track change. XP per session is not stored in attempts, so it appears only in the pit-wall Debrief.
- **Responsive:** see `docs/responsive-audit.md` for what was checked and fixed on phones, tablets and desktops.
- **The notes are in English.** The Indonesian version is kept as `notes/archive/machine_learning_deep_learning_nlp_notes.id.md` and the original pandoc export in `notes/archive/`.
