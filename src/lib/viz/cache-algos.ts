import type { CacheStep } from "./types";

const MAX_REQUESTS = 16;

export function parseCacheKeys(raw: string): {
  keys: string[] | null;
  error: string | null;
} {
  const keys = raw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (keys.length === 0)
    return { keys: null, error: "enter request keys, e.g. A B C B A D A" };
  if (keys.length > MAX_REQUESTS)
    return { keys: null, error: `keep it to ≤ ${MAX_REQUESTS} requests` };
  return { keys, error: null };
}

const pct = (h: number, m: number) =>
  h + m === 0 ? 0 : Math.round((h / (h + m)) * 100);

/**
 * A read-through LRU cache in front of a slow store, stepped for the
 * visualizer. A hit is served from memory; a miss fetches from the store,
 * caches the value, and evicts the least-recently-used key when full.
 * Pure: (requests, capacity) => CacheStep[].
 */
export function cacheSteps(requests: string[], capacity: number): CacheStep[] {
  const steps: CacheStep[] = [];
  const cache: string[] = []; // most-recently-used first
  let hits = 0;
  let misses = 0;

  steps.push({
    capacity,
    cache: [],
    request: null,
    phase: "start",
    hits,
    misses,
    note: `Empty LRU cache, capacity ${capacity}. A hit is served from memory; a miss must fetch from the slow store, then cache it — evicting the least-recently-used key once the cache is full.`,
    vars: [["hit rate", "0%"]],
  });

  for (const k of requests) {
    const idx = cache.indexOf(k);
    if (idx !== -1) {
      hits++;
      cache.splice(idx, 1);
      cache.unshift(k);
      steps.push({
        capacity,
        cache: cache.map((key) => ({ key, tone: key === k ? "good" : "idle" })),
        request: k,
        phase: "hit",
        hits,
        misses,
        note: `${k}: HIT — already cached. Served from memory and promoted to most-recently-used.`,
        vars: [
          ["hits", hits],
          ["misses", misses],
          ["hit rate", `${pct(hits, misses)}%`],
        ],
      });
    } else {
      misses++;
      let evicted: string | null = null;
      if (cache.length >= capacity) evicted = cache.pop() ?? null;
      cache.unshift(k);
      steps.push({
        capacity,
        cache: cache.map((key) => ({
          key,
          tone: key === k ? "accent" : "idle",
        })),
        request: k,
        phase: evicted ? "evict" : "miss",
        hits,
        misses,
        evicted,
        note: evicted
          ? `${k}: MISS — fetch from the store and insert. Cache was full, so evict the LRU key ${evicted}.`
          : `${k}: MISS — fetch from the slow store, then cache it for next time.`,
        vars: [
          ["hits", hits],
          ["misses", misses],
          ["hit rate", `${pct(hits, misses)}%`],
        ],
      });
    }
  }
  return steps;
}
