/**
 * Section registry. Each section maps to a folder under `src/content/<id>`.
 * Drop an `.mdx` file in that folder and it automatically gets a route, a
 * sidebar entry, a search-index record, and prev/next links — no code changes.
 * (Mirrors the data-driven `products.ts` pattern from the Praxivo site.)
 */
export type SectionId =
  | "projects"
  | "hld"
  | "lld"
  | "dsa"
  | "fundamentals"
  | "behavioral"
  | "cheatsheets";

export type Section = {
  id: SectionId;
  /** Full title (section page heading + sidebar group). */
  title: string;
  /** Short sidebar label. */
  label: string;
  /** lucide-react icon name (resolved in the sidebar). */
  icon: string;
  /** One-line description shown on the section index + dashboard. */
  blurb: string;
  /** Hex accent used for the section. */
  accent: string;
};

export const SECTIONS: Section[] = [
  {
    id: "projects",
    title: "Project Deep-Dives",
    label: "Projects",
    icon: "FolderGit2",
    blurb:
      "The four portfolio projects, interview-ready: pitch, architecture, trade-offs and the questions you'll be asked.",
    accent: "#818cf8",
  },
  {
    id: "hld",
    title: "System Design (HLD)",
    label: "System Design",
    icon: "Network",
    blurb:
      "High-level design fundamentals plus applied case studies drawn straight from your own systems.",
    accent: "#34d399",
  },
  {
    id: "lld",
    title: "Low-Level Design (LLD)",
    label: "Low-Level Design",
    icon: "Boxes",
    blurb:
      "OOP, SOLID and design patterns — with the patterns your codebases already use, plus classic LLD exercises.",
    accent: "#fbbf24",
  },
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    label: "DSA",
    icon: "Binary",
    blurb:
      "High-yield patterns, a curated problem bank, and the real algorithms inside your projects.",
    accent: "#38bdf8",
  },
  {
    id: "fundamentals",
    title: "CS Fundamentals",
    label: "Fundamentals",
    icon: "Cpu",
    blurb:
      "DBMS, OS, networking and security — tied to how you actually implemented them.",
    accent: "#a78bfa",
  },
  {
    id: "behavioral",
    title: "Behavioral & HR",
    label: "Behavioral",
    icon: "MessagesSquare",
    blurb:
      "STAR stories mined from real work, plus the SDE2 behavioral questions and how to answer them.",
    accent: "#fb7185",
  },
  {
    id: "cheatsheets",
    title: "Cheat Sheets",
    label: "Cheat Sheets",
    icon: "ScrollText",
    blurb:
      "Last-minute revision: complexity tables, capacity-estimation numbers and design checklists.",
    accent: "#2dd4bf",
  },
];

export function getSection(id: string): Section | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export function isSectionId(id: string): id is SectionId {
  return SECTIONS.some((s) => s.id === id);
}
