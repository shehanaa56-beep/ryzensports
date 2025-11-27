import React, { useState } from 'react';
import { useLogin } from './LoginContext';
import { auth } from './firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import './LoginModal.css';

function LoginModal({ isOpen, onClose }) {
  const { login, register, checkUserExists } = useLogin();
  const [isRegister, setIsRegister] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    confirmPassword: ''
  });

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // -------------------------
  // HANDLE INPUT CHANGE
  // -------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  // -------------------------
  // CREATE reCAPTCHA (Fix for your error)
  // -------------------------
  const initRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => {
            console.log("reCAPTCHA Solved");
          }
        }
      );
    }
  };

  // -------------------------
  // SEND OTP TO PHONE
  // -------------------------
  const sendOtp = async () => {
    if (!formData.phone) {
      setError("Please enter phone number");
      return;
    }
    if (!formData.email) {
      setError("Please enter email");
      return;
    }

    const exists = await checkUserExists(formData.username, formData.email);
    if (exists) {
      setError("User already exists");
      return;
    }

    try {
      setError('');
      initRecaptcha();

      // Auto +91
      const phoneNumber = formData.phone.startsWith('+')
        ? formData.phone
        : `+91${formData.phone}`;

      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        window.recaptchaVerifier
      );

      setConfirmationResult(confirmation);
      setOtpSent(true);
      setError("OTP sent to your phone");

    } catch (err) {
      console.error('Phone OTP error:', err);
      setError("Failed to send OTP. Try again with a valid phone number.");
    }
  };

  // -------------------------
  // VERIFY OTP
  // -------------------------
  const verifyOtp = async () => {
    if (!confirmationResult) {
      setError("Please request OTP first");
      return;
    }

    try {
      await confirmationResult.confirm(otp);

      // After OTP success → Register user
      const result = await register(
        formData.username,
        formData.email,
        formData.password,
        formData.phone
      );

      if (result.success) {
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('OTP verification failed:', err);
      setError("Invalid OTP. Try again.");
    }
  };

  // -------------------------
  // SUBMIT FORM
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (isRegister) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      if (!formData.email || !formData.username || !formData.password || !formData.phone) {
        setError("Please fill all fields");
        setIsLoading(false);
        return;
      }

      if (!otpSent) {
        await sendOtp();
        setIsLoading(false);
        return;
      } else {
        await verifyOtp();
        setIsLoading(false);
        return;
      }
    } else {
      const result = await login(formData.username, formData.password);
      if (!result.success) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
    }

    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>

        <div className="modal-header">
          <h2>{isRegister ? "Create an account" : "Log in to your account"}</h2>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>

            {/* Username */}
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter username"
              />
            </div>

            {isRegister && (
              <>
                {/* Email */}
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                  />
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                  />
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                  />
                </div>

                {/* OTP Input */}
                {otpSent && (
                  <div className="form-group">
                    <label>OTP</label>
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                    />
                  </div>
                )}
              </>
            )}

            {/* Password */}
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
              />
            </div>

            {/* Error */}
            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading
                ? "Processing..."
                : isRegister
                  ? otpSent ? "Verify OTP" : "Send OTP"
                  : "Log In"}
            </button>
          </form>

          {/* Toggle */}
          <div className="toggle-form">
            <p>
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                className="toggle-button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  setOtp('');
                  setOtpSent(false);
                  setFormData({
                    username: '',
                    password: '',
                    email: '',
                    phone: '',
                    confirmPassword: ''
                  });
                }}
              >
                {isRegister ? "Log in" : "Sign up"}
              </button>
            </p>
          </div>

          {/* Invisible reCAPTCHA anchor */}
          <div id="recaptcha-container"></div>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
