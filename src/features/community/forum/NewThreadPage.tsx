import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSports } from "../../../context/SportsContext";
import { useUserContext } from "../../../context/UserContext";
import "./Forum.css";
import { slugifySportName } from "../../../util/slug";
import { trackEvent } from "../../../util/analytics";

const NewThreadPage: React.FC = () => {
  const { sport: slug } = useParams<{ sport: string }>();
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

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  if (!currentSport) {
    return (
      <div className="sport-page forum-page">
        <h2 className="sport-page-not-found">Loading...</h2>
      </div>
    );
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setSubmitStatus("Thread captured locally (mock only). Real posting will come in Phase 2.");
    trackEvent("thread_create", {
      sport: currentSport.title,
      source_page: "community_forum",
    });
    setTitle("");
    setBody("");
  };

  return (
    <div className="sport-page forum-page">
      <div className="sport-page-title">Start a {currentSport.title} Thread</div>

      <section className="sport-page-section">
        <div className="sport-page-buttons">
          <Link
            to={`/community/${slugifySportName(currentSport.title)}/forum`}
            className="sport-page-btn secondary"
          >
            Back to forum
          </Link>
        </div>

        {user ? (
          <form onSubmit={handleSubmit} className="forum-form">
            <label htmlFor="thread-title" className="forum-help">
              Thread title
            </label>
            <input
              id="thread-title"
              className="forum-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What do you want to discuss?"
              required
            />
            <label htmlFor="thread-body" className="forum-help">
              Opening post
            </label>
            <textarea
              id="thread-body"
              className="forum-textarea"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Share context, gear details, or questions..."
              required
            />
            <button type="submit" className="sport-page-btn primary">
              Post thread
            </button>
            {submitStatus && <p className="forum-help">{submitStatus}</p>}
          </form>
        ) : (
          <div className="forum-cta">
            <p className="forum-help">Sign in to start a new thread.</p>
            <Link to="/auth" className="sport-page-btn primary">
              Sign in to post
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default NewThreadPage;
