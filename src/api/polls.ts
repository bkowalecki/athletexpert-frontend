// src/api/polls.ts
import type { Poll } from "features/community/SportWeeklyPoll";

const STORAGE_KEY = "ax:polls";

// Seed one example per week per sport if none exists
function seedIfMissing(sportSlug: string, weekKey: string): Poll | null {
  const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Record<string, Poll>;
  const id = `${sportSlug}:${weekKey}`;
  if (store[id]) return store[id];

  // Example seed — customize per sport if you want
  const seeded: Poll = {
    id: Date.now(),
    sportSlug,
    weekKey,
    question: `What's your top priority this week in ${sportSlug}?`,
    options: [
      { id: 1, text: "Training/Drills", votes: 0 },
      { id: 2, text: "Games/Matches", votes: 0 },
      { id: 3, text: "Gear Upgrades", votes: 0 },
      { id: 4, text: "Recovery/Mobility", votes: 0 },
    ],
  };
  store[id] = seeded;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  return seeded;
}

export async function fetchWeeklyPollForSport(sportSlug: string, weekKey: string): Promise<Poll | null> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 150));
  const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Record<string, Poll>;
  const id = `${sportSlug}:${weekKey}`;
  return store[id] ?? seedIfMissing(sportSlug, weekKey);
}

export async function votePollOption(pollId: number, optionId: number): Promise<{ ok: true }> {
  await new Promise((r) => setTimeout(r, 100));
  const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Record<string, Poll>;
  for (const key of Object.keys(store)) {
    if (store[key].id === pollId) {
      store[key] = {
        ...store[key],
        options: store[key].options.map((o) => (o.id === optionId ? { ...o, votes: o.votes + 1 } : o)),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      break;
    }
  }
  return { ok: true };
}
