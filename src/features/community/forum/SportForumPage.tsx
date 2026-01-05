import React, { useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSports } from "../../../context/SportsContext";
import { getThreadsBySport } from "./mockForumData";
import type { ForumThread } from "./forumTypes";
import "./Forum.css";
import { slugifySportName } from "../../../util/slug";
import { trackEvent } from "../../../util/analytics";

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
  const listTrackedRef = useRef(false);

  const currentSport = useMemo(() => {
    if (!slug) return null;
    return sports.find((s) => slugifySportName(s.title) === slug) ?? null;
  }, [sports, slug]);

  useEffect(() => {
    if (!slug || !currentSport || currentSport.title.toLowerCase() === "e-sports") {
      navigate("/404", { replace: true });
    }
  }, [slug, currentSport, navigate]);

  const threads = useMemo(() => {
    if (!currentSport) return [];
    return sortByActivity(getThreadsBySport(slugifySportName(currentSport.title)));
  }, [currentSport]);

  useEffect(() => {
    if (listTrackedRef.current) return;
    if (!currentSport) return;

    listTrackedRef.current = true;
    trackEvent("view_item_list", {
      item_list_name: "forum_threads",
      item_list_id: `forum_${slugifySportName(currentSport.title)}`,
      items_count: threads.length,
      sport: currentSport.title,
      source_page: "community_forum",
    });
  }, [currentSport, threads.length]);

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
            to={`/community/${slugifySportName(currentSport.title)}/forum/new`}
            className="sport-page-btn primary"
          >
            Start a thread
          </Link>
          <Link
            to={`/community/${slugifySportName(currentSport.title)}`}
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
                      to={`/community/${slugifySportName(currentSport.title)}/forum/${thread.id}`}
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
