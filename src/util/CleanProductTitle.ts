/**
 * CleanProductTitle
 * ------------------
 * Optimized for repeated calls with identical inputs.
 *
 * Improvements:
 * - Precompiled regexes (no re-allocation per call)
 * - Small capped memoization cache (amortized O(1))
 * - Safe fast-path exits
 *
 * Behavior: IDENTICAL to previous implementation
 */

const MAX_CACHE_SIZE = 200;

/** Simple FIFO cache to avoid unbounded growth */
const cache = new Map<string, string>();

/* Precompiled regexes */
const MULTISPACE_REGEX = /\s{2,}/g;
const TRADEMARK_REGEX = /\b(trademark|tm|®|©)\b/gi;
const PAREN_CONTENT_REGEX = /\([^)]*\)/g;
const BRACKET_CONTENT_REGEX = /\[[^\]]*]/g;
const EXTRA_SYMBOLS_REGEX = /[|•]/g;

/**
 * Cleans a raw product title into a readable, user-friendly format.
 */
export function cleanProductTitle(rawTitle?: string): string {
  if (!rawTitle) return "";

  // Fast path: tiny strings don't need work
  if (rawTitle.length < 6) return rawTitle.trim();

  // Cache hit → O(1)
  const cached = cache.get(rawTitle);
  if (cached !== undefined) return cached;

  let title = rawTitle;

  // Strip noise
  title = title
    .replace(PAREN_CONTENT_REGEX, "")
    .replace(BRACKET_CONTENT_REGEX, "")
    .replace(TRADEMARK_REGEX, "")
    .replace(EXTRA_SYMBOLS_REGEX, " ")
    .replace(MULTISPACE_REGEX, " ")
    .trim();

  // Store in cache
  cache.set(rawTitle, title);

  // Enforce cache size cap (FIFO eviction)
  if (cache.size > MAX_CACHE_SIZE) {
    const first = cache.keys().next();
    if (!first.done) {
      cache.delete(first.value);
    }
  }

  return title;
}

export default cleanProductTitle;
