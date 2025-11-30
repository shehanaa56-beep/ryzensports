import React, { useState } from "react";
import WhatsAppPopup from "./WhatsAppPopup";
import "./WhatsAppButton.css";

function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="wa-floating-btn" onClick={() => setOpen(true)}>
        <img src="/images/whast.jpg" alt="WhatsApp" />
      </div>

      {open && <WhatsAppPopup onClose={() => setOpen(false)} />}
    </>
  );
}

export default WhatsAppButton;
