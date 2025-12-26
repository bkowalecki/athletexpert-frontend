import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWeeklyPollForSport, votePollOption } from "../../api/polls";
import "../../styles/SportWeeklyPoll.css";

export type PollOption = {
  id: number;
  text: string;
  votes: number;
};

export type Poll = {
  id: number;
  sportSlug: string;
  weekKey: string; // e.g. "2025-W32"
  question: string;
  options: PollOption[];
};

function getISOWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function voteKey(sportSlug: string, weekKey: string) {
  return `ax:poll-vote:${sportSlug}:${weekKey}`;
}

const SportWeeklyPoll: React.FC<{ sportSlug: string; title?: string }> = ({ sportSlug, title = "Weekly Poll" }) => {
  const queryClient = useQueryClient();
  const weekKey = useMemo(() => getISOWeekKey(), []);
  const storageKey = useMemo(() => voteKey(sportSlug, weekKey), [sportSlug, weekKey]);

  const [localSelected, setLocalSelected] = useState<number | null>(() => {
    const v = localStorage.getItem(storageKey);
    return v ? Number(v) : null;
  });

  const { data: poll, isLoading, isError } = useQuery<Poll | null, Error>({
    queryKey: ["weeklyPoll", sportSlug, weekKey],
    queryFn: () => fetchWeeklyPollForSport(sportSlug, weekKey),
    staleTime: 60_000,
    retry: 0,
    placeholderData: (prev) => prev ?? null,
  });

  const totalVotes = useMemo(() => poll?.options.reduce((s, o) => s + o.votes, 0) ?? 0, [poll]);
  const hasVoted = localSelected !== null;

  const mutation = useMutation({
    mutationFn: (optionId: number) => votePollOption(poll!.id, optionId),
    onMutate: async (optionId) => {
      await queryClient.cancelQueries({ queryKey: ["weeklyPoll", sportSlug, weekKey] });
      const previous = queryClient.getQueryData<Poll | null>(["weeklyPoll", sportSlug, weekKey]);
      if (previous) {
        const next: Poll = {
          ...previous,
          options: previous.options.map((o) => (o.id === optionId ? { ...o, votes: o.votes + 1 } : o)),
        };
        queryClient.setQueryData(["weeklyPoll", sportSlug, weekKey], next);
      }
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["weeklyPoll", sportSlug, weekKey], ctx.previous);
      }
    },
    onSuccess: (_data, optionId) => {
      setLocalSelected(optionId);
      localStorage.setItem(storageKey, String(optionId));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["weeklyPoll", sportSlug, weekKey] });
    },
  });

  if (isLoading) {
    return (
      <section className="poll-section">
        <header className="poll-header">
          <h3 className="poll-title">{title}</h3>
        </header>
        <div className="poll-card skeleton">
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
      </section>
    );
  }

  if (isError || !poll) {
    return (
      <section className="poll-section">
        <header className="poll-header">
          <h3 className="poll-title">{title}</h3>
        </header>
        <p className="poll-empty">No poll this week. Check back soon!</p>
      </section>
    );
  }

  const handleVote = (optionId: number) => {
    if (hasVoted || mutation.isPending) return;
    mutation.mutate(optionId);
  };

  return (
    <section className="poll-section" aria-labelledby="weekly-poll-title">
      <header className="poll-header">
        <h3 id="weekly-poll-title" className="poll-title">{title}</h3>
        <p className="poll-subtitle">
          Week {poll.weekKey.split("W")[1]}
        </p>
      </header>

      <div className="poll-card" aria-live="polite">
        <div className="poll-question">{poll.question}</div>

        <div className="poll-options">
          {poll.options.map((opt) => {
            const pct = totalVotes ? Math.round((opt.votes / totalVotes) * 100) : 0;
            const showResults = hasVoted || mutation.isPending;
            const selected = localSelected === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                className={`poll-option ${selected ? "selected" : ""} ${hasVoted ? "voted" : ""}`}
                onClick={() => handleVote(opt.id)}
                disabled={hasVoted || mutation.isPending}
                aria-pressed={selected}
              >
                <span className="poll-option-label">{opt.text}</span>
                {showResults && <span className="poll-percent">{pct}%</span>}
                {showResults && <span className="poll-progress" style={{ width: `${pct}%` }} />}
              </button>
            );
          })}
        </div>

        <div className="poll-meta">
          <span className="poll-total">{totalVotes} vote{totalVotes === 1 ? "" : "s"}</span>
          {hasVoted && <span className="poll-thanks">Thanks for voting!</span>}
        </div>
      </div>
    </section>
  );
};

export default SportWeeklyPoll;
