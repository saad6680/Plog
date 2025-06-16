import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    return authService.login(email, password)
      .then(result => {
        if (result.success) {
          setUser(result.user);
        }
        return result;
      });
  };

  const register = (userData) => {
    return authService.register(userData)
      .then(result => {
        if (result.success) {
          setUser(result.user);
        }
        return result;
      });
  };

  const logout = () => {
    return authService.logout()
      .then(() => {
        setUser(null);
      });
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

