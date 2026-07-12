import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check for logged in user on mount (from localStorage)
  useEffect(() => {
    const loggedInUser = localStorage.getItem('speczone_user');
    if (loggedInUser) {
      try {
        setUser(JSON.parse(loggedInUser));
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('speczone_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('speczone_user');
    // Optionally redirect to home on logout
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth Context
export const useAuth = () => {
  return useContext(AuthContext);
};
