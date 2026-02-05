import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, login as apiLogin, logout as apiLogout } from '../lib/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Use localStorage first
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_cache');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      localStorage.setItem('user_cache', JSON.stringify(userData));
    } catch (err) {
      setUser(null);
      localStorage.removeItem('user_cache');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Background validation
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const userData = await apiLogin(email, password);
    setUser(userData);
    localStorage.setItem('user_cache', JSON.stringify(userData));
    return userData;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    localStorage.removeItem('user_cache');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
