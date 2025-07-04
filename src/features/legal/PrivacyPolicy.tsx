import React from "react";
import { Helmet } from "react-helmet";
import "../../styles/TermsAndConditions.css";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <section className="policy-section" aria-labelledby={title.replace(/\s+/g, "-").toLowerCase()}>
    <h2 id={title.replace(/\s+/g, "-").toLowerCase()}>{title}</h2>
    {children}
  </section>
);

const PrivacyPolicy: React.FC = () => {
  const lastUpdated = new Date("2025-04-27").toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Helmet>
        <title>Privacy Policy | AthleteXpert</title>
        <meta
          name="description"
          content="Learn how AthleteXpert collects, uses, and protects your personal data."
        />
      </Helmet>
      <div className="terms-container" role="document" aria-label="Privacy Policy">
        <header className="policy-header" role="banner">
          <h1 tabIndex={0}>Privacy Policy</h1>
          <p className="policy-last-updated">
            <strong>Last updated:</strong> {lastUpdated}
          </p>
        </header>
        <main className="policy-main" role="main">
          <Section title="1. Introduction">
            <p>
              Welcome to AthleteXpert ("we", "our", "us"). This Privacy Policy
              explains how we collect, use, and safeguard your personal
              information when you use our website and services. By using our
              platform, you agree to the terms outlined in this policy.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>We collect the following types of information:</p>
            <ul>
              <li>
                <strong>Personal Information:</strong> Your name,
                email, profile info, sports interests, and any data you submit.
              </li>
              <li>
                <strong>Usage Data:</strong> Like IP, browser, pages visited, referral, and timestamps.
              </li>
              <li>
                <strong>Cookies & Tracking:</strong> For analytics, session management, and personalized recs.
              </li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul>
              <li>Personalized recommendations and content.</li>
              <li>Improve website and user experience.</li>
              <li>Send newsletters or offers (with consent).</li>
              <li>Detect fraud and enhance security.</li>
            </ul>
          </Section>

          <Section title="4. Sharing Your Information">
            <p>We may share your data with:</p>
            <ul>
              <li><strong>Service Providers:</strong> For hosting, analytics, or operational support.</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect rights.</li>
              <li><strong>Affiliate Partners:</strong> Limited data when you interact with affiliate links.</li>
            </ul>
          </Section>

          <Section title="5. Cookies and Tracking Technologies">
            <p>
              We use cookies to enhance your experience, analyze traffic, and deliver personalized content. 
              You can manage preferences in your browser settings. Depending on location, you may see a cookie consent banner on first visit.
            </p>
          </Section>

          <Section title="6. Your Data Rights">
            <ul>
              <li>Access, update, or delete your data.</li>
              <li>Withdraw consent anytime.</li>
              <li>Opt-out of marketing emails.</li>
            </ul>
          </Section>

          <Section title="7. Data Security and Retention">
            <p>
              We use strict security measures, but no system is 100% secure. Use strong passwords and protect your login.
            </p>
            <p>
              We retain personal info as long as necessary. Once not needed, we delete or anonymize it securely.
            </p>
          </Section>

          <Section title="8. Third-Party Links">
            <p>
              Our platform contains third-party links. We are not responsible for their privacy practices—review their policies before sharing info.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              We do not knowingly collect data from children under 13. If we become aware of such data, we will delete it promptly.
            </p>
          </Section>

          <Section title="10. International Users (GDPR Notice)">
            <p>
              If you access from the EU or EEA, you have these additional rights:
            </p>
            <ul>
              <li>Access, update, or delete your data.</li>
              <li>Object to data processing.</li>
              <li>Data portability.</li>
              <li>File a complaint with your authority.</li>
            </ul>
            <p>
              To exercise these rights, email:{" "}
              <a href="mailto:contact@athletexpert.com">
                contact@athletexpert.com
              </a>
              .
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this policy. Changes will be posted here with the new date. Continued use means you accept the update.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>
              For questions about this policy, email:{" "}
              <a href="mailto:contact@athletexpert.com">
                contact@athletexpert.com
              </a>
              .
            </p>
          </Section>
        </main>
      </div>
    </>
  );
};

export default PrivacyPolicy;
