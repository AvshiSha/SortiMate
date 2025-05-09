import React from 'react';
import '../styles/IntroductionPage.css';

const IntroductionPage = ({ onSignUpClick, onSignInClick, successMessage }) => {
  return (
    <div className="introduction-container">
      <div className="welcome-box">
        <h1>Welcome to SortiMate</h1>
        <p>Your smart recycling companion</p>
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
        <div className="features">
          <p>• Easy waste sorting</p>
          <p>• Recycling tips</p>
          <p>• Environmental impact tracking</p>
        </div>
        <div className="auth-buttons">
          <button className="auth-btn signup-btn" onClick={onSignUpClick}>Sign Up</button>
          <button className="auth-btn signin-btn" onClick={onSignInClick}>Sign In</button>
        </div>
      </div>
    </div>
  );
};

export default IntroductionPage; 