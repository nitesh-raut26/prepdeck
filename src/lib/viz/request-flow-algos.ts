import type { RequestFlowStep } from "./types";

const MAX_REQUESTS = 6;

export function parseFlowRequests(raw: string): {
  requests: string[] | null;
  error: string | null;
} {
  const requests = raw
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (requests.length === 0)
    return { requests: null, error: "enter requests, e.g. GET /u/7, GET /u/9, GET /u/7" };
  if (requests.length > MAX_REQUESTS)
    return { requests: null, error: `keep it to ≤ ${MAX_REQUESTS} requests` };
  return { requests, error: null };
}

/**
 * Walks each request through the tiers — Client → Load Balancer (round-robin to
 * one of N stateless app servers) → Cache (hit or miss) → DB (only on a miss) →
 * respond. Repeated keys hit the warm cache and skip the DB, which is the whole
 * point of the cache + statelessness story. Pure: (requests, n) => steps.
 */
export function requestFlowSteps(
  requests: string[],
  serverCount: number,
): RequestFlowStep[] {
  const steps: RequestFlowStep[] = [];
  const cache = new Set<string>();
  let rr = 0;

  const push = (
    s: RequestFlowStep["stage"],
    request: string,
    activeServer: number | null,
    note: string,
    cacheOutcome: RequestFlowStep["cacheOutcome"] = null,
    extra: [string, string | number][] = [],
  ) =>
    steps.push({
      serverCount,
      activeServer,
      stage: s,
      cacheOutcome,
      request,
      note,
      vars: [["cached keys", cache.size], ...extra],
    });

  requests.forEach((req) => {
    const server = rr % serverCount;
    rr += 1;

    push("lb", req, server, `${req}: the load balancer routes to app server ${server} (round-robin). Servers are stateless, so any one can serve it.`, null, [["→ server", server]]);

    const hit = cache.has(req);
    if (hit) {
      push("cache", req, server, `${req}: cache HIT — served from Redis in ~1ms. The database is never touched.`, "hit");
      push("respond", req, server, `${req}: response returned from the cache. Fast path complete.`, "hit");
    } else {
      push("cache", req, server, `${req}: cache MISS — the key isn't warm yet.`, "miss");
      cache.add(req);
      push("db", req, server, `${req}: read from the database (slow path), then write the value back into the cache.`, "miss");
      push("respond", req, server, `${req}: response returned; the cache is now warm for next time.`, "miss");
    }
  });

  return steps;
}
