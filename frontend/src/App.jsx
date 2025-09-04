import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expense from './pages/Expense';
import BillPayment from './pages/BillPayment';
import AccountsReceivable from './pages/AccountsReceivable';
import { Loader2 } from 'lucide-react';
import './App.css';
import './styles/lupa-theme.css';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Make navigation function available globally
  window.navigateTo = setCurrentPage;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show auth flow
  if (!user) {
    return <AuthPage />;
  }

  // Render the appropriate page based on current state
  switch (currentPage) {
    case 'income':
      return <Income onNavigate={setCurrentPage} />;
    case 'expense':
      return <Expense onNavigate={setCurrentPage} />;
    case 'billpayment':
      return <BillPayment onNavigate={setCurrentPage} />;
    case 'receivables':
      return <AccountsReceivable onNavigate={setCurrentPage} />;
    case 'dashboard':
    default:
      return <Dashboard onNavigate={setCurrentPage} />;
  }
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

