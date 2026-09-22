import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';

const AuthContext = createContext();

// Session Timeout: ex.(4 Mins = 240,000 ms) 
const SESSION_TIMEOUT_MS = 60 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const lastActivityRef = useRef(Date.now());
  const throttleTimerRef = useRef(null);

  // Check for logged in user on mount (from localStorage)
  useEffect(() => {
    const loggedInUser = localStorage.getItem('speczone_user');
    if (loggedInUser) {
      try {
        setUser(JSON.parse(loggedInUser));
        lastActivityRef.current = Date.now();
        localStorage.setItem('speczone_last_activity', Date.now().toString());
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
      }
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    lastActivityRef.current = Date.now();
    localStorage.setItem('speczone_user', JSON.stringify(userData));
    localStorage.setItem('speczone_last_activity', Date.now().toString());
  };

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('speczone_user');
    localStorage.removeItem('speczone_last_activity');
    // Directly navigate to Home page
    window.location.href = '/';
  }, []);

  // Update activity timestamp (throttled to once every 2 seconds)
  const recordActivity = useCallback(() => {
    if (!user) return;
    
    const now = Date.now();
    if (!throttleTimerRef.current || now - lastActivityRef.current > 2000) {
      lastActivityRef.current = now;
      localStorage.setItem('speczone_last_activity', now.toString());
    }
  }, [user]);

  // Session Inactivity Monitoring (Auto logout to Home after 4 minutes of idle time)
  useEffect(() => {
    if (!user) return;

    // Listen to user interaction events
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(evt => {
      window.addEventListener(evt, recordActivity, { passive: true });
    });

    // Check inactivity every 2 seconds
    const interval = setInterval(() => {
      const storedLastActivity = parseInt(localStorage.getItem('speczone_last_activity') || '0', 10);
      const effectiveLastActivity = Math.max(lastActivityRef.current, storedLastActivity);
      const idleTime = Date.now() - effectiveLastActivity;

      if (idleTime >= SESSION_TIMEOUT_MS) {
        clearInterval(interval);
        logout(); // Auto-logout directly to Home page
      }
    }, 2000);

    return () => {
      activityEvents.forEach(evt => {
        window.removeEventListener(evt, recordActivity);
      });
      clearInterval(interval);
    };
  }, [user, recordActivity, logout]);

  const updateUser = (updatedData) => {
    setUser(prev => {
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem('speczone_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth Context
export const useAuth = () => {
  return useContext(AuthContext);
};
