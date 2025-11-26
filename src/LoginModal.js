import React, { useState } from 'react';
import { useLogin } from './LoginContext';
import emailjs from '@emailjs/browser';
import './LoginModal.css';

function LoginModal({ isOpen, onClose }) {
  const { login, register, checkUserExists } = useLogin();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };



  const sendOtp = async () => {
    // For email OTP verification
    if (!formData.email) {
      setError('Please enter email address');
      return;
    }

    // Check if user already exists before sending OTP
    const exists = await checkUserExists(formData.username, formData.email);
    if (exists) {
      setError('User already exists');
      return;
    }

    // Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      // Send email using EmailJS
      const templateParams = {
        email: formData.email,
        passcode: generatedOtp,
        time: new Date().toLocaleString()
      };

      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID || 'service_gmail',
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'template_ikbnj7n',
        templateParams,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'GhbnU4GVjsYtlE4Di'
      );

      // Store OTP for verification
      setConfirmationResult({
        confirm: async (otp) => {
          if (otp === generatedOtp) {
            return { user: { email: formData.email } };
          } else {
            throw new Error('Invalid OTP');
          }
        }
      });
      setOtpSent(true);
      setError('OTP sent to your email successfully');
    } catch (error) {
      console.error('Email sending error:', error);
      setError('Failed to send OTP. Please try again.');
    }
  };

  const verifyOtp = async () => {
    try {
      await confirmationResult.confirm(otp);
      // OTP verified, now register the user
      const registerResult = await register(formData.username, formData.email, formData.password);
      if (registerResult.success) {
        onClose();
      } else {
        setError(registerResult.error);
      }
    } catch (error) {
      setError('Invalid OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (isRegister) {
      // Registration logic
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
      if (!formData.email || !formData.username || !formData.password) {
        setError('Please fill all fields');
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
      // Login logic
      const result = await login(formData.username, formData.password);
      if (!result.success) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
    }
    // Close modal after successful submission
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>

        <div className="modal-header">
          <h2>{isRegister ? 'Create an account' : 'Log in to your account'}</h2>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>

            {isRegister && (
              <>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    required
                    autoComplete="new-password"
                  />
                </div>

                {otpSent && (
                  <div className="form-group">
                    <label htmlFor="otp">OTP</label>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      required
                      maxLength="6"
                    />
                  </div>
                )}
              </>
            )}

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (isRegister ? (otpSent ? 'Verify OTP' : 'Send OTP') : 'Log in')}
            </button>
          </form>

          <div className="toggle-form">
            <p>
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
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
                    confirmPassword: ''
                  });
                }}
              >
                {isRegister ? 'Log in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default LoginModal;
