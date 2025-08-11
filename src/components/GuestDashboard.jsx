import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AddBottle from './AddBottle';

const GuestDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [redirectBinId, setRedirectBinId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();



  // Handle bin query parameter for QR redirects
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const binId = urlParams.get('bin');
    
    if (binId) {
      // Store the bin ID in state before clearing URL
      setRedirectBinId(binId);
      // Switch to add-bottle tab
      setActiveTab('add-bottle');
      // Clear the query parameter from URL
      navigate('/guest-dashboard', { replace: true });
    }
  }, [location.search, navigate]);

  // Check for redirectBinId in sessionStorage (from QR scan)
  useEffect(() => {
    console.log('🔍 GuestDashboard: Checking sessionStorage for redirectBinId...');
    const storedBinId = sessionStorage.getItem('redirectBinId');
    console.log('🔍 GuestDashboard: Stored binId:', storedBinId);
    console.log('🔍 GuestDashboard: Current redirectBinId state:', redirectBinId);
    
    if (storedBinId) {
      console.log('🔍 GuestDashboard: Found redirectBinId in sessionStorage:', storedBinId);
      setRedirectBinId(storedBinId);
      setActiveTab('add-bottle');
      sessionStorage.removeItem('redirectBinId'); // Clear it after using
      console.log('🔍 GuestDashboard: Cleared sessionStorage');
    } else {
      console.log('🔍 GuestDashboard: No redirectBinId found in sessionStorage');
    }
  }, []); // Run only once on mount

  // Clear redirect bin ID when switching away from add-bottle tab
  useEffect(() => {
    // Only clear redirectBinId if we're switching away from add-bottle AND it wasn't set from a QR redirect
    if (activeTab !== 'add-bottle' && !sessionStorage.getItem('redirectBinId')) {
      setRedirectBinId(null);
    }
  }, [activeTab]);

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const handleSignInClick = () => {
    navigate('/signin');
  };

  const handleLogout = () => {
    // Clear guest session and return to introduction
    sessionStorage.removeItem('guestSession');
    navigate('/');
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="card mb-4">
        <div className="flex-between">
          <div>
            <h1 className="text-success">👤 Guest Mode</h1>
            <p className="text-secondary">Try SortiMate without an account</p>
          </div>
          <div className="flex">
            <button className="btn btn-danger" onClick={handleLogout}>
              🚪 Exit Guest Mode
            </button>
          </div>
        </div>
      </div>



      {/* Tabs */}
      <div className="card">
        <div className="flex" style={{ borderBottom: '2px solid var(--light-gray)', marginBottom: 'var(--spacing-lg)' }}>
          <button 
            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('profile')}
            style={{ marginRight: 'var(--spacing-sm)', borderRadius: 'var(--border-radius-md) 0 0 0' }}
          >
            👤 My Profile
          </button>
          <button 
            className={`btn ${activeTab === 'add-bottle' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              setActiveTab('add-bottle');
              // Only clear redirect bin ID if it wasn't set from a QR redirect
              if (activeTab !== 'add-bottle' && !redirectBinId) {
                setRedirectBinId(null);
              }
            }}
            style={{ marginRight: 'var(--spacing-sm)' }}
          >
            🥤 Add Bottle
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="fade-in">
            <div className="text-center">
              <div className="text-warning" style={{ fontSize: '4rem' }}>👤</div>
              <h2>Guest Profile</h2>
              <p className="text-secondary mb-4">
                You're using SortiMate in guest mode. Sign up to save your progress and join family competitions!
              </p>
              
              <div className="grid grid-2" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <button className="btn btn-primary btn-lg" onClick={handleSignUpClick}>
                  🚀 Sign Up
                </button>
                <button className="btn btn-secondary btn-lg" onClick={handleSignInClick}>
                  🔑 Sign In
                </button>
              </div>
              
              <div className="mt-4">
                <h3>Guest Mode Features:</h3>
                <ul className="text-left" style={{ maxWidth: '400px', margin: '0 auto' }}>
                  <li>✅ Scan QR codes and recycle items</li>
                  <li>✅ Report incorrect identifications</li>
                  <li>✅ Try the recycling experience</li>
                  <li>❌ No points or progress saved</li>
                  <li>❌ No family features</li>
                  <li>❌ Session expires after 2 minutes</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Add Bottle Tab */}
        {activeTab === 'add-bottle' && (
          <div className="fade-in">
            {console.log('🎯 GuestDashboard passing binId to AddBottle:', redirectBinId)}
            
            {/* Debug Info */}
            <div className="card mb-4">
              <div className="text-center">
                <h3>🔍 Debug Info</h3>
                <p><strong>redirectBinId state:</strong> {redirectBinId || 'null'}</p>
                <p><strong>sessionStorage redirectBinId:</strong> {sessionStorage.getItem('redirectBinId') || 'null'}</p>
                <p><strong>Active tab:</strong> {activeTab}</p>
                <p><strong>URL search params:</strong> {new URLSearchParams(location.search).get('bin') || 'null'}</p>
                <p><strong>Current URL:</strong> {window.location.href}</p>
                <p><strong>Component mounted:</strong> {Date.now()}</p>
                
                <hr style={{ margin: '10px 0' }} />
                
                <h4>🔍 QR Flow Debug</h4>
                <p><strong>Expected QR URL:</strong> https://sortimate0.web.app/bin/bin_001</p>
                <p><strong>Current page:</strong> {window.location.pathname}</p>
                <p><strong>Should be on BinPage:</strong> {window.location.pathname.startsWith('/bin/') ? 'YES' : 'NO'}</p>
                
                <button 
                  className="btn btn-outline btn-sm mt-2" 
                  onClick={() => {
                    alert(`SessionStorage check:\nredirectBinId: ${sessionStorage.getItem('redirectBinId') || 'null'}\nAll sessionStorage keys: ${Object.keys(sessionStorage).join(', ')}`);
                  }}
                >
                  🔍 Check SessionStorage
                </button>
                
                <button 
                  className="btn btn-primary btn-sm mt-2 ml-2" 
                  onClick={() => {
                    // Simulate going to BinPage
                    window.location.href = 'https://sortimate0.web.app/bin/bin_001';
                  }}
                >
                  🧪 Test BinPage
                </button>
              </div>
            </div>
            
            <AddBottle 
              onUpdate={() => {}} // No update needed for guests
              userData={{ role: 'guest' }} // Pass guest role
              binId={redirectBinId}
              isGuest={true} // Flag to indicate guest mode
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestDashboard; 