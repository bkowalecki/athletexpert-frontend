import React from "react";
import { Helmet } from "react-helmet";
import "../../styles/TermsAndConditions.css";

const TermsAndConditionsPage: React.FC = () => {
  const lastUpdated = new Date("2025-04-27").toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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
        <h1>Terms and Conditions</h1>
        <p>Last updated: {lastUpdated}</p>

        <h2>1. Introduction</h2>
        <p>
          Welcome to AthleteXpert ("we", "our", "us"). By accessing our website,
          you agree to comply with and be bound by the following terms and
          conditions. Please review these terms carefully. If you do not agree
          to these terms, you must not use this site.
        </p>

        <h2>2. Affiliate Links and External Sites</h2>
        <p>
          AthleteXpert provides product recommendations and showcases sports gear
          and equipment via affiliate links. We do not sell any products directly
          on this platform. By clicking on these links, you will be redirected to
          third-party websites. AthleteXpert is not responsible for the content,
          pricing, policies, or availability of products on external sites. Any
          purchases made through these links are subject to the terms and policies
          of the external websites.
        </p>

        <h2>3. User Data Collection</h2>
        <p>
          AthleteXpert may collect personal information such as your name, email
          address, and other relevant data when you interact with our platform,
          including when you sign up for newsletters or participate in promotional
          events. By providing this information, you agree to allow us to store
          and process your data in accordance with our{" "}
          <a href="/privacy-policy">Privacy Policy</a>.
        </p>
        <p>
          AthleteXpert may also use analytics to understand how users interact
          with our platform to improve the user experience. This information may
          include, but is not limited to, usage patterns, referral sources, and
          interaction data.
        </p>

        <h2>4. Age Restrictions</h2>
        <p>
          AthleteXpert is not directed to children under the age of 13. If you are
          under 18, you must use the platform under the supervision of a parent or
          guardian. By using this site, you affirm that you are either 18 years or
          older or are using this site with the consent of a legal guardian.
        </p>
        <p>
          Certain promotions, advertising, or features of the site may require
          parental consent for users under the age of 18. Please review our{" "}
          <a href="/privacy-policy">Privacy Policy</a> for details on how we handle
          data from minors.
        </p>

        <h2>5. Intellectual Property</h2>
        <p>
          All content and materials on this platform, including but not limited to
          text, graphics, logos, videos, and software, are the intellectual
          property of AthleteXpert or our content suppliers and are protected by
          applicable intellectual property laws. You agree not to reproduce,
          distribute, modify, or create derivative works from any of the content
          on the platform without prior written permission.
        </p>

        <h2>6. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, AthleteXpert shall not be liable
          for any direct, indirect, incidental, special, or consequential damages
          arising from the use of, or inability to use, our platform or affiliate
          links. This includes, but is not limited to, damages resulting from
          errors, omissions, interruptions, defects, delays, or actions of
          third-party websites linked from our platform.
        </p>

        <h2>7. Changes to the Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. Changes will be
          posted on this page with an updated revision date. Continued use of the
          platform after such changes constitutes your acceptance of the new
          Terms.
        </p>

        <h2>8. Governing Law</h2>
        <p>
          These Terms and Conditions are governed by and construed in accordance
          with the laws of the Commonwealth of Pennsylvania, United States, and you
          agree to submit to the exclusive jurisdiction of its courts.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at{" "}
          <a href="mailto:support@athletexpert.com">support@athletexpert.com</a>.
        </p>
      </div>
    </>
  );
};

export default TermsAndConditionsPage;
