import React from "react";
import { Helmet } from "react-helmet";
import "../../styles/TermsAndConditions.css";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <section className="terms-section">
    <h2>{title}</h2>
    {children}
  </section>
);

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
      </Helmet>

      <div className="terms-container">
        <header className="terms-header" role="banner">
          <h1>Terms and Conditions</h1>
          <p>Last updated: {lastUpdated}</p>
        </header>

        <main className="terms-main" role="main">
          <Section title="1. Introduction">
            <p>
              Welcome to AthleteXpert ("we", "our", "us"). By accessing our
              website, you agree to comply with and be bound by the following
              terms and conditions. Please review these terms carefully. If you
              do not agree to these terms, you must not use this site.
            </p>
          </Section>

          <Section title="2. Affiliate Links and External Sites">
            <p>
              AthleteXpert provides product recommendations and showcases sports
              gear and equipment via affiliate links. We do not sell any
              products directly on this platform. By clicking on these links,
              you will be redirected to third-party websites. AthleteXpert is
              not responsible for the content, pricing, policies, or
              availability of products on external sites. Any purchases made
              through these links are subject to the terms and policies of the
              external websites.
            </p>
          </Section>

          <Section title="3. User Data Collection">
            <p>
              AthleteXpert may collect personal information such as your name,
              email address, and other relevant data when you interact with our
              platform, including when you sign up for newsletters or
              participate in promotional events. By providing this information,
              you agree to allow us to store and process your data in accordance
              with our <a href="/privacy-policy">Privacy Policy</a>.
            </p>
            <p>
              AthleteXpert may also use analytics to understand how users
              interact with our platform to improve the user experience. This
              information may include, but is not limited to, usage patterns,
              referral sources, and interaction data.
            </p>
          </Section>

          <Section title="4. Age Restrictions">
            <p>
              AthleteXpert is not directed to children under the age of 13. If
              you are under 18, you must use the platform under the supervision
              of a parent or guardian. By using this site, you affirm that you
              are either 18 years or older or are using this site with the
              consent of a legal guardian.
            </p>
            <p>
              Certain promotions, advertising, or features of the site may
              require parental consent for users under the age of 18. Please
              review our <a href="/privacy-policy">Privacy Policy</a> for
              details on how we handle data from minors.
            </p>
          </Section>

          <Section title="5. Intellectual Property">
            <p>
              All content and materials on this platform, including but not
              limited to text, graphics, logos, videos, and software, are the
              intellectual property of AthleteXpert or our content suppliers and
              are protected by applicable intellectual property laws. You agree
              not to reproduce, distribute, modify, or create derivative works
              from any of the content on the platform without prior written
              permission.
            </p>
          </Section>

          <Section title="6. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, AthleteXpert shall not be
              liable for any direct, indirect, incidental, special, or
              consequential damages arising from the use of, or inability to
              use, our platform or affiliate links. This includes, but is not
              limited to, damages resulting from errors, omissions,
              interruptions, defects, delays, or actions of third-party websites
              linked from our platform.
            </p>
          </Section>

          <Section title="7. Changes to the Terms">
            <p>
              We reserve the right to modify these Terms at any time. Changes
              will be posted on this page with an updated revision date.
              Continued use of the platform after such changes constitutes your
              acceptance of the new Terms.
            </p>
          </Section>

          <Section title="8. Governing Law">
            <p>
              These Terms and Conditions are governed by and construed in
              accordance with the laws of the Commonwealth of Pennsylvania,
              United States, and you agree to submit to the exclusive
              jurisdiction of its courts.
            </p>
          </Section>

          <Section title="9. Contact Us">
            <p>
              If you have any questions about these Terms, please contact us at{" "}
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

export default TermsAndConditionsPage;