import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSports } from "../../../context/SportsContext";
import { useUserContext } from "../../../context/UserContext";
import { getThreadById } from "./mockForumData";
import "./Forum.css";
import { slugifySportName } from "../../../util/slug";
import { trackEvent } from "../../../util/analytics";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const ThreadDetailPage: React.FC = () => {
  const { sport: slug, threadId } = useParams<{
    sport: string;
    threadId: string;
  }>();
  const navigate = useNavigate();
  const { sports } = useSports();
  const { user } = useUserContext();

  const currentSport = useMemo(() => {
    if (!slug) return null;
    return sports.find((s) => slugifySportName(s.title) === slug) ?? null;
  }, [sports, slug]);

  useEffect(() => {
    if (!slug || !currentSport || currentSport.title.toLowerCase() === "e-sports") {
      navigate("/404", { replace: true });
    }
  }, [slug, currentSport, navigate]);

  const thread = useMemo(() => {
    if (!currentSport || !threadId) return null;
    return getThreadById(slugifySportName(currentSport.title), threadId);
  }, [currentSport, threadId]);

  const [reply, setReply] = useState("");
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!currentSport || !thread) return;
    trackEvent("view_item", {
      item_id: thread.id,
      item_name: thread.title,
      sport: currentSport.title,
      source_page: "community_forum",
    });
  }, [currentSport, thread]);

  if (!currentSport) {
    return (
      <div className="sport-page forum-page">
        <h2 className="sport-page-not-found">Loading...</h2>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="sport-page forum-page">
        <div className="sport-page-title">{currentSport.title} Forum</div>
        <section className="sport-page-section">
          <p className="sport-page-text">Thread not found.</p>
          <div className="sport-page-buttons">
            <Link
              to={`/community/${slugifySportName(currentSport.title)}/forum`}
              className="sport-page-btn primary"
            >
              Back to forum
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const handleReply = (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setSubmitStatus("Reply captured locally (mock only). Real posting will come in Phase 2.");
    trackEvent("reply_post", {
      thread_id: thread.id,
      sport: currentSport.title,
      source_page: "community_forum",
    });
    setReply("");
  };

  return (
    <div className="sport-page forum-page">
      <div className="sport-page-title">{currentSport.title} Forum</div>

      <section className="sport-page-section">
        <div className="sport-page-buttons">
          <Link
            to={`/community/${slugifySportName(currentSport.title)}/forum`}
            className="sport-page-btn secondary"
          >
            Back to threads
          </Link>
        </div>

        <article className="forum-post">
          <h2 className="forum-post-title">{thread.title}</h2>
          <div className="forum-post-meta">
            Started by {thread.author} - {formatDate(thread.createdAt)}
          </div>
          <p className="forum-post-body">{thread.body}</p>
        </article>

        <div className="forum-replies">
          {thread.replies.length === 0 ? (
            <p className="forum-help">No replies yet. Be the first to respond.</p>
          ) : (
            thread.replies.map((post) => (
              <div key={post.id} className="forum-post">
                <div className="forum-post-meta">
                  {post.author} - {formatDate(post.createdAt)}
                </div>
                <p className="forum-post-body">{post.content}</p>
              </div>
            ))
          )}
        </div>

        <div className="forum-form">
          {user ? (
            <form onSubmit={handleReply} className="forum-form">
              <label htmlFor="reply" className="forum-help">
                Your reply
              </label>
              <textarea
                id="reply"
                className="forum-textarea"
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Share your take or ask a follow-up..."
                required
              />
              <button type="submit" className="sport-page-btn primary">
                Post reply
              </button>
              {submitStatus && <p className="forum-help">{submitStatus}</p>}
            </form>
          ) : (
            <div className="forum-cta">
              <p className="forum-help">Sign in to post a reply.</p>
              <Link to="/auth" className="sport-page-btn primary">
                Sign in to post
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ThreadDetailPage;
