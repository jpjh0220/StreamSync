/**
 * Simple in-memory rate limiter
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., user ID or IP address)
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if rate limited, false otherwise
 */
export function isRateLimited(
  identifier: string,
  maxRequests: number = 30,
  windowMs: number = 60000 // 1 minute default
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No entry or expired
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return false;
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > maxRequests) {
    return true;
  }

  return false;
}

/**
 * Get rate limit info for an identifier
 */
export function getRateLimitInfo(identifier: string) {
  const entry = rateLimitStore.get(identifier);
  if (!entry || entry.resetAt < Date.now()) {
    return {
      count: 0,
      resetAt: null,
      remaining: 30,
    };
  }

  return {
    count: entry.count,
    resetAt: entry.resetAt,
    remaining: Math.max(0, 30 - entry.count),
  };
}
