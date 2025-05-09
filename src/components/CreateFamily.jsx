import React, { useState } from 'react';
import { db } from '../firebase/config';
import { doc, collection, setDoc, updateDoc } from 'firebase/firestore';
import '../styles/CreateFamily.css';

const CreateFamily = ({ onClose, userId }) => {
  const [familyName, setFamilyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= 20) {
      setFamilyName(value);
      setError('');
    } else {
      setError('Family name cannot be longer than 20 characters');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (familyName.trim().length === 0) {
      setError('Family name cannot be empty');
      return;
    }

    if (familyName.length > 20) {
      setError('Family name cannot be longer than 20 characters');
      return;
    }

    setLoading(true);

    try {
      // Create a new family document
      const familyRef = doc(collection(db, 'families'));
      await setDoc(familyRef, {
        name: familyName.trim(),
        createdAt: new Date(),
        createdBy: userId
      });

      // Update the user's document to include family info
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        familyId: familyRef.id,
        isAdmin: true
      });

      onClose();
    } catch (error) {
      console.error('Error creating family:', error);
      setError('Failed to create family. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-family-modal">
      <div className="create-family-content">
        <h2>Create a New Family</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="familyName">
              Family Name
              <span className="character-count">
                {familyName.length}/20
              </span>
            </label>
            <input
              type="text"
              id="familyName"
              value={familyName}
              onChange={handleChange}
              placeholder="Enter family name"
              maxLength={20}
              required
            />
          </div>
          <div className="button-group">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="create-btn" 
              disabled={loading || familyName.trim().length === 0 || familyName.length > 20}
            >
              {loading ? 'Creating...' : 'Create Family'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFamily; 