# PrepDeck — SDE2 Interview Prep

A personal, deployable study workspace that turns a real engineering portfolio
(**LandAI · StockVision · StockStump · Praxivo**) into interview-ready material
across **project deep-dives, system design (HLD), low-level design (LLD), DSA,
CS fundamentals, behavioral**, and **cheat sheets**.

Built as a docs-style study wiki: a section sidebar, **⌘K full-text search**,
**click-to-reveal Q&A flashcards** with self-rating, **localStorage progress
tracking**, syntax-highlighted code, and **Mermaid** architecture diagrams.

## Stack

Next.js 16 (App Router, React 19 RSC) · TypeScript · Tailwind CSS v4 ·
`next-mdx-remote` (MDX) · `gray-matter` · `rehype-highlight` · `fuse.js`
(search) · `mermaid` (diagrams) · deploys to Vercel as static HTML.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (verifies SSG + types)
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
The answer, revealed on click, with a "Knew it / Revise again" toggle.
</QA>
```

Sections live in `src/lib/nav.ts`; the content registry that powers nav/search
is `src/lib/content.ts`.

## Project structure

```
src/
  app/                     # routes: dashboard, [section], [section]/[slug]
  components/              # app shell, sidebar, search palette, progress
    mdx/                   # MDX components: QA, Mermaid, Callout, Figure
  lib/                     # nav config + content registry (fs + gray-matter)
  content/                 # the MDX study material, by section
    projects/ hld/ lld/ dsa/ fundamentals/ behavioral/ cheatsheets/
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
