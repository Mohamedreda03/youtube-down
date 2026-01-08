/**
 * Rate limiting middleware using LRU cache
 * Limits requests per IP to prevent abuse
 */

import { LRUCache } from "lru-cache";

interface RateLimitInfo {
  count: number;
  firstRequest: number;
}

// Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute
const MAX_CONCURRENT_DOWNLOADS = 3; // Max concurrent downloads per IP

// LRU cache for rate limiting
const rateLimitCache = new LRUCache<string, RateLimitInfo>({
  max: 1000, // Maximum number of IPs to track
  ttl: RATE_LIMIT_WINDOW_MS,
});

// Track concurrent downloads per IP
const concurrentDownloads = new LRUCache<string, number>({
  max: 1000,
  ttl: 5 * 60 * 1000, // 5 minutes TTL for download tracking
});

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

/**
 * Check if request should be rate limited
 * Returns null if allowed, error message if rate limited
 */
export function checkRateLimit(ip: string): string | null {
  const now = Date.now();
  const existing = rateLimitCache.get(ip);

  if (!existing) {
    rateLimitCache.set(ip, { count: 1, firstRequest: now });
    return null;
  }

  // Check if window has expired
  if (now - existing.firstRequest > RATE_LIMIT_WINDOW_MS) {
    rateLimitCache.set(ip, { count: 1, firstRequest: now });
    return null;
  }

  // Increment count
  existing.count++;

  if (existing.count > MAX_REQUESTS_PER_WINDOW) {
    const resetTime = Math.ceil(
      (existing.firstRequest + RATE_LIMIT_WINDOW_MS - now) / 1000
    );
    return `Rate limit exceeded. Please try again in ${resetTime} seconds.`;
  }

  rateLimitCache.set(ip, existing);
  return null;
}

/**
 * Check if download slot is available for IP
 */
export function canStartDownload(ip: string): boolean {
  const current = concurrentDownloads.get(ip) || 0;
  return current < MAX_CONCURRENT_DOWNLOADS;
}

/**
 * Increment concurrent download count for IP
 */
export function startDownload(ip: string): void {
  const current = concurrentDownloads.get(ip) || 0;
  concurrentDownloads.set(ip, current + 1);
}

/**
 * Decrement concurrent download count for IP
 */
export function endDownload(ip: string): void {
  const current = concurrentDownloads.get(ip) || 0;
  if (current > 0) {
    concurrentDownloads.set(ip, current - 1);
  }
}

/**
 * Rate limit middleware result
 */
export interface RateLimitResult {
  allowed: boolean;
  error?: string;
  ip: string;
}

/**
 * Check all rate limits for a request
 */
export function checkAllLimits(
  request: Request,
  checkDownload: boolean = false
): RateLimitResult {
  const ip = getClientIP(request);

  // Check request rate limit
  const rateLimitError = checkRateLimit(ip);
  if (rateLimitError) {
    return { allowed: false, error: rateLimitError, ip };
  }

  // Check concurrent downloads if needed
  if (checkDownload && !canStartDownload(ip)) {
    return {
      allowed: false,
      error: `Maximum concurrent downloads (${MAX_CONCURRENT_DOWNLOADS}) reached. Please wait for a download to complete.`,
      ip,
    };
  }

  return { allowed: true, ip };
}
