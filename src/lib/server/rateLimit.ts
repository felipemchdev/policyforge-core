type RateLimitEntry = {
  count: number;
  resetAt: number;
};

declare global {
  var __policyforge_rate_limit_store__: Map<string, RateLimitEntry> | undefined;
}

function getStore(): Map<string, RateLimitEntry> {
  if (!globalThis.__policyforge_rate_limit_store__) {
    globalThis.__policyforge_rate_limit_store__ = new Map<string, RateLimitEntry>();
  }
  return globalThis.__policyforge_rate_limit_store__;
}

export function checkRateLimit(key: string, options?: { limit?: number; windowMs?: number }) {
  const limit = options?.limit ?? 60;
  const windowMs = options?.windowMs ?? 60_000;
  const now = Date.now();
  const store = getStore();

  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    const next: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    store.set(key, next);
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: next.resetAt,
    };
  }

  current.count += 1;
  store.set(key, current);

  if (current.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    resetAt: current.resetAt,
  };
}
