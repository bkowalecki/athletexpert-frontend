// src/util/aiSearchIntent.ts
const BASE_API = process.env.REACT_APP_API_URL || "";

export async function fetchSearchIntent(query: string) {
  try {
    const res = await fetch(`${BASE_API}/search/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error("Failed to fetch AI search intent");
    return await res.json(); // { intent, fixedQuery, suggestedPages, isGibberish }
  } catch (err: unknown) {
    // Always return a default object, and add a generic error string.
    return {
      intent: [],
      fixedQuery: query,
      suggestedPages: [],
      isGibberish: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
