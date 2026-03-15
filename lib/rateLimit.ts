const limit = 10;
const windowMs = 60 * 1000;

const store = new Map<string, { count: number; resetAt: number }>();

function getKey(identifier: string): string {
  return identifier;
}

export function rateLimit(identifier: string): { ok: boolean; remaining: number } {
  const now = Date.now();
  const key = getKey(identifier);
  let entry = store.get(key);

  if (!entry) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { ok: true, remaining: limit - 1 };
  }

  if (now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { ok: true, remaining: limit - 1 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { ok: false, remaining: 0 };
  }
  return { ok: true, remaining: limit - entry.count };
}
