import type { ForumThread } from "./forumTypes";

const threads: ForumThread[] = [
  {
    id: "run-101",
    sportSlug: "running",
    title: "Best shoes for first marathon?",
    author: "Avery R.",
    createdAt: "2026-01-04T15:20:00Z",
    body: "Training for my first marathon and trying to decide between cushioned vs. lightweight trainers. Any favorites?",
    lastActivityAt: "2026-01-06T19:15:00Z",
    replies: [
      {
        id: "run-101-r1",
        author: "Mia C.",
        createdAt: "2026-01-05T09:10:00Z",
        content: "I like a stable daily trainer for long runs, then rotate a lighter shoe for speed work.",
      },
      {
        id: "run-101-r2",
        author: "Jordan P.",
        createdAt: "2026-01-06T19:15:00Z",
        content: "Test a few pairs at your long-run pace. Your feet will tell you fast.",
      },
    ],
  },
  {
    id: "run-102",
    sportSlug: "running",
    title: "Favorite pre-race breakfast?",
    author: "Sam D.",
    createdAt: "2026-01-02T13:00:00Z",
    body: "Trying to lock in a race-day routine. What works for you and avoids GI issues?",
    lastActivityAt: "2026-01-02T13:00:00Z",
    replies: [],
  },
  {
    id: "ball-201",
    sportSlug: "basketball",
    title: "Outdoor court grip tips",
    author: "Riley K.",
    createdAt: "2026-01-03T22:40:00Z",
    body: "My shoes lose traction fast on outdoor courts. Any maintenance tips?",
    lastActivityAt: "2026-01-05T17:30:00Z",
    replies: [
      {
        id: "ball-201-r1",
        author: "Chris L.",
        createdAt: "2026-01-05T17:30:00Z",
        content: "A stiff brush after each session helps. Outdoor courts will still eat soles though.",
      },
    ],
  },
  {
    id: "swim-301",
    sportSlug: "swimming",
    title: "Best goggles for open water?",
    author: "Taylor N.",
    createdAt: "2026-01-01T08:10:00Z",
    body: "Looking for anti-fog goggles that hold up in open water swims.",
    lastActivityAt: "2026-01-01T08:10:00Z",
    replies: [],
  },
];

export function getThreadsBySport(sportSlug: string): ForumThread[] {
  return threads.filter((thread) => thread.sportSlug === sportSlug);
}

export function getThreadById(
  sportSlug: string,
  threadId: string
): ForumThread | null {
  return threads.find(
    (thread) => thread.sportSlug === sportSlug && thread.id === threadId
  ) ?? null;
}
