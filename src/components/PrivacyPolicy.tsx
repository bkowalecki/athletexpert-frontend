import React from "react";
import "../styles/TermsAndConditions.css";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="terms-container">
      <h1>Privacy Policy</h1>
      <p>Last updated: [February 7th, 2025]</p>

      <h2>1. Introduction</h2>
      <p>
        Welcome to AthleteXpert ("we", "our", "us"). This Privacy Policy
        explains how we collect, use, and safeguard your personal information
        when you use our website and services. By using our platform, you agree
        to the terms outlined in this policy.
      </p>

      <h2>2. Information We Collect</h2>
      <p>We collect the following types of information:</p>
      <ul>
        <li>
          <strong>Personal Information:</strong> Includes your name, email,
          profile information, sports interests, and any data provided through
          forms or user interactions.
        </li>
        <li>
          <strong>Usage Data:</strong> Automatically collected data like IP
          address, browser type, pages visited, referral URLs, and timestamps.
        </li>
        <li>
          <strong>Cookies & Tracking Technologies:</strong> Used for analytics,
          session management, and personalized recommendations. See our Cookie
          Policy for more details.
        </li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <ul>
        <li>To provide personalized product recommendations and content.</li>
        <li>To improve website functionality and user experience.</li>
        <li>
          To send newsletters, updates, or promotional offers (with consent).
        </li>
        <li>To monitor platform usage, detect fraud, and enhance security.</li>
      </ul>

      <h2>4. Sharing Your Information</h2>
      <p>We may share your data with:</p>
      <ul>
        <li>
          <strong>Service Providers:</strong> For hosting, analytics, and
          operational support.
        </li>
        <li>
          <strong>Legal Authorities:</strong> When required by law or to protect
          our legal rights.
        </li>
        <li>
          <strong>Affiliate Partners:</strong> Limited data may be shared when
          you interact with affiliate links, governed by the partner’s privacy
          policy.
        </li>
      </ul>

      <h2>5. Cookies and Tracking Technologies</h2>
      <p>
        We use cookies to enhance your browsing experience, analyze site
        traffic, and deliver personalized content. You can manage cookie
        preferences in your browser settings.
      </p>

      <h2>6. Your Data Rights</h2>
      <ul>
        <li>Access, update, or delete your personal information.</li>
        <li>Withdraw consent for data processing at any time.</li>
        <li>Opt-out of marketing communications.</li>
      </ul>

      <h2>7. Data Security</h2>
      <p>
        We implement strict security measures to protect your data, but no
        system is completely secure. We encourage users to maintain strong
        passwords and protect their login credentials.
      </p>

      <h2>8. Third-Party Links</h2>
      <p>
        Our platform contains links to third-party websites. We are not
        responsible for their privacy practices. Please review their policies
        before providing any personal information.
      </p>

      <h2>9. Children's Privacy</h2>
      <p>
        We do not knowingly collect personal data from individuals under the age
        of 13. If we become aware of such data, we will delete it promptly.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. Changes will be posted on
        this page with an updated date. Continued use of the platform signifies
        your acceptance of the revised policy.
      </p>

      <h2>11. Contact Us</h2>
      <p>
        For questions about this Privacy Policy, please contact us at{" "}
        <a href="mailto:support@athletexpert.com">support@athletexpert.com</a>.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
