import React from 'react';
import './Testimonials.css';

const testimonials = [
  { initial: "A", quote: "The jersey quality is insane! Stitching and fit are perfect.", name: "Aman" },
  { initial: "R", quote: "Received my full sleeve jersey—premium material and super comfortable!", name: "Rayan" },
  { initial: "R", quote: "Loved the embroidery detailing, totally worth it!", name: "Riya" },
  { initial: "F", quote: "Amazing custom printing. Colors look exactly like originals!", name: "Farsy" },
  { initial: "D", quote: "Fast delivery and top-notch quality. Will order again!", name: "Diyad" },
  { initial: "F", quote: "Retro jersey is my new favourite. Perfect fit!", name: "Fahlah" }
];

const Testimonials = () => {
  return (
    <section className="testimonials">
      <h2>What Our Customers Say</h2>
      <p className="subtitle">10,000+ happy jersey lovers</p>

      <div className="testimonial-cards">
        {testimonials.map((t, index) => (
          <div key={index} className="testimonial-card">
            <div className="initial-circle">{t.initial}</div>
            <p className="quote">"{t.quote}"</p>
            <p className="name">— {t.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
