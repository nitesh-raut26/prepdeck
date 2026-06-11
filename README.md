# PrepDeck — Zero to FAANG Learning Path

A deployable learning platform structured as a **thirteen-level roadmap**
(`/roadmap`): computer basics → programming fundamentals → DSA → LLD → HLD →
backend → frontend → databases → cloud & DevOps → AI/ML → career prep —
grounded in a real engineering portfolio
(**LandAI · StockVision · StockStump · Praxivo**) with project deep-dives and
cheat sheets running alongside.

Level 0 (Basics) assumes zero prior knowledge; upper levels reach
SDE2-interview depth. Built as a docs-style study wiki: a section sidebar,
**⌘K full-text search**, **click-to-reveal Q&A flashcards** with self-rating,
**localStorage progress tracking**, syntax-highlighted code, and **Mermaid**
architecture diagrams.

No lesson is read-only — the interactive layer adds:

- **Algorithm visualizers** (`<Visualizer algo="…"/>`): step-through
  players covering every DSA topic — binary search, five sorting
  algorithms, two pointers, sliding window, stack/queue, linked-list
  reversal, BST insert+search, all four tree traversals, min-heap, BFS,
  DFS, Dijkstra, DP table-filling (Fibonacci / coin change / grid paths /
  LCS), backtracking (N-Queens + subsets), hash table with collisions,
  trie, union-find with path compression, greedy activity selection,
  merge intervals, naive-vs-KMP string matching, prefix sums and Fenwick
  trees — with play/pause, step forward/back, scrubbing, speed control,
  editable inputs, per-step narration, live variables and time/space
  complexity badges.
- **Guided problem walkthroughs** (`<ThinkThrough …/>`): the
  [How to Think](src/content/dsa/how-to-think.mdx) lesson teaches the
  clue → pattern decoder and stages the *thinking* behind classic
  problems — each stage locked until you've answered its prompt yourself.
- **Spaced repetition** (`/review`): every flashcard rating schedules the
  card back at 1/3/7/14/30/60/90-day intervals; the topbar badge shows
  what's due, and a retention score tracks recall accuracy. (See
  [ARCHITECTURE.md](ARCHITECTURE.md) for the scheduler design.)
- **Inline quizzes** (`<Quiz questions={…}/>`): MCQs with instant feedback
  and explanations, authored as data in MDX.

## Stack

Next.js 16 (App Router, React 19 RSC) · TypeScript · Tailwind CSS v4 ·
`next-mdx-remote` (MDX) · `gray-matter` · `rehype-highlight` · `fuse.js`
(search) · `mermaid` (diagrams) · deploys to Vercel as static HTML.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (verifies SSG + types)
npm test         # vitest — visualizer step-generators + SRS scheduler
npm start
```

## Add or edit content (no code changes)

Content is plain **MDX** under `src/content/<section>/`. Drop a file in and it
automatically gets a route, a sidebar entry, a search-index record, and
prev/next links.

```md
---
title: "Your Topic"
summary: "One line shown on cards and in search."
order: 3
tags: ["arrays", "interview"]
---

## A heading

Markdown + code fences, plus custom components:

<Callout type="tip" title="Note">Highlighted note.</Callout>

<Mermaid chart={`flowchart LR; A-->B`} />

<QA q="An interview question?">
The answer, revealed on click. Rating it ("Knew it" / "Revise again")
schedules it into the /review spaced-repetition queue.
</QA>

<Visualizer algo="binary-search" />

<Quiz questions={[
  { q: "…?", options: ["a", "b"], answer: 0, explain: "because…" }
]} />
```

Visualizer algos: `binary-search`, `sorting`, `two-pointers`,
`sliding-window`, `stack`, `queue`, `linked-list-reverse`, `bst`,
`tree-traversal`, `heap`, `bfs`, `dfs`, `dijkstra`, `dp`, `n-queens`,
`subsets`, `hash-table`, `trie`, `union-find`, `activity-selection`,
`merge-intervals`, `string-match`, `prefix-sum`, `fenwick`. Multi-variant
players accept `problem` (e.g. `<Visualizer algo="dp" problem="lcs" />`).

Sections live in `src/lib/nav.ts`; the content registry that powers nav/search
is `src/lib/content.ts`. The Level 0–12 roadmap is data in `src/lib/roadmap.ts` —
each topic names a `"section/slug"` doc and links itself automatically once
that MDX file exists (planned topics render dimmed until then).

## Project structure

```
src/
  app/                     # routes: dashboard, roadmap, [section], [section]/[slug]
  components/              # app shell, sidebar, search palette, progress
    mdx/                   # MDX components: QA, Mermaid, Callout, Figure
  lib/                     # nav config, roadmap data + content registry
  content/                 # the MDX study material, by section
    basics/ programming/ dsa/ lld/ hld/ fundamentals/
    projects/ behavioral/ cheatsheets/  (+ backend/ frontend/ databases/
    devops/ aiml/ career/ as those levels land)
```

## Deploy to Vercel

1. Push this folder to a new GitHub repo.
2. Import it at [vercel.com/new](https://vercel.com/new) (Next.js is
   auto-detected — no config needed).
3. Deploy. It builds to static HTML on Vercel's CDN.

Or use the CLI: `npm i -g vercel && vercel`.

## Notes

- Progress is stored in your browser's `localStorage` — private to your device.
- The site is marked `noindex` (it's a personal study tool, not for search
  engines).
