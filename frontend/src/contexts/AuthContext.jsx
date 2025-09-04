import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ username: 'Demo User' });
  const [credentials, setCredentials] = useState('democredentials');
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setUser({ username });
    setCredentials(`${username}:${password}`);
    return { success: true };
  };

  const register = async (username, email, password) => {
    setUser({ username });
    setCredentials(`${username}:${password}`);
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    setCredentials(null);
  };

  const updateProfile = async (userData) => {
    setUser(userData);
    return { success: true };
  };

  const value = {
    user,
    credentials,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

