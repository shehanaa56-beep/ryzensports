import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import './CustomerSupport.css';

function CustomerSupport() {
  const [formData, setFormData] = useState({
    email: '',
    helpType: '',
    whatsappNumber: '',
    orderId: '',
    enquiry: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submissionData = {
        ...formData,
        createdAt: new Date()
      };
      await addDoc(collection(db, 'supportSubmissions'), submissionData);
      console.log('Form submitted:', formData);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const helpOptions = [
    'Product details',
    'Delivery details',
    'Need Refund',
    'Need exchange',
    'Need help with ordering a product',
    'Need item in bulk',
    'Reselling',
    'My enquiry is not listed',
    'Staff behaviour'
  ];

  if (submitted) {
    return (
      <div className="customer-support-container">
        <div className="form-container">
          <div className="success-message">
            <h2>Thank you for your enquiry!</h2>
            <p>Your support request has been submitted successfully. We will get back to you within 24 hours.</p>
            <button
              className="submit-btn"
              onClick={() => setSubmitted(false)}
            >
              Submit Another Enquiry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-support-container">
      <div className="form-container">
        <div className="form-header">
          <h1>Customer Support Form</h1>
          <p className="form-description">
            Please make sure you have your order details (Order ID, Email, or Phone Number) ready before starting the support request.
            This will help us resolve your query faster and more accurately.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="support-form">
          {/* Email Collection */}
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Your email address"
              />
            </div>
          </div>

          {/* Help Type */}
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">
                Need help with? <span className="required">*</span>
              </label>
              <select
                name="helpType"
                value={formData.helpType}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value="">Choose an option</option>
                {helpOptions.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* WhatsApp Number */}
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">
                Contact number – WhatsApp
              </label>
              <p className="field-description">Please enter your active WhatsApp number for faster communication.</p>
              <input
                type="tel"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleInputChange}
                className="form-input"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Order ID */}
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">
                Order ID – (can skip this if you didn't order yet)
              </label>
              <p className="field-description">Enter your order ID to help us identify your purchase.</p>
              <input
                type="text"
                name="orderId"
                value={formData.orderId}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., ORD-123456"
              />
            </div>
          </div>

          {/* Enquiry Description */}
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">
                Describe your enquiry <span className="required">*</span>
              </label>
              <p className="field-description">Provide detailed information about your issue or request.</p>
              <textarea style={{backgroundColor: '#f9f5f5'}}
                name="enquiry"
                value={formData.enquiry}
                onChange={handleInputChange}
                required
                className="form-textarea"
                rows="6"
                placeholder="Please describe your enquiry in detail..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-section">
            <button type="submit" className="submit-btn">
              Submit
            </button>
          </div>

          {/* Footer */}
          <div className="form-footer">
            <p>
              Check out <a href="/faq" className="faq-link">FAQ</a> for quick answers → FAQ Frequently asked questions
            </p>
            <p className="disclaimer">
              * Indicates required question
            </p>
            <p className="google-disclaimer">
              Never submit passwords through Google Forms.
            </p>
            <p className="google-disclaimer">
              This content is neither created nor endorsed by Google.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerSupport;
