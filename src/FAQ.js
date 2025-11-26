import React, { useState } from 'react';
import './FAQ.css';

function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "How long does shipping take?",
      answer: "Standard shipping typically takes 5-7 business days within the continental US. Express shipping options are available at checkout for delivery within 2-3 business days. International shipping times vary by destination, usually 10-14 business days. You'll receive a tracking number once your order ships."
    },
    {
      question: "What is your return policy?",
      answer: "We accept returns within 30 days of delivery. Items must be unworn, unwashed, and in original condition with all tags attached. Mystery Box items are final sale and cannot be returned. To initiate a return, contact our customer support team and we'll provide you with a return label."
    },
    {
      question: "Are the jerseys authentic?",
      answer: "Yes! All our jerseys are 100% authentic vintage pieces. We carefully source our inventory from reputable collectors and verified suppliers. Each item is thoroughly inspected for authenticity before being listed. We stand behind the quality and authenticity of every product we sell."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order ships, you'll receive an email with a tracking number and a link to track your package. You can also log into your account on our website and view your order history to see tracking information. If you have any issues with tracking, please contact our customer support team."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to most countries worldwide! International shipping rates and delivery times vary by destination. Please note that international orders may be subject to customs fees and import duties, which are the responsibility of the customer. These fees are not included in our shipping charges."
    }
  ];

  return (
    <div className="faq-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="underline"></div>
      </section>

      {/* FAQ Section */}
      <div className="faq-container">
        {faqData.map((item, index) => (
          <div key={index} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
            <div className="faq-question" onClick={() => toggleFAQ(index)}>
              <h3>{item.question}</h3>
              <span className="chevron">⌄</span>
            </div>
            <div className="faq-answer">
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQ;
