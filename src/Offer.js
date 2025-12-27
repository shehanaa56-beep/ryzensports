import React, { useState, useEffect } from 'react';

function Offer() {
  const messages = [
    "Free Shipping For ALL",
    "New Arrivals Just Dropped!",
    "LIMITED EDITION COLLECTION AVAILABLE NOW"
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="offer-bar">
      <p>{messages[currentMessageIndex]}</p>
    </div>
  );
}

export default Offer;
