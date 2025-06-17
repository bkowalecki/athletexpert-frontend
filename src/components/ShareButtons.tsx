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
import "../../src/styles/ShareButtons.css"; // Adjust the path as necessary

interface ShareButtonsProps {
  title: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ title }) => {
  const location = useLocation();
  const url = `https://www.athletexpert.org${location.pathname}`;

  const shareOptions = [
    {
      Component: FacebookShareButton,
      Icon: FacebookIcon,
      props: { url },
    },
    {
      Component: TwitterShareButton,
      Icon: TwitterIcon,
      props: { url, title },
    },
    {
      Component: LinkedinShareButton,
      Icon: LinkedinIcon,
      props: { url, title, summary: title, source: "AthleteXpert" },
    },
    {
      Component: EmailShareButton,
      Icon: EmailIcon,
      props: { url, subject: title, body: `Check this out: ${url}` },
    },
  ];

  return (
    <section className="share-section">
      <p className="share-label">Share this post:</p>
      <div className="share-icons">
        {shareOptions.map(({ Component, Icon, props }, index) => (
          <Component key={index} {...props}>
            <Icon size={40} round />
          </Component>
        ))}
      </div>
    </section>
  );
};

export default ShareButtons;