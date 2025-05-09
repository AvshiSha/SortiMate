import React, { useState, useEffect } from 'react';
import { auth } from './firebase/config';
import IntroductionPage from './components/IntroductionPage';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import UserDashboard from './components/UserDashboard';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('intro'); // 'intro', 'signup', or 'signin'
  const [successMessage, setSuccessMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleSignUpClick = () => {
    setSuccessMessage('');
    setCurrentPage('signup');
  };

  const handleSignInClick = () => {
    setSuccessMessage('');
    setCurrentPage('signin');
  };

  const handleBackClick = () => {
    setSuccessMessage('');
    setCurrentPage('intro');
  };

  const handleSignUpSuccess = (message) => {
    setSuccessMessage(message);
    setCurrentPage('intro');
  };

  if (isAuthenticated) {
    return <UserDashboard />;
  }

  return (
    <div className="App">
      {currentPage === 'intro' && (
        <IntroductionPage 
          onSignUpClick={handleSignUpClick} 
          onSignInClick={handleSignInClick}
          successMessage={successMessage}
        />
      )}
      {currentPage === 'signup' && (
        <SignUp onBack={handleBackClick} onSuccess={handleSignUpSuccess} />
      )}
      {currentPage === 'signin' && (
        <SignIn onBack={handleBackClick} />
      )}
    </div>
  );
}

export default App;