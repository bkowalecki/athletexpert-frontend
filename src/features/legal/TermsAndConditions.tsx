import React from "react";
import { Helmet } from "react-helmet";
import "../../styles/TermsAndConditions.css";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => {
  // Generate ID for in-page links if desired
  const id = title.replace(/\s+/g, "-").toLowerCase();
  return (
    <section className="terms-section" aria-labelledby={id} id={id}>
      <h2 id={id} tabIndex={-1}>{title}</h2>
      {children}
    </section>
  );
};

const TermsAndConditionsPage: React.FC = () => {
  const lastUpdated = new Date("2025-04-27").toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Helmet>
        <title>Terms and Conditions | AthleteXpert</title>
        <meta
          name="description"
          content="Review the Terms and Conditions for using AthleteXpert, including legal disclaimers, age restrictions, and user responsibilities."
        />
        <meta name="robots" content="noindex,follow" />
      </Helmet>

      <div className="terms-container" role="document" aria-label="Terms and Conditions">
        <header className="terms-header" role="banner">
          <h1 tabIndex={0}>Terms and Conditions</h1>
          <p className="terms-last-updated">
            <strong>Last updated:</strong> {lastUpdated}
          </p>
        </header>

        <main className="terms-main" role="main">
          <Section title="1. Introduction">
            <p>
              Welcome to AthleteXpert ("we", "our", "us"). By accessing our
              website, you agree to comply with and be bound by these terms and conditions.
              If you do not agree, you must not use this site.
            </p>
          </Section>

          <Section title="2. Affiliate Links and External Sites">
            <p>
              AthleteXpert provides product recommendations via affiliate links. We do not sell
              products directly. By clicking these links, you’re redirected to third-party sites.
              We are not responsible for content, pricing, or availability on external sites.
              Purchases are governed by those sites’ policies.
            </p>
          </Section>

          <Section title="3. User Data Collection">
            <p>
              AthleteXpert may collect your name, email, and other info when you interact
              with our platform (including newsletter sign-ups or promos). By providing this,
              you agree to allow us to process your data as outlined in our{" "}
              <a href="/privacy-policy">Privacy Policy</a>.
            </p>
            <p>
              We may also use analytics to improve the user experience. This includes
              usage patterns, referral sources, and interaction data.
            </p>
          </Section>

          <Section title="4. Age Restrictions">
            <p>
              AthleteXpert is not directed at children under 13. If you’re under 18, you must
              use the platform under a parent or guardian’s supervision. By using this site, you
              affirm that you’re 18 or older or using it with guardian consent.
            </p>
            <p>
              Some features may require parental consent for users under 18. See our{" "}
              <a href="/privacy-policy">Privacy Policy</a> for more on minors’ data.
            </p>
          </Section>

          <Section title="5. Intellectual Property">
            <p>
              All content on AthleteXpert—text, graphics, logos, video, and code—is owned by us
              or our content suppliers. You may not reproduce, distribute, or create derivative
              works without written permission.
            </p>
          </Section>

          <Section title="6. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, AthleteXpert is not liable for any
              direct, indirect, incidental, or consequential damages arising from use of,
              or inability to use, our platform or affiliate links. This includes errors,
              interruptions, or third-party actions.
            </p>
          </Section>

          <Section title="7. Changes to the Terms">
            <p>
              We may modify these Terms at any time. Updates will be posted on this page
              with a new revision date. Continued use of the platform means you accept the new Terms.
            </p>
          </Section>

          <Section title="8. Governing Law">
            <p>
              These Terms and Conditions are governed by Pennsylvania law, United States,
              and you agree to submit to the exclusive jurisdiction of its courts.
            </p>
          </Section>

          <Section title="9. Contact Us">
            <p>
              If you have any questions, please email:{" "}
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

export default TermsAndConditionsPage;
