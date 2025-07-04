import React from "react";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  EmailIcon,
} from "react-share";
import { useLocation } from "react-router-dom";
import "../styles/ShareButtons.css"; // Adjust path as needed

interface ShareButtonsProps {
  title: string;
  urlOverride?: string;      // Optional: override share URL
  className?: string;        // Optional: for custom wrapper styling
}

const ShareButtons: React.FC<ShareButtonsProps> = ({
  title,
  urlOverride,
  className = "",
}) => {
  const location = useLocation();
  const url =
    urlOverride || `https://www.athletexpert.org${location.pathname.startsWith("/") ? location.pathname : "/" + location.pathname}`;

  // Define the share options and metadata
  const shareOptions: {
    Component: React.ElementType;
    Icon: React.ElementType;
    props: Record<string, any>;
    aria: string;
  }[] = [
    {
      Component: FacebookShareButton,
      Icon: FacebookIcon,
      props: { url },
      aria: "Share on Facebook",
    },
    {
      Component: TwitterShareButton,
      Icon: TwitterIcon,
      props: { url, title },
      aria: "Share on Twitter (X)",
    },
    {
      Component: LinkedinShareButton,
      Icon: LinkedinIcon,
      props: { url, title, summary: title, source: "AthleteXpert" },
      aria: "Share on LinkedIn",
    },
    {
      Component: EmailShareButton,
      Icon: EmailIcon,
      props: { url, subject: title, body: `Check this out: ${url}` },
      aria: "Share by Email",
    },
  ];

  return (
    <section className={`share-section ${className}`}>
      <div className="share-icons" role="group" aria-label="Share this page">
        {shareOptions.map(({ Component, Icon, props, aria }, index) => (
          <Component key={aria} {...props}>
            <span className="sr-only">{aria}</span>
            <Icon size={40} round title={aria} aria-label={aria} />
          </Component>
        ))}
      </div>
    </section>
  );
};

export default ShareButtons;
