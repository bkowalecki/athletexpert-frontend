// src/util/aiSearchIntent.ts

const BASE_API = process.env.REACT_APP_API_URL || "";

/**
 * Shape returned by /search/intent.
 * Keep this in sync with your backend response.
 */
export type SearchIntentResponse = {
  intent: string[];
  fixedQuery: string;
  suggestedPages: Array<{ title: string; path: string }>;
  isGibberish: boolean;
  error?: string;
};

export async function fetchSearchIntent(
  query: string,
  opts?: { signal?: AbortSignal }
): Promise<SearchIntentResponse> {
  // Basic guard: keep behavior consistent but avoid pointless calls
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      intent: [],
      fixedQuery: query,
      suggestedPages: [],
      isGibberish: false,
    };
  }

  try {
    const res = await fetch(`${BASE_API}/search/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // important if your backend relies on cookies/session
      signal: opts?.signal,
      body: JSON.stringify({ query: trimmed }),
    });

    if (!res.ok) throw new Error(`Failed to fetch AI search intent (${res.status})`);

    const data = (await res.json()) as Partial<SearchIntentResponse>;

    // Normalize to a stable shape so callers never crash on missing fields
    return {
      intent: Array.isArray(data.intent) ? data.intent : [],
      fixedQuery: typeof data.fixedQuery === "string" ? data.fixedQuery : trimmed,
      suggestedPages: Array.isArray(data.suggestedPages) ? data.suggestedPages : [],
      isGibberish: Boolean(data.isGibberish),
    };
  } catch (err: unknown) {
    return {
      intent: [],
      fixedQuery: trimmed,
      suggestedPages: [],
      isGibberish: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
