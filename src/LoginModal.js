import React, { useState } from 'react';
import { useLogin } from './LoginContext';
import './LoginModal.css';

function LoginModal({ isOpen, onClose }) {
  const { login, register, checkUserExists } = useLogin();

  const [isRegister, setIsRegister] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (isRegister) {
      // Check required fields
      if (!formData.username || !formData.email || !formData.phone || !formData.password) {
        setError("Please fill all fields");
        setIsLoading(false);
        return;
      }

      // Check password match
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      // Check if user exists
      const exists = await checkUserExists(formData.username, formData.email);
      if (exists) {
        setError("User already exists");
        setIsLoading(false);
        return;
      }

      // Register without OTP
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

      setIsLoading(false);
      return;
    }

    // LOGIN
    const result = await login(formData.username, formData.password);

    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    onClose();
  };

  // Close modal on backdrop click
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
                  ? "Sign Up"
                  : "Log In"}
            </button>
          </form>

          {/* Toggle between login/signup */}
          <div className="toggle-form">
            <p>
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                className="toggle-button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  setFormData({
                    username: '',
                    email: '',
                    phone: '',
                    password: '',
                    confirmPassword: ''
                  });
                }}
              >
                {isRegister ? "Log in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
