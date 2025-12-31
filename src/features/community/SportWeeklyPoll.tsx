import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWeeklyPollForSport, votePollOption } from "../../api/polls";
import "../../styles/SportWeeklyPoll.css";

/* ------------------ Types ------------------ */

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

/* ------------------ Utils ------------------ */

function getISOWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    (((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7
  );
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function voteKey(sportSlug: string, weekKey: string) {
  return `ax:poll-vote:${sportSlug}:${weekKey}`;
}

/* ------------------ Component ------------------ */

interface SportWeeklyPollProps {
  sportSlug: string;
  title?: string;
}

const SportWeeklyPoll: React.FC<SportWeeklyPollProps> = ({
  sportSlug,
  title = "Weekly Poll",
}) => {
  const queryClient = useQueryClient();

  const weekKey = useMemo(() => getISOWeekKey(), []);
  const pollQueryKey = useMemo(
    () => ["weeklyPoll", sportSlug, weekKey] as const,
    [sportSlug, weekKey]
  );
  const storageKey = useMemo(() => voteKey(sportSlug, weekKey), [sportSlug, weekKey]);

  const [localSelected, setLocalSelected] = useState<number | null>(() => {
    try {
      const v = localStorage.getItem(storageKey);
      return v ? Number(v) : null;
    } catch {
      return null;
    }
  });

  const {
    data: poll,
    isLoading,
    isError,
  } = useQuery<Poll | null, Error>({
    queryKey: pollQueryKey,
    queryFn: () => fetchWeeklyPollForSport(sportSlug, weekKey),
    staleTime: 60_000,
    retry: 0,
    placeholderData: (prev) => prev ?? null,
  });

  const totalVotes = useMemo(
    () => poll?.options.reduce((sum, o) => sum + o.votes, 0) ?? 0,
    [poll]
  );

  const hasVoted = localSelected !== null;

  const mutation = useMutation({
    mutationFn: async (optionId: number) => {
      if (!poll) throw new Error("Poll not loaded");
      return votePollOption(poll.id, optionId);
    },

    onMutate: async (optionId) => {
      await queryClient.cancelQueries({ queryKey: pollQueryKey });

      const previous = queryClient.getQueryData<Poll | null>(pollQueryKey);

      if (previous) {
        queryClient.setQueryData<Poll>(pollQueryKey, {
          ...previous,
          options: previous.options.map((o) =>
            o.id === optionId ? { ...o, votes: o.votes + 1 } : o
          ),
        });
      }

      return { previous };
    },

    onError: (_err, _optionId, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(pollQueryKey, ctx.previous);
      }
    },

    onSuccess: (_data, optionId) => {
      setLocalSelected(optionId);
      try {
        localStorage.setItem(storageKey, String(optionId));
      } catch {}
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: pollQueryKey });
    },
  });

  /* ------------------ Render states ------------------ */

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

  /* ------------------ Main UI ------------------ */

  return (
    <section className="poll-section" aria-labelledby="weekly-poll-title">
      <header className="poll-header">
        <h3 id="weekly-poll-title" className="poll-title">
          {title}
        </h3>
        <p className="poll-subtitle">Week {poll.weekKey.split("W")[1]}</p>
      </header>

      <div className="poll-card">
        <div className="poll-question">{poll.question}</div>

        <div className="poll-options" aria-live="polite">
          {poll.options.map((opt) => {
            const pct = totalVotes
              ? Math.round((opt.votes / totalVotes) * 100)
              : 0;

            const showResults = hasVoted || mutation.isPending;
            const selected = localSelected === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                className={`poll-option ${selected ? "selected" : ""} ${
                  hasVoted ? "voted" : ""
                }`}
                onClick={() => handleVote(opt.id)}
                disabled={hasVoted || mutation.isPending}
                aria-pressed={selected}
              >
                <span className="poll-option-label">{opt.text}</span>

                {showResults && (
                  <>
                    <span className="poll-percent">{pct}%</span>
                    <span
                      className="poll-progress"
                      style={{ width: `${pct}%` }}
                    />
                  </>
                )}
              </button>
            );
          })}
        </div>

        <div className="poll-meta">
          <span className="poll-total">
            {totalVotes} vote{totalVotes === 1 ? "" : "s"}
          </span>
          {hasVoted && <span className="poll-thanks">Thanks for voting!</span>}
        </div>
      </div>
    </section>
  );
};

export default SportWeeklyPoll;
