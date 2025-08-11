import React from 'react';

const IntroductionPage = ({ onSignUpClick, onSignInClick, onGuestClick, successMessage }) => {
  return (
    <div className="container">
      <div className="text-center" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Success Message */}
        {successMessage && (
          <div className="message message-success mb-4">
            <p>{successMessage}</p>
          </div>
        )}

        {/* Hero Section */}
        <div className="card mb-4">
          <div className="text-success" style={{ fontSize: '6rem' }}>🌱</div>
          <h1 className="text-success">Welcome to SortiMate!</h1>
          <p className="text-secondary" style={{ fontSize: '1.2rem' }}>
            Turn recycling into a fun adventure with family competitions and smart bin tracking!
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-2 mb-4">
          <div className="card text-center">
            <div className="text-purple" style={{ fontSize: '3rem' }}>📱</div>
            <h3>Smart Bins</h3>
            <p className="text-secondary">Scan QR codes to track your recycling</p>
          </div>
          <div className="card text-center">
            <div className="text-warning" style={{ fontSize: '3rem' }}>👨‍👩‍👧‍👦</div>
            <h3>Family Challenges</h3>
            <p className="text-secondary">Recycle items and earn points to compete with your family and friends</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-1" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <button className="btn btn-primary btn-lg mb-3" onClick={onSignUpClick}>
            🚀 Get Started
          </button>
          <button className="btn btn-secondary btn-lg mb-3" onClick={onSignInClick}>
            🔑 Sign In
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => {
            console.log('🎯 IntroductionPage: Continue as Guest clicked');
            console.log('🎯 IntroductionPage: onGuestClick function:', onGuestClick);
            onGuestClick();
          }}>
            👤 Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroductionPage; 