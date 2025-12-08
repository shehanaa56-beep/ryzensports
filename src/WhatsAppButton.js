import React, { useState } from "react";
import WhatsAppPopup from "./WhatsAppPopup";
import "./WhatsAppButton.css";

function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="wa-floating-btn" onClick={() => setOpen(true)}>
        <img
  src="/images/whast.webp"
  alt="WhatsApp"
  width="60"
  height="60"
  loading="lazy"
  decoding="async"
/>

      </div>

      {open && <WhatsAppPopup onClose={() => setOpen(false)} />}
    </>
  );
}

export default WhatsAppButton;
