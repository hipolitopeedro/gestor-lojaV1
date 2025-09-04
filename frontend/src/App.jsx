import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expense from './pages/Expense';
import BillPayment from './pages/BillPayment';
import AccountsReceivable from './pages/AccountsReceivable';
import './App.css';
import './styles/lupa-theme.css';

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');

  // Make navigation function available globally
  window.navigateTo = setCurrentPage;

  // Render the appropriate page based on current state
  switch (currentPage) {
    case 'login':
      return <LoginPage onNavigate={setCurrentPage} />;
    case 'register':
      return <RegisterPage onNavigate={setCurrentPage} />;
    case 'income':
      return <Income onNavigate={setCurrentPage} />;
    case 'expense':
      return <Expense onNavigate={setCurrentPage} />;
    case 'billpayment':
      return <BillPayment onNavigate={setCurrentPage} />;
    case 'receivables':
      return <AccountsReceivable onNavigate={setCurrentPage} />;
    case 'dashboard':
      return <Dashboard onNavigate={setCurrentPage} />;
    case 'landing':
    default:
      return <LandingPage />;
  }
};

export default App;

