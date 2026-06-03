import React, { createContext, useState, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('admin');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      setUser(response.data.admin);
      localStorage.setItem('admin', JSON.stringify(response.data.admin));
    }
    return response.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}