# PrepDeck — Architecture & Platform Roadmap

PrepDeck's goal is mastery, not content consumption. Every topic should follow:

> Learn → Visualize → Interact → Practice → Build → Get Feedback → Review →
> Interview Simulation → Mastery

This document records where the platform is, how the interactive layer is
built, and the phased path from today's static study wiki to a full
multi-user SaaS.

---

## Phase map

| Phase | Scope | Status |
|---|---|---|
| 0 | Content platform: MDX wiki, 110+ lessons, search, flashcards, progress | ✅ shipped |
| 1 | **Interactive layer**: algorithm visualizers, quizzes, real spaced repetition | ✅ this release |
| 2 | Accounts & sync: Auth.js, PostgreSQL, server-side progress/SRS | planned |
| 3 | Code playground: Monaco + Judge0, test cases, benchmarks | planned |
| 4 | AI tutor: per-page "Ask AI", solution review, generated practice | planned |
| 5 | Interview simulation, gamification, payments | planned |

The guiding constraint: **each phase must be fully usable without the next
one.** Phase 1 runs entirely client-side on a static export — no backend,
no accounts — yet already delivers the core learning loop (visualize →
interact → quiz → spaced review).

---

## Phase 1 — the interactive layer (this release)

### Visualization engine

Architecture rule: **algorithms are pure step generators; React only plays
frames.**

```
src/lib/viz/                      pure TypeScript, fully unit-tested
  types.ts          frame model: ArrayStep / ListStep / TreeStep / GraphStep /
                    DpStep / BoardStep / SubsetStep / HashStep / TrieStep /
                    UfStep / IntervalStep / MatchStep, semantic Tones
  array-algos.ts    binary search · bubble/selection/insertion/quick/merge
                    sort · two pointers · sliding window
  structure-algos.ts stack · queue · linked-list reversal · BST · traversals
                    (in/pre/post/level-order) · min-heap
  graph-algos.ts    BFS · DFS · Dijkstra (+ preset graphs)
  dp-algos.ts       Fibonacci · coin change · grid paths · LCS · prefix
                    sums · Fenwick tree (all share the DP-table canvas)
  backtracking-algos.ts  N-Queens (first solution, with pruning) · subsets
  hash-algos.ts     chained hash table: insert, collide, look up
  trie-algos.ts     insert words, shared prefixes, word-vs-prefix lookup
  uf-algos.ts       union/find with path compression (scriptable ops)
  interval-algos.ts greedy activity selection · merge intervals
  match-algos.ts    naive substring search · KMP (failure table + scan)

src/components/viz/               client components
  stepper.ts        useStepper(): play/pause/step/scrub/speed state machine
  player.tsx        shared chrome: complexity badges, narration, variables,
                    transport controls, input editors
  tones.ts          Tone → Tailwind/SVG colour mapping (one place)
  *-canvas.tsx      renderers: array cells, stack/queue boxes, linked-list
                    SVG, tree/heap SVG, graph SVG with aux queue + dist table
  visualizer.tsx    <Visualizer algo="…"/> — the only MDX-facing entry point
```

Why this shape:

- **Generators emit `Step[]`, not animations.** A step is a complete
  snapshot (values + tones + pointers + a narration sentence + live
  variables). That makes stepping *backwards* free, makes the generators
  trivially testable (34 unit tests), and keeps every future algorithm a
  ~50-line pure function.
- **Tones are semantic** (`active`, `good`, `bad`, `muted`, `accent`), so
  the colour system lives in one file and every visualizer is consistent.
- **Inputs are data.** Changing the array/target/start-node re-runs the
  generator and rewinds the player; nothing is hard-coded into frames.

Adding a new visualizer = one generator function + (usually) zero new
renderers + one `<Visualizer algo="…"/>` line in MDX.

### Spaced repetition

`src/lib/srs.ts` is a pure Leitner scheduler over the intervals
**1 / 3 / 7 / 14 / 30 / 60 / 90 days**:

- "Knew it" promotes a card one box; "Revise again" demotes to box 0 and
  re-queues it within minutes (same-session retry).
- Every `<QA>` block in the content (~400 cards) is extracted at build time
  (`getFlashcards()` in `src/lib/content.ts`) and reviewable at `/review`.
- Storage is `localStorage` v2 (`prepdeck.progress.v2`) with automatic
  migration from v1; per-card we keep `{status, box, due, seen, correct}`,
  which yields a **retention score** (recall accuracy) for the dashboard.
- The topbar shows a live due-count badge.

This module is deliberately storage-agnostic: Phase 2 swaps localStorage
for a `card_reviews` table without touching the scheduler.

### Quizzes

`<Quiz questions={[…]}/>` renders inline MCQs with instant feedback,
explanations, and a score summary — authored directly in MDX as data.

### Guided walkthroughs (the "how to think" layer)

`<ThinkThrough …/>` stages the reasoning behind a problem (restate → spot
the pattern → brute force → template → cost) with each stage locked behind
the question the reader should answer themselves first. The decoder table
in `dsa/how-to-think.mdx` maps problem-statement phrases to patterns;
`cheatsheets/jargon-decoder.mdx` translates every technical term to plain
English. Together these implement the "no jargon, teach the thinking"
principle; every DSA lesson now has at least one interactive element.

---

## Phase 2 — accounts & sync (design)

**Backend choice:** Next.js Route Handlers + server actions on Vercel,
PostgreSQL (Neon/RDS) via Drizzle ORM, Redis (Upstash) for sessions/queues.
A separate NestJS service is *not* warranted until code execution lands;
keeping one deployable unit preserves velocity.

Schema sketch (the SRS tables mirror today's client shapes 1:1):

```sql
users          (id, email, name, image, created_at)
doc_progress   (user_id, doc_href, status reviewed|mastered, updated_at,
                primary key (user_id, doc_href))
card_reviews   (user_id, card_id, box int, due timestamptz,
                seen int, correct int, status, updated_at,
                primary key (user_id, card_id))
review_events  (id, user_id, card_id, rating, rated_at)   -- retention analytics
quiz_attempts  (id, user_id, quiz_id, score, total, taken_at)
```

API design: `GET/PUT /api/progress` (bulk sync, last-write-wins per key),
`POST /api/reviews` (append-only rating events). The client keeps
localStorage as the offline cache and reconciles on login — the Phase 1
data model was chosen so this merge is a per-key timestamp comparison.

## Phase 3 — code playground

Monaco editor MDX component + Judge0 (self-hosted on AWS, queued through
Redis) for C++/Java/Python/JS/TS/Go. Per-lesson test cases live next to the
MDX. Rate-limit by user; cache identical submissions by content hash.

## Phase 4 — AI tutor

Per-page "Ask AI" panel: lesson MDX is already plain text at build time, so
the page body becomes the system context. Anthropic/OpenAI behind a thin
`/api/ai` route with streaming; presets ("explain like I'm 10", "harder
example", "review my solution") are prompt templates over the same route.

## Phase 5 — interview simulation & gamification

AI interviewer sessions (DSA/LLD/HLD/behavioral) scored against rubrics;
XP/streaks/levels derived from `review_events` + `quiz_attempts` — the
event tables exist from Phase 2 precisely so gamification is a read model,
not new write paths.

---

## Engineering conventions

- Content is data: dropping an `.mdx` file creates the route, nav, search
  record, and flashcards. Sections live in `src/lib/nav.ts`.
- Server/client split: `src/lib/content.ts` is Node-only (build time);
  everything under `src/components/` that touches state is `"use client"`.
- Pure logic (`src/lib/srs.ts`, `src/lib/viz/*`) has no React imports and
  is covered by `npm test` (vitest).
- Design tokens live in `globals.css` `@theme`; components consume
  semantic colours (`surface-*`, `ink`, `line`, `brand-*`) only.
