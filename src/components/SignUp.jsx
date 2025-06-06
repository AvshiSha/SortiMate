// ✅ SignUp.jsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getFirestore, doc, setDoc, getDoc, getDocs, query, collection, where } from 'firebase/firestore';
import '../styles/SignUp.css';

const isValidIsraeliID = (id) => {
  id = String(id).trim();
  if (id.length !== 9 || !/^\d+$/.test(id)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let num = +id[i] * ((i % 2) + 1);
    if (num > 9) num -= 9;
    sum += num;
  }
  return sum % 10 === 0;
};

const SignUp = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const db = getFirestore();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => setShowPasswords(!showPasswords);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { firstName, lastName, idNumber, email, password, confirmPassword } = formData;

    if (!isValidIsraeliID(idNumber)) {
      setError('Invalid ID number');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const existingUser = await getDocs(query(collection(db, 'users'), where('user_id', '==', idNumber)));
      if (!existingUser.empty) {
        setError('A user with this ID already exists');
        setLoading(false);
        return;
      }

      const fakeEmail = `${idNumber}@sortimate.local`;
      const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, password);
      const { uid } = userCredential.user;
      const userRef = doc(db, 'users', uid);

      await setDoc(userRef, {
        user_id: idNumber,
        auth_uid: uid,
        first_name: firstName,
        last_name: lastName,
        email,
        created_at: new Date(),
        recycle_stats: { aluminium: 0, glass: 0, other: 0, plastic: 0 },
        total_points: 0,
        items_recycled: 0,
        family: { group_id: '', is_current_winner: false, total_wins: 0 },
        role: 'user',
        last_activity: new Date()
      });

      onSuccess('Account created successfully! You can now sign in.');

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
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              placeholder="ID (9 digits)"
              required
              pattern="\d{9}"
            />
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
