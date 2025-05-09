import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { createUserProfile } from '../services/database';
import '../styles/SignUp.css';

const SignUp = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPasswords(!showPasswords);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await createUserProfile(userCredential.user.uid, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      });

      const successMessage = 'Account created successfully! You can now sign in.';
      onSuccess(successMessage);

    } catch (error) {
      console.error('Sign up error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Create Account</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="name-fields">
            <div className="form-group">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
          </div>
          <div className="form-group password-group">
            <input
              type={showPasswords ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={togglePasswordVisibility}
            >
              {showPasswords ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          <div className="form-group password-group">
            <input
              type={showPasswords ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={togglePasswordVisibility}
            >
              {showPasswords ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp; 