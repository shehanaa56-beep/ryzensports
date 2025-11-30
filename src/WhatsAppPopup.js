import React from "react";
import "./WhatsAppPopup.css";

function WhatsAppPopup({ onClose }) {
  const phone = "9037258541"; // your number
  const message = "hey there, I have a query";

  const openWhatsApp = () => {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="wa-popup-container">
      <div className="wa-popup">

        {/* HEADER */}
        <div className="wa-header">
          <span>WhatsApp</span>
          <button className="wa-close" onClick={onClose}>×</button>
        </div>

        {/* BODY */}
        <div className="wa-body">
          <div className="wa-pattern"></div>
        </div>

        {/* MESSAGE BOX */}
        <div className="wa-input-area">
          <input
            type="text"
            value={message}
            readOnly
          />
          <button className="wa-send" onClick={openWhatsApp}>
            ➤
          </button>
        </div>

      </div>
    </div>
  );
}

export default WhatsAppPopup;
