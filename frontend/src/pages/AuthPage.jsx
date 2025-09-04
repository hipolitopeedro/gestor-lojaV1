import React, { useEffect } from 'react';
import LandingPage from './LandingPage';

const AuthPage = () => {
  useEffect(() => {
    window.navigateTo('dashboard');
  }, []);

  return (
    <LandingPage />
  );
};

export default AuthPage;


