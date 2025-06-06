import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { auth } from './firebase/config';

import IntroductionPage from './components/IntroductionPage';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import UserDashboard from './components/UserDashboard';
import BinScanner from './components/BinScanner';
import BinDetails from './components/BinDetails';

import './App.css';

function AppRouterWrapper() {
  const [successMessage, setSuccessMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const isLoggedIn = !!user;
      setIsAuthenticated(isLoggedIn);

      if (isLoggedIn && location.pathname === '/') {
        navigate('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={
        <IntroductionPage
          onSignUpClick={() => navigate('/signup')}
          onSignInClick={() => navigate('/signin')}
          successMessage={successMessage}
        />
      } />
      <Route path="/signup" element={
        <SignUp
          onBack={() => navigate('/')}
          onSuccess={(msg) => {
            setSuccessMessage(msg);
            navigate('/');
          }}
        />
      } />
      <Route path="/signin" element={
        <SignIn
          onBack={() => navigate('/')}
        />
      } />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/scan" element={<BinScanner />} />
      <Route path="/bin/:binId" element={<BinDetails />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <Router>
        <AppRouterWrapper />
      </Router>
    </div>
  );
}

export default App;
