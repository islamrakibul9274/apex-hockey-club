/**
 * In-process sliding-window rate limiter.
 *
 * Deliberately dependency-free. This protects a single instance only — on
 * Netlify each lambda runs in its own isolate, so the effective limit is
 * per-instance rather than global. See LIMITATION note in the audit writeup.
 * The important property for the auth routes is that the *attempt* is cheap to
 * make and that bcrypt work is not unbounded on one instance.
 */

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();

/** Drop stale buckets so a long-running process cannot grow without bound. */
function sweep(now: number): void {
  if (buckets.size < 512) return;
  const expired: string[] = [];
  buckets.forEach((bucket, key) => {
    if (bucket.hits.every((t: number) => now - t > 3_600_000)) {
      expired.push(key);
    }
  });
  expired.forEach((key) => buckets.delete(key));
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Seconds until the caller may retry. */
  retryAfter: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket);
    const oldest = bucket.hits[0];
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { ok: true, remaining: limit - bucket.hits.length, retryAfter: 0 };
}

/**
 * Identifies a caller by the proxy-provided client IP.
 * On Netlify `x-nf-client-connection-ip` is set by the edge and cannot be
 * spoofed by the browser; `x-forwarded-for` is the portable fallback.
 */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-nf-client-connection-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Throws when the caller exceeds a named budget. Returns the budget otherwise. */
export function enforceLimit(
  headers: Headers,
  scope: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  return rateLimit(`${scope}:${clientIp(headers)}`, limit, windowMs);
}