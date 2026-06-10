/**
 * Section registry. Each section maps to a folder under `src/content/<id>`.
 * Drop an `.mdx` file in that folder and it automatically gets a route, a
 * sidebar entry, a search-index record, and prev/next links — no code changes.
 * (Mirrors the data-driven `products.ts` pattern from the Praxivo site.)
 */
export type SectionId =
  | "basics"
  | "programming"
  | "dsa"
  | "lld"
  | "hld"
  | "backend"
  | "frontend"
  | "databases"
  | "devops"
  | "aiml"
  | "fundamentals"
  | "projects"
  | "behavioral"
  | "career"
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
    id: "basics",
    title: "Computer & Web Basics",
    label: "Basics",
    icon: "Laptop",
    blurb:
      "Level 0 — start from zero: what computers, the internet, websites, APIs, databases and the cloud actually are.",
    accent: "#f472b6",
  },
  {
    id: "programming",
    title: "Programming Fundamentals",
    label: "Programming",
    icon: "Code2",
    blurb:
      "Level 1 — learn to program in Python, Java and C++: variables, control flow, functions and OOP from first principles.",
    accent: "#fb923c",
  },
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    label: "DSA",
    icon: "Binary",
    blurb:
      "Levels 2–4 — high-yield patterns, a curated problem bank, and the real algorithms inside your projects.",
    accent: "#38bdf8",
  },
  {
    id: "lld",
    title: "Low-Level Design (LLD)",
    label: "Low-Level Design",
    icon: "Boxes",
    blurb:
      "Level 5 — OOP, SOLID and design patterns, with the patterns your codebases already use, plus classic LLD exercises.",
    accent: "#fbbf24",
  },
  {
    id: "hld",
    title: "System Design (HLD)",
    label: "System Design",
    icon: "Network",
    blurb:
      "Level 6 — high-level design fundamentals plus applied case studies drawn straight from real systems.",
    accent: "#34d399",
  },
  {
    id: "backend",
    title: "Backend Development",
    label: "Backend",
    icon: "Server",
    blurb:
      "Level 7 — Node.js, Spring Boot and FastAPI: auth, REST, GraphQL, WebSockets and microservices in production.",
    accent: "#4ade80",
  },
  {
    id: "frontend",
    title: "Frontend Development",
    label: "Frontend",
    icon: "PanelsTopLeft",
    blurb:
      "Level 8 — HTML, CSS, JavaScript, TypeScript, React and Next.js, from a blank page to shipped products.",
    accent: "#e879f9",
  },
  {
    id: "databases",
    title: "Databases",
    label: "Databases",
    icon: "Database",
    blurb:
      "Level 9 — SQL and NoSQL in depth: indexing, query optimization, transactions, replication and sharding.",
    accent: "#60a5fa",
  },
  {
    id: "devops",
    title: "Cloud & DevOps",
    label: "Cloud & DevOps",
    icon: "Cloud",
    blurb:
      "Level 10 — AWS, Docker, Kubernetes, CI/CD and Terraform: how real teams ship and run software.",
    accent: "#22d3ee",
  },
  {
    id: "aiml",
    title: "AI & Machine Learning",
    label: "AI & ML",
    icon: "BrainCircuit",
    blurb:
      "Level 11 — AI, ML, deep learning, LLMs, RAG and agents explained from zero, with hands-on projects.",
    accent: "#c084fc",
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
    id: "projects",
    title: "Project Deep-Dives",
    label: "Projects",
    icon: "FolderGit2",
    blurb:
      "The four portfolio projects, interview-ready: pitch, architecture, trade-offs and the questions you'll be asked.",
    accent: "#818cf8",
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
    id: "career",
    title: "Career Preparation",
    label: "Career",
    icon: "Briefcase",
    blurb:
      "Level 12 — resume, LinkedIn, interview loops, offer evaluation and salary negotiation, from SDE-1 to Staff.",
    accent: "#f87171",
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
