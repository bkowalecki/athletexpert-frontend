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

  return (
    <section className="share-section">
      <p className="share-label">Share this post:</p>
      <div className="share-icons">
        <FacebookShareButton url={url}>
          <FacebookIcon size={40} round />
        </FacebookShareButton>
        <TwitterShareButton url={url} title={title}>
          <TwitterIcon size={40} round />
        </TwitterShareButton>
        <LinkedinShareButton url={url} title={title} summary={title} source="AthleteXpert">
          <LinkedinIcon size={40} round />
        </LinkedinShareButton>
        <EmailShareButton url={url} subject={title} body={`Check this out: ${url}`}>
          <EmailIcon size={40} round />
        </EmailShareButton>
      </div>
    </section>
  );
};

export default ShareButtons;
