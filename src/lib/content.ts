// NOTE: This module uses `node:fs` and must only be imported from Server
// Components (the app router pages/layouts). Do not import it in a "use client" file.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { SECTIONS, getSection, type Section, type SectionId } from "./nav";

const CONTENT_DIR = path.join(process.cwd(), "src", "content");

export type DocMeta = {
  section: SectionId;
  slug: string;
  /** Route path, e.g. /dsa/sliding-window */
  href: string;
  title: string;
  summary: string;
  order: number;
  tags: string[];
  /** Optional difficulty label (used by DSA problem cards). */
  difficulty?: string;
};

export type Doc = DocMeta & {
  /** Raw MDX body (frontmatter stripped). */
  body: string;
};

export type NavSection = Section & { docs: DocMeta[] };

export type SearchRecord = {
  title: string;
  href: string;
  section: SectionId;
  sectionLabel: string;
  summary: string;
  tags: string[];
  /** Lowercased haystack for fuzzy matching. */
  text: string;
};

/* ── Build-time cache (content is static during a build) ─────────────── */
let _docsCache: Doc[] | null = null;

function toMeta(doc: Doc): DocMeta {
  const { body: _body, ...meta } = doc;
  void _body;
  return meta;
}

function readSection(section: SectionId): Doc[] {
  const dir = path.join(CONTENT_DIR, section);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      const doc: Doc = {
        section,
        slug,
        href: `/${section}/${slug}`,
        title: typeof data.title === "string" ? data.title : slug,
        summary: typeof data.summary === "string" ? data.summary : "",
        order: typeof data.order === "number" ? data.order : 999,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        difficulty:
          typeof data.difficulty === "string" ? data.difficulty : undefined,
        body: content,
      };
      return doc;
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

function allDocs(): Doc[] {
  if (_docsCache) return _docsCache;
  _docsCache = SECTIONS.flatMap((s) => readSection(s.id));
  return _docsCache;
}

/* ── Public API ──────────────────────────────────────────────────────── */

export function getSectionDocs(section: SectionId): DocMeta[] {
  return allDocs()
    .filter((d) => d.section === section)
    .map(toMeta);
}

export function getDoc(section: string, slug: string): Doc | null {
  return (
    allDocs().find((d) => d.section === section && d.slug === slug) ?? null
  );
}

/** Sections that currently have at least one document (drives the sidebar). */
export function getNav(): NavSection[] {
  return SECTIONS.map((s) => ({ ...s, docs: getSectionDocs(s.id) })).filter(
    (s) => s.docs.length > 0,
  );
}

/** All (section, slug) pairs for generateStaticParams. */
export function getAllDocParams(): { section: string; slug: string }[] {
  return allDocs().map((d) => ({ section: d.section, slug: d.slug }));
}

/** Prev/next within the flattened, section-ordered reading order. */
export function getAdjacent(section: string, slug: string): {
  prev: DocMeta | null;
  next: DocMeta | null;
} {
  const flat = getNav().flatMap((s) => s.docs);
  const i = flat.findIndex((d) => d.section === section && d.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? flat[i - 1] : null,
    next: i < flat.length - 1 ? flat[i + 1] : null,
  };
}

/** Total document count (used on the dashboard). */
export function getDocCount(): number {
  return allDocs().length;
}

/** Rough MDX → plaintext for the search haystack. */
function toPlainText(mdx: string): string {
  return mdx
    .replace(/```[\s\S]*?```/g, " ") // fenced code
    .replace(/`[^`]*`/g, " ") // inline code
    .replace(/<[^>]+>/g, " ") // jsx/html tags
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links → text
    .replace(/[#>*_~|]/g, " ") // md punctuation
    .replace(/\s+/g, " ")
    .trim();
}

/* ── Flashcards (spaced repetition) ──────────────────────────────────── */

export type Flashcard = {
  /** Matches the id used by the <QA> component: explicit id, else the question. */
  id: string;
  q: string;
  /** Inner MDX of the QA block, lightly cleaned for plain rendering. */
  answer: string;
  href: string;
  docTitle: string;
  section: SectionId;
  sectionLabel: string;
};

// Attrs are matched as quoted name="value" pairs so questions containing
// ">" don't terminate the tag early.
const QA_RE = /<QA((?:\s+\w+="[^"]*")+)\s*>([\s\S]*?)<\/QA>/g;
const ATTR_RE = /(\w+)="([^"]*)"/g;

/**
 * Every <QA> block in the content, extracted at build time. This powers the
 * /review page: ratings made on lesson pages schedule these cards.
 */
export function getFlashcards(): Flashcard[] {
  const out: Flashcard[] = [];
  for (const d of allDocs()) {
    const sectionLabel = getSection(d.section)?.label ?? d.section;
    for (const m of d.body.matchAll(QA_RE)) {
      const attrs: Record<string, string> = {};
      for (const a of m[1].matchAll(ATTR_RE)) attrs[a[1]] = a[2];
      if (!attrs.q) continue;
      out.push({
        id: attrs.id ?? attrs.q,
        q: attrs.q,
        answer: m[2].trim(),
        href: d.href,
        docTitle: d.title,
        section: d.section,
        sectionLabel,
      });
    }
  }
  return out;
}

/** Search records passed to the client-side Cmd-K palette (Fuse). */
export function getSearchIndex(): SearchRecord[] {
  return allDocs().map((d) => {
    const section = getSection(d.section);
    const plain = toPlainText(d.body).slice(0, 600);
    return {
      title: d.title,
      href: d.href,
      section: d.section,
      sectionLabel: section?.label ?? d.section,
      summary: d.summary,
      tags: d.tags,
      text:
        `${d.title} ${d.summary} ${d.tags.join(" ")} ${plain}`.toLowerCase(),
    };
  });
}
