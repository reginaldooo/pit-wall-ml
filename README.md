# Pit Wall ML

Learn machine learning, deep learning and NLP from a set of English study notes, then practise with an adaptive quiz, math drills, Python study cases, and a personal dashboard with an F1-themed coach.

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
npm test           # 120+ tests
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
