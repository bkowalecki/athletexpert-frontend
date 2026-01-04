import React, { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSports } from "../../../context/SportsContext";
import { getThreadsBySport } from "./mockForumData";
import type { ForumThread } from "./forumTypes";
import "./Forum.css";

const slugify = (str: string) =>
  str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const sortByActivity = (threads: ForumThread[]) =>
  [...threads].sort((a, b) =>
    new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
  );

const SportForumPage: React.FC = () => {
  const { sport: slug } = useParams<{ sport: string }>();
  const navigate = useNavigate();
  const { sports } = useSports();

  const currentSport = useMemo(() => {
    if (!slug) return null;
    return sports.find((s) => slugify(s.title) === slug) ?? null;
  }, [sports, slug]);

  useEffect(() => {
    if (!slug || !currentSport || currentSport.title.toLowerCase() === "e-sports") {
      navigate("/404", { replace: true });
    }
  }, [slug, currentSport, navigate]);

  const threads = useMemo(() => {
    if (!currentSport) return [];
    return sortByActivity(getThreadsBySport(slugify(currentSport.title)));
  }, [currentSport]);

  if (!currentSport) {
    return (
      <div className="sport-page forum-page">
        <h2 className="sport-page-not-found">Loading...</h2>
      </div>
    );
  }

  return (
    <div className="sport-page forum-page">
      <div className="sport-page-title">{currentSport.title} Forum</div>

      <section className="sport-page-section">
        <div className="sport-page-buttons">
          <Link
            to={`/community/${slugify(currentSport.title)}/forum/new`}
            className="sport-page-btn primary"
          >
            Start a thread
          </Link>
          <Link
            to={`/community/${slugify(currentSport.title)}`}
            className="sport-page-btn secondary"
          >
            Back to {currentSport.title}
          </Link>
        </div>

        {threads.length === 0 ? (
          <p className="forum-empty">No threads yet. Be the first to post.</p>
        ) : (
          <div className="forum-thread-list">
            {threads.map((thread) => {
              const replyCount = thread.replies.length;
              return (
                <article key={thread.id} className="forum-thread-card">
                  <div>
                    <Link
                      to={`/community/${slugify(currentSport.title)}/forum/${thread.id}`}
                      className="forum-thread-title"
                    >
                      {thread.title}
                    </Link>
                    <p className="forum-thread-snippet">{thread.body}</p>
                    <div className="forum-thread-meta">
                      Started by {thread.author} - {formatDate(thread.createdAt)}
                    </div>
                  </div>
                  <div className="forum-thread-stats">
                    <span>{replyCount} repl{replyCount === 1 ? "y" : "ies"}</span>
                    <span>Last activity {formatDate(thread.lastActivityAt)}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default SportForumPage;
