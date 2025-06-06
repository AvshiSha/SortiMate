import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { auth } from '../firebase/config';
import '../styles/SignIn.css';
import { useNavigate } from 'react-router-dom';

const signInWithIDAndPassword = async (idNumber, password) => {
  // שלוף את האימייל הפיקטיבי מהת"ז
  const db = getFirestore();
  const q = query(collection(db, 'users'), where('user_id', '==', idNumber));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    throw new Error('No user found with this ID number');
  }
  // צור את האימייל הפיקטיבי
  const fakeEmail = `${idNumber}@sortimate.local`;
  return signInWithEmailAndPassword(auth, fakeEmail, password);
};

const SignIn = ({ onBack }) => {
  const [formData, setFormData] = useState({
    idNumber: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithIDAndPassword(formData.idNumber, formData.password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-box">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Sign In</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              placeholder="ID Number (9 digits)"
              required
              pattern="\d{9}"
            />
          </div>
          <div className="form-group password-group">
            <input
              type={showPassword ? "text" : "password"}
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
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
