'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, validateSession, signOutFromFirebase, createSession, refreshSession } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount and set up periodic validation
  useEffect(() => {
    const checkSession = () => {
      try {
        const sessionToken = localStorage.getItem('basewave_session');
        
        if (sessionToken) {
          const sessionUser = validateSession(sessionToken);
          if (sessionUser) {
            setUser(sessionUser);
            console.log('Session restored from localStorage');
          } else {
            // Session expired or invalid, clear it
            localStorage.removeItem('basewave_session');
            console.log('Session expired, cleared from localStorage');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        localStorage.removeItem('basewave_session');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Check session validity every 5 minutes while app is running
    const sessionCheckInterval = setInterval(() => {
      const sessionToken = localStorage.getItem('basewave_session');
      if (sessionToken) {
        const sessionUser = validateSession(sessionToken);
        if (!sessionUser) {
          console.log('Session expired during runtime, logging out');
          setUser(null);
          localStorage.removeItem('basewave_session');
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(sessionCheckInterval);
  }, []);

  // Auto-refresh session on user activity (every hour if active)
  useEffect(() => {
    let lastActivityTime = Date.now();
    
    const handleUserActivity = () => {
      lastActivityTime = Date.now();
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Check every hour if user has been active in the last hour, refresh session
    const activityCheckInterval = setInterval(() => {
      if (user && Date.now() - lastActivityTime < 60 * 60 * 1000) { // Active in last hour
        refreshSession(user);
      }
    }, 60 * 60 * 1000); // Check every hour

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
      clearInterval(activityCheckInterval);
    };
  }, [user]);

  const login = (userData: User) => {
    // Create and store session token for 24-hour persistence
    const sessionToken = createSession(userData);
    localStorage.setItem('basewave_session', sessionToken);
    setUser(userData);
    console.log('User logged in, session created for 24 hours');
  };

  const logout = async () => {
    // Sign out from Firebase if user has Firebase auth
    if (user?.firebaseUser) {
      await signOutFromFirebase();
    }
    
    // Clear user data immediately
    setUser(null);
    localStorage.removeItem('basewave_session');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}