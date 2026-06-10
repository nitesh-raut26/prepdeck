/**
 * The Level 0 → 12 learning path. Each level points at the section(s) where
 * its content lives and lists its key topics. A topic's `doc` is a
 * `"section/slug"` pair — the roadmap page links it automatically once that
 * MDX file exists, and shows it as "planned" until then. No code changes are
 * needed when content lands: just drop the file and the link lights up.
 */
import type { SectionId } from "./nav";

export type RoadmapTopic = {
  label: string;
  /** "section/slug" of the doc that covers this topic (may not exist yet). */
  doc?: string;
};

export type RoadmapLevel = {
  level: number;
  title: string;
  /** What you can do after finishing this level. */
  goal: string;
  /** Primary section(s) holding this level's content. */
  sections: SectionId[];
  topics: RoadmapTopic[];
};

export const ROADMAP: RoadmapLevel[] = [
  {
    level: 0,
    title: "Absolute Beginner",
    goal: "Understand what computers, the internet, websites, APIs, databases and the cloud actually are — no prior knowledge assumed.",
    sections: ["basics"],
    topics: [
      { label: "How computers work", doc: "basics/how-computers-work" },
      { label: "The internet", doc: "basics/the-internet" },
      { label: "Websites & browsers", doc: "basics/websites-and-browsers" },
      { label: "Frontend vs backend", doc: "basics/frontend-and-backend" },
      { label: "What is an API?", doc: "basics/what-is-an-api" },
      { label: "What is a database?", doc: "basics/what-is-a-database" },
      { label: "What is the cloud?", doc: "basics/what-is-the-cloud" },
      { label: "How code runs", doc: "basics/how-code-runs" },
    ],
  },
  {
    level: 1,
    title: "Programming Fundamentals",
    goal: "Write real programs in Python, Java and C++ — variables, control flow, functions, OOP, errors and collections.",
    sections: ["programming"],
    topics: [
      { label: "Choosing a language", doc: "programming/choosing-a-language" },
      {
        label: "Variables & data types",
        doc: "programming/variables-and-data-types",
      },
      { label: "Control flow", doc: "programming/control-flow" },
      { label: "Functions", doc: "programming/functions" },
      { label: "Recursion", doc: "programming/recursion" },
      { label: "Memory management", doc: "programming/memory-management" },
      { label: "OOP basics", doc: "programming/oop-basics" },
      { label: "Exceptions & errors", doc: "programming/exceptions" },
      { label: "Collections", doc: "programming/collections" },
      { label: "File handling", doc: "programming/file-handling" },
    ],
  },
  {
    level: 2,
    title: "Data Structures",
    goal: "Know every core data structure — what it is, when to reach for it, and its complexity — in all three languages.",
    sections: ["dsa"],
    topics: [
      { label: "Arrays & strings", doc: "dsa/arrays-and-strings" },
      { label: "Linked lists", doc: "dsa/linked-lists" },
      { label: "Stacks & queues", doc: "dsa/stacks-and-queues" },
      { label: "Hash tables", doc: "dsa/hash-tables" },
      { label: "Trees & BSTs", doc: "dsa/trees-and-bsts" },
      { label: "Heaps & intervals", doc: "dsa/heaps-and-intervals" },
      { label: "Tries", doc: "dsa/tries" },
      { label: "Graphs", doc: "dsa/graphs-bfs-dfs" },
      { label: "Union-Find", doc: "dsa/union-find" },
      {
        label: "Segment & Fenwick trees",
        doc: "dsa/segment-and-fenwick-trees",
      },
    ],
  },
  {
    level: 3,
    title: "Algorithms & Patterns",
    goal: "Recognize the pattern behind a problem in seconds: pointers, windows, search, recursion, greedy and DP.",
    sections: ["dsa"],
    topics: [
      { label: "Sorting & searching", doc: "dsa/sorting-and-searching" },
      { label: "Two pointers", doc: "dsa/two-pointers" },
      { label: "Sliding window", doc: "dsa/sliding-window" },
      { label: "Binary search", doc: "dsa/binary-search" },
      { label: "Backtracking", doc: "dsa/backtracking" },
      { label: "Greedy", doc: "dsa/greedy" },
      { label: "Dynamic programming", doc: "dsa/dynamic-programming" },
      { label: "DP patterns in depth", doc: "dsa/dp-patterns" },
      { label: "String algorithms", doc: "dsa/string-algorithms" },
    ],
  },
  {
    level: 4,
    title: "DSA Interview Prep",
    goal: "Turn knowledge into offers: a study plan, a curated problem bank, and the classic lists solved pattern-first.",
    sections: ["dsa"],
    topics: [
      { label: "Study plan", doc: "dsa/study-plan" },
      { label: "Problem bank", doc: "dsa/problem-bank" },
      { label: "Algorithms in your projects", doc: "dsa/project-algorithms" },
      { label: "Blind 75 walkthrough", doc: "dsa/blind-75" },
      { label: "NeetCode 150 walkthrough", doc: "dsa/neetcode-150" },
      { label: "Mock-interview drills", doc: "dsa/mock-drills" },
    ],
  },
  {
    level: 5,
    title: "Low-Level Design",
    goal: "Design clean classes under interview pressure: OOP, SOLID, patterns and the classic machine-coding problems.",
    sections: ["lld"],
    topics: [
      { label: "OOP & SOLID", doc: "lld/oop-and-solid" },
      { label: "Design patterns", doc: "lld/design-patterns" },
      { label: "Applied patterns", doc: "lld/applied-patterns" },
      { label: "API design", doc: "lld/api-design" },
      { label: "Parking lot", doc: "lld/parking-lot" },
      { label: "LRU cache", doc: "lld/lru-cache" },
      { label: "Elevator system", doc: "lld/elevator" },
      { label: "Splitwise", doc: "lld/splitwise" },
      { label: "BookMyShow", doc: "lld/bookmyshow" },
      { label: "Patterns in depth (creational/structural)", doc: "lld/patterns-in-depth" },
      { label: "Library system", doc: "lld/library" },
      { label: "ATM", doc: "lld/atm" },
      { label: "Notification system", doc: "lld/notification-system" },
      { label: "Chat system (WhatsApp LLD)", doc: "lld/chat-system" },
      { label: "Uber (LLD)", doc: "lld/uber" },
    ],
  },
  {
    level: 6,
    title: "High-Level Design",
    goal: "Design systems that scale: estimation, caching, queues, replication — then full designs of real products.",
    sections: ["hld"],
    topics: [
      { label: "Interview approach", doc: "hld/approach" },
      { label: "Scalability", doc: "hld/scalability" },
      { label: "Caching", doc: "hld/caching" },
      { label: "Databases at scale", doc: "hld/databases-at-scale" },
      { label: "Messaging & queues", doc: "hld/messaging-and-queues" },
      { label: "Rate limiting", doc: "hld/rate-limiting" },
      { label: "CAP & consistency", doc: "hld/cap-consistency" },
      { label: "Case: ingestion pipeline", doc: "hld/case-ingestion-pipeline" },
      { label: "Case: realtime pricing", doc: "hld/case-realtime-pricing" },
      { label: "Design WhatsApp", doc: "hld/design-whatsapp" },
      { label: "Design Netflix", doc: "hld/design-netflix" },
      { label: "Design Instagram", doc: "hld/design-instagram" },
      { label: "Design YouTube", doc: "hld/design-youtube" },
      { label: "Design Uber", doc: "hld/design-uber" },
      { label: "Design Twitter/X", doc: "hld/design-twitter" },
      { label: "Design Google Drive", doc: "hld/design-google-drive" },
      { label: "Scaling journey: 100 → 1B users", doc: "hld/scaling-journey" },
    ],
  },
  {
    level: 7,
    title: "Backend Development",
    goal: "Build production APIs: Node.js, Spring Boot and FastAPI with auth, REST, GraphQL, WebSockets and microservices.",
    sections: ["backend"],
    topics: [
      { label: "Node.js & Express", doc: "backend/nodejs" },
      { label: "Java Spring Boot", doc: "backend/spring-boot" },
      { label: "Python FastAPI", doc: "backend/fastapi" },
      { label: "AuthN & AuthZ (JWT, OAuth)", doc: "backend/auth" },
      { label: "REST & GraphQL", doc: "backend/rest-and-graphql" },
      { label: "WebSockets", doc: "backend/websockets" },
      { label: "Microservices", doc: "backend/microservices" },
      { label: "Kafka & RabbitMQ", doc: "backend/kafka" },
      { label: "API gateway & service discovery", doc: "backend/api-gateway" },
      { label: "Distributed locks", doc: "backend/distributed-locks" },
      { label: "DDD & modular monoliths", doc: "backend/ddd" },
    ],
  },
  {
    level: 8,
    title: "Frontend Development",
    goal: "Ship polished UIs: HTML, CSS, JavaScript, TypeScript, React and Next.js, from a blank page to a SaaS product.",
    sections: ["frontend"],
    topics: [
      { label: "HTML & CSS", doc: "frontend/html-and-css" },
      { label: "JavaScript", doc: "frontend/javascript" },
      { label: "TypeScript", doc: "frontend/typescript" },
      { label: "React", doc: "frontend/react" },
      { label: "Next.js", doc: "frontend/nextjs" },
    ],
  },
  {
    level: 9,
    title: "Databases in Depth",
    goal: "Go beyond CRUD: indexing, query plans, transactions, locks, replication and sharding in SQL and NoSQL.",
    sections: ["databases", "fundamentals"],
    topics: [
      { label: "SQL fundamentals", doc: "databases/sql-fundamentals" },
      { label: "PostgreSQL & MySQL", doc: "databases/postgres-and-mysql" },
      { label: "MongoDB & Redis", doc: "databases/mongodb-and-redis" },
      { label: "Indexing & optimization", doc: "databases/indexing" },
      { label: "Transactions & locks", doc: "databases/transactions" },
      { label: "DBMS for interviews", doc: "fundamentals/databases" },
      { label: "MVCC", doc: "databases/mvcc" },
      { label: "The query optimizer", doc: "databases/query-optimizer" },
      { label: "Event sourcing & CQRS", doc: "databases/event-sourcing-cqrs" },
    ],
  },
  {
    level: 10,
    title: "Cloud & DevOps",
    goal: "Deploy and run software like a real team: AWS, Docker, Kubernetes, CI/CD pipelines and infrastructure as code.",
    sections: ["devops"],
    topics: [
      { label: "Cloud platforms (AWS/Azure/GCP)", doc: "devops/cloud-platforms" },
      { label: "Docker", doc: "devops/docker" },
      { label: "Kubernetes", doc: "devops/kubernetes" },
      { label: "CI/CD", doc: "devops/ci-cd" },
      { label: "Terraform", doc: "devops/terraform" },
      { label: "Observability", doc: "devops/observability" },
    ],
  },
  {
    level: 11,
    title: "AI & Machine Learning",
    goal: "Understand and build with modern AI: ML foundations, neural networks, LLMs, RAG, agents and vector databases.",
    sections: ["aiml"],
    topics: [
      { label: "AI vs ML vs deep learning", doc: "aiml/ai-ml-dl" },
      { label: "Math foundations", doc: "aiml/math-foundations" },
      { label: "Classical ML", doc: "aiml/classical-ml" },
      { label: "Neural networks", doc: "aiml/neural-networks" },
      { label: "Transformers", doc: "aiml/transformers" },
      { label: "LLMs", doc: "aiml/llms" },
      { label: "RAG", doc: "aiml/rag" },
      { label: "Agents", doc: "aiml/agents" },
      { label: "Vector databases", doc: "aiml/vector-databases" },
      { label: "Fine-tuning", doc: "aiml/fine-tuning" },
    ],
  },
  {
    level: 12,
    title: "Career Preparation",
    goal: "Convert skill into offers: resume, LinkedIn, behavioral mastery, mock loops and salary negotiation.",
    sections: ["career", "behavioral"],
    topics: [
      { label: "Resume & LinkedIn", doc: "career/resume-and-linkedin" },
      { label: "Behavioral framework", doc: "behavioral/framework" },
      { label: "STAR stories", doc: "behavioral/stories" },
      { label: "Common questions", doc: "behavioral/common-questions" },
      { label: "Mock interviews", doc: "career/mock-interviews" },
      { label: "Salary negotiation", doc: "career/salary-negotiation" },
      { label: "The engineering ladder", doc: "career/engineering-ladder" },
    ],
  },
];
