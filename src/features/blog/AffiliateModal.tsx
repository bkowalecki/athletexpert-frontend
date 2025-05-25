import React, { useState } from "react";
import "../../styles/AffiliateModal.css";

interface AffiliateModalProps {
  onInsert: (data: { title: string; link: string; imageUrl: string; blurb: string }) => void;
  onClose: () => void;
}

const AffiliateModal: React.FC<AffiliateModalProps> = ({ onInsert, onClose }) => {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [blurb, setBlurb] = useState("");

  const handleSubmit = () => {
    const data: { title: string; link: string; imageUrl: string; blurb: string } = {
      title,
      link,
      imageUrl,
      blurb,
    };
    onInsert(data);
    onClose();
  };
  

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Add Affiliate Product</h2>
        <input
          type="text"
          placeholder="Product Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Affiliate Link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <input
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <textarea
          placeholder="Short blurb"
          value={blurb}
          onChange={(e) => setBlurb(e.target.value)}
        />
        <div className="modal-buttons">
          <button onClick={handleSubmit}>Insert</button>
          <button onClick={onClose} className="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AffiliateModal;
