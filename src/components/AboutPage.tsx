import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import "../styles/AboutPage.css";

/** Simple count-up on scroll into view (respects reduced motion) */
const useCountUp = (end: number, duration = 1200) => {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Guard for non-browser/test environments
    if (typeof window === "undefined") {
      el.textContent = String(end);
      return;
    }

    const formatter = new Intl.NumberFormat(undefined);

    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    if (reduceMotion) {
      el.textContent = formatter.format(end);
      return;
    }

    // If IntersectionObserver isn't available, just set final value (no regression risk)
    if (typeof window.IntersectionObserver === "undefined") {
      el.textContent = formatter.format(end);
      return;
    }

    let startTime: number | null = null;
    let rafId: number | null = null;
    let started = false;

    const onFrame = (t: number) => {
      if (startTime === null) startTime = t;
      const p = Math.min(1, (t - startTime) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const val = Math.round(end * eased);
      el.textContent = formatter.format(val);

      if (p < 1) {
        rafId = window.requestAnimationFrame(onFrame);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (started) return;
        if (entries.some((e) => e.isIntersecting)) {
          started = true;
          rafId = window.requestAnimationFrame(onFrame);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [end, duration]);

  return ref;
};

const NOW_FEATURES = [
  {
    title: "Curated Gear Picks",
    desc: "Tested, trusted product guides across popular sports.",
    icon: "🏅",
  },
  {
    title: "Community Threads",
    desc: "Reddit-style sport hubs with weekly polls and discussion.",
    icon: "💬",
  },
  {
    title: "Training Insights",
    desc: "Digestible tips, drills, and playbooks from real athletes.",
    icon: "📚",
  },
] as const;

const ROADMAP = [
  {
    title: "Partner Spots",
    desc: "Rotating featured placements for small brands.",
    tag: "Beta",
  },
  {
    title: "Athlete Profiles",
    desc: "Follow athletes, share progress, and build your rep.",
    tag: "Planned",
  },
  {
    title: "Personalized Recs",
    desc: "AI-powered gear picks tuned to you and your sport.",
    tag: "Planned",
  },
  {
    title: "Event/Meetup Boards",
    desc: "Local runs, open gyms, and tournament listings.",
    tag: "Research",
  },
] as const;

const FAQ = [
  {
    q: "Is AthleteXpert free?",
    a: "Yes. Core community features and content are free. Partner placements and pro tools will be optional add-ons later.",
  },
  {
    q: "How do I become a featured partner?",
    a: "Start on our Partners page. We’re piloting case studies with small brands before formal contracts.",
  },
  {
    q: "What makes your product picks trustworthy?",
    a: "We combine hands-on testing, athlete feedback, and data signals. If we wouldn’t use it ourselves, it doesn’t make the list.",
  },
] as const;

const testimonials = [
  {
    text:
      "AthleteXpert helped me cut through the noise and focus on drills that actually moved the needle.",
    author: "Jordan M., D1 Guard",
  },
  {
    text:
      "The community vibe is legit. Picked up better gear and a few training partners.",
    author: "Priya K., Weekend Triathlete",
  },
] as const;

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const usersRef = useCountUp(5400);
  const postsRef = useCountUp(12800);
  const partnersRef = useCountUp(24);

  return (
    <main className="about-page-container" role="main">
      <Helmet>
        <title>About AthleteXpert | Train Smarter. Gear Better. Together.</title>
        <meta
          name="description"
          content="AthleteXpert blends community, expert picks, and data-backed training to help athletes level up. See what we offer today and what’s coming next."
        />
      </Helmet>

      {/* Hero */}
      <section className="about-page-hero-section">
        <div className="about-page-hero-content">
          <p className="about-page-eyebrow" aria-hidden="true">
            Athlete-led. Data-driven.
          </p>
          <h1 className="about-page-hero-title">
            The Future of Sports Innovation
          </h1>
          <p className="about-page-hero-description">
            We’re building the most helpful corner of the internet for athletes:
            honest gear picks, practical training insights, and a community that
            actually shows up for each other.
          </p>
          <div className="about-page-cta-row">
            <button
              type="button"
              className="about-page-hero-button primary"
              onClick={() => navigate("/auth")}
            >
              Join the Community
            </button>
            <button
              type="button"
              className="about-page-hero-button outline"
              onClick={() => navigate("/partners")}
            >
              Partner With Us
            </button>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="about-page-kpis" aria-label="Community impact">
        <div className="kpi">
          <span ref={usersRef} className="kpi-value" aria-label="Estimated users">
            0
          </span>
          <span className="kpi-label">Athletes Reached</span>
        </div>
        <div className="kpi">
          <span ref={postsRef} className="kpi-value" aria-label="Posts and comments">
            0
          </span>
          <span className="kpi-label">Posts & Comments</span>
        </div>
        <div className="kpi">
          <span ref={partnersRef} className="kpi-value" aria-label="Brand partners">
            0
          </span>
          <span className="kpi-label">Brand Partners</span>
        </div>
      </section>

      {/* What we offer now */}
      <section className="about-page-sections" aria-labelledby="offer-title">
        <h2 id="offer-title" className="about-page-section-title">
          What You Get Today
        </h2>
        <div className="about-page-cards">
          {NOW_FEATURES.map((f) => (
            <article className="about-page-card" key={f.title}>
              <div className="about-page-card-icon" aria-hidden="true">
                {f.icon}
              </div>
              <h3 className="about-page-card-title">{f.title}</h3>
              <p className="about-page-card-description">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="about-page-roadmap" aria-labelledby="roadmap-title">
        <h2 id="roadmap-title" className="about-page-section-title">
          Where We’re Headed
        </h2>
        <div className="about-page-roadmap-grid">
          {ROADMAP.map((item) => (
            <article className="roadmap-card" key={item.title}>
              <span className={`roadmap-tag ${item.tag.toLowerCase()}`}>
                {item.tag}
              </span>
              <h3 className="roadmap-title">{item.title}</h3>
              <p className="roadmap-desc">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section
        className="about-page-testimonial-section"
        aria-labelledby="testimonials-title"
      >
        <h2 id="testimonials-title" className="about-page-section-title">
          What Athletes Say
        </h2>
        <div className="about-page-testimonials">
          {testimonials.map((t, i) => (
            <figure className="about-page-testimonial-card" key={i}>
              <blockquote className="about-page-testimonial-text">
                “{t.text}”
              </blockquote>
              <figcaption className="about-page-testimonial-author">
                — {t.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="about-page-faq" aria-labelledby="faq-title">
        <h2 id="faq-title" className="about-page-section-title">
          FAQ
        </h2>
        <div className="faq-list">
          {FAQ.map((item) => (
            <details className="faq-item" key={item.q}>
              <summary className="faq-q">{item.q}</summary>
              <p className="faq-a">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="about-page-final-cta" aria-label="Get started">
        <div className="final-cta-card">
          <h2 className="final-cta-title">Ready to level up?</h2>
          <p className="final-cta-sub">
            Join free, vote in weekly polls, and get smarter about your sport.
            If you’re a brand, let’s build something athletes actually love.
          </p>
          <div className="about-page-cta-row">
            <button
              type="button"
              className="about-page-hero-button primary"
              onClick={() => navigate("/auth")}
            >
              Join Free
            </button>
            <button
              type="button"
              className="about-page-hero-button outline light"
              onClick={() => navigate("/partners")}
            >
              Partner Inquiry
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
