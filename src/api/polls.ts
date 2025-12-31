// src/api/polls.ts
import type { Poll } from "features/community/SportWeeklyPoll";

const STORAGE_KEY = "ax:polls";

/**
 * Safe localStorage access
 */
function readStore(): Record<string, Poll> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, Poll>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

/**
 * Seed a poll if missing
 */
function seedIfMissing(
  sportSlug: string,
  weekKey: string
): Poll {
  const store = readStore();
  const id = `${sportSlug}:${weekKey}`;

  if (store[id]) return store[id];

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
  writeStore(store);
  return seeded;
}

/**
 * Fetch weekly poll (mocked)
 */
export async function fetchWeeklyPollForSport(
  sportSlug: string,
  weekKey: string
): Promise<Poll> {
  await new Promise((r) => setTimeout(r, 150));

  const store = readStore();
  const id = `${sportSlug}:${weekKey}`;

  return store[id] ?? seedIfMissing(sportSlug, weekKey);
}

/**
 * Vote on a poll option (mocked)
 */
export async function votePollOption(
  pollId: number,
  optionId: number
): Promise<{ ok: true }> {
  await new Promise((r) => setTimeout(r, 100));

  const store = readStore();

  for (const key of Object.keys(store)) {
    if (store[key].id === pollId) {
      store[key] = {
        ...store[key],
        options: store[key].options.map((o) =>
          o.id === optionId ? { ...o, votes: o.votes + 1 } : o
        ),
      };
      writeStore(store);
      break;
    }
  }

  return { ok: true };
}
