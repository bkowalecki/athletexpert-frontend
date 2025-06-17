import React from "react";
import { Helmet } from "react-helmet";
import "../../styles/TermsAndConditions.css";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <section className="policy-section">
    <h2>{title}</h2>
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

      <div className="terms-container">
        <header className="policy-header" role="banner">
          <h1>Privacy Policy</h1>
          <p>Last updated: {lastUpdated}</p>
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
                <strong>Personal Information:</strong> Includes your name,
                email, profile information, sports interests, and any data
                provided through forms or user interactions.
              </li>
              <li>
                <strong>Usage Data:</strong> Automatically collected data like
                IP address, browser type, pages visited, referral URLs, and
                timestamps.
              </li>
              <li>
                <strong>Cookies & Tracking Technologies:</strong> Used for
                analytics, session management, and personalized
                recommendations. See our Cookie Policy for more details.
              </li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul>
              <li>To provide personalized product recommendations and content.</li>
              <li>To improve website functionality and user experience.</li>
              <li>
                To send newsletters, updates, or promotional offers (with
                consent).
              </li>
              <li>To monitor platform usage, detect fraud, and enhance security.</li>
            </ul>
          </Section>

          <Section title="4. Sharing Your Information">
            <p>We may share your data with:</p>
            <ul>
              <li>
                <strong>Service Providers:</strong> For hosting, analytics, and
                operational support.
              </li>
              <li>
                <strong>Legal Authorities:</strong> When required by law or to
                protect our legal rights.
              </li>
              <li>
                <strong>Affiliate Partners:</strong> Limited data may be shared
                when you interact with affiliate links, governed by the
                partner’s privacy policy.
              </li>
            </ul>
          </Section>

          <Section title="5. Cookies and Tracking Technologies">
            <p>
              We use cookies to enhance your browsing experience, analyze site
              traffic, and deliver personalized content. You can manage cookie
              preferences in your browser settings. Depending on your location,
              we may also present you with a cookie consent banner upon your
              first visit.
            </p>
          </Section>

          <Section title="6. Your Data Rights">
            <ul>
              <li>Access, update, or delete your personal information.</li>
              <li>Withdraw consent for data processing at any time.</li>
              <li>Opt-out of marketing communications.</li>
            </ul>
          </Section>

          <Section title="7. Data Security and Retention">
            <p>
              We implement strict security measures to protect your data, but no
              system is completely secure. We encourage users to maintain strong
              passwords and protect their login credentials.
            </p>
            <p>
              We retain your personal information only as long as necessary to
              provide our services, comply with legal obligations, resolve
              disputes, and enforce our agreements. When no longer needed, we
              securely delete or anonymize your data.
            </p>
          </Section>

          <Section title="8. Third-Party Links">
            <p>
              Our platform contains links to third-party websites. We are not
              responsible for their privacy practices. Please review their
              policies before providing any personal information.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              We do not knowingly collect personal data from individuals under
              the age of 13. If we become aware of such data, we will delete it
              promptly.
            </p>
          </Section>

          <Section title="10. International Users (GDPR Notice)">
            <p>
              If you are accessing our platform from the European Union (EU) or
              European Economic Area (EEA), you have the following additional
              rights:
            </p>
            <ul>
              <li>The right to access, update, or delete your personal information.</li>
              <li>The right to object to processing of your data.</li>
              <li>The right to data portability.</li>
              <li>The right to lodge a complaint with a supervisory authority.</li>
            </ul>
            <p>
              If you wish to exercise any of these rights, please contact us at{" "}
              <a href="mailto:support@athletexpert.com">
                support@athletexpert.com
              </a>
              .
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this policy from time to time. Changes will be
              posted on this page with an updated date. Continued use of the
              platform signifies your acceptance of the revised policy.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>
              For questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:support@athletexpert.com">
                support@athletexpert.com
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