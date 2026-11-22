# Pit Wall ML

**A free, browser-based study app for machine learning, deep learning and NLP, dressed as a Formula 1 pit wall.**

You read the notes, answer questions that get harder as you improve, solve Python exercises that run in your browser, and earn XP and ranks from Karting up to World Champion. Pick a real-life F1 team principal as your host and a driver as your teammate: they coach you, react to your answers, and each has their own personality and voice.

## What is this?

- **A study path:** 11 Learn articles (with rendered math) built from one set of English notes, so the notes stay the single source of truth.
- **Practice that adapts:** a concept quiz and math drills with five difficulty gears, spaced review of mistakes, timed Qualifying and Grand Prix sets.
- **Hands-on coding:** the Arena has 12 Python study cases, graded in your browser (Pyodide), with no server.
- **A coach, not an AI service:** a rule-based pit wall that debriefs your session, plans your next stint and checks readiness. It is deterministic and runs entirely in the browser.
- **Personalised moderators:** 33 team principals and drivers from the 2026 grid, each with a signature colour, a short trait and original lines written in their public style. Driver photos are loaded from [OpenF1](https://openf1.org); principals show initials. The lines are fan-made roleplay, not real quotes, and nothing here is endorsed by anyone.
- **Accounts and leaderboard:** optional sign-in with Supabase to save progress across devices and appear on a public leaderboard (you can opt out). Without an account service it runs in a local demo mode.

Built as a static site (plain HTML, CSS and JavaScript, no framework or build step for the app itself), hosted on Vercel and Supabase free plans. 125 automated tests run with `npm test`.

## Repository layout

```
.
├── README.md              this file
├── notes/                 the study notes (source of truth for the Learn pages)
│   ├── machine_learning_deep_learning_nlp_notes.md
│   └── archive/           earlier versions (Indonesian, raw export)
└── app/                   the web app (static site, Supabase for accounts and data)
    ├── README.md          features, scoring, setup, deployment, limits
    ├── supabase/          database schema and Row Level Security
    ├── scripts/           Learn page build, problem build, local server
    ├── tests/             node:test suite
    └── ...                pages, scripts, generated Learn pages
```

## Quick start

```bash
cd app
npm install
npm run dev        # http://localhost:3000 (local demo mode, no account service needed)
npm test           # 125 tests
```

Edit `notes/machine_learning_deep_learning_nlp_notes.md`, then `npm run build:learn` (in `app/`) to regenerate the Learn pages.

## Deploy

Static site on Vercel (free plan) with Supabase (free plan) for accounts and saved progress. In Vercel set the **Root Directory to `app`**. Full steps are in [app/README.md](app/README.md#setup-and-deploy-supabase-free-plan--vercel-free-plan).

## What is inside

- **Dashboard:** XP, rank, gear, accuracy, streak, topic mastery, today's plan, Arena progress, mistakes, recent sessions.
- **Learn:** 11 articles from the notes with rendered math.
- **Quiz and Math:** adaptive questions in five gears, review of mistakes, timed Qualifying and Grand Prix sets, numeric generators.
- **Arena:** Python study cases graded in the browser (Pyodide).
- **Pit wall:** a rule-based coach (debrief, next stint, evaluate) with a coaching style per avatar. Fan-made roleplay; no real quotes.
