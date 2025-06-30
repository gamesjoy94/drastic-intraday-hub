
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  currentUser: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Predefined credentials
const VALID_CREDENTIALS = [
  { username: 'admin', password: 'letmein123' },
  { username: 'user1', password: 'pass456' }
];

// Session management
const SESSION_STORAGE_KEY = 'active_sessions';
const CURRENT_SESSION_KEY = 'current_session';

interface ActiveSession {
  username: string;
  sessionId: string;
  timestamp: number;
}

const generateSessionId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const getActiveSessions = (): ActiveSession[] => {
  try {
    const sessions = localStorage.getItem(SESSION_STORAGE_KEY);
    return sessions ? JSON.parse(sessions) : [];
  } catch {
    return [];
  }
};

const setActiveSessions = (sessions: ActiveSession[]) => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
};

const getCurrentSessionId = (): string | null => {
  return localStorage.getItem(CURRENT_SESSION_KEY);
};

const setCurrentSessionId = (sessionId: string) => {
  localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
};

const removeCurrentSession = () => {
  localStorage.removeItem(CURRENT_SESSION_KEY);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Check for session conflicts on component mount and visibility change
  useEffect(() => {
    const checkSessionValidity = () => {
      const currentSessionId = getCurrentSessionId();
      const activeSessions = getActiveSessions();
      
      if (currentSessionId && isAuthenticated && currentUser) {
        const currentSession = activeSessions.find(
          session => session.username === currentUser && session.sessionId === currentSessionId
        );
        
        // If current session is not in active sessions, force logout
        if (!currentSession) {
          console.log('Session invalidated - logging out');
          forceLogout();
        }
      }
    };

    // Check session validity when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkSessionValidity();
      }
    };

    // Check session validity every 5 seconds
    const interval = setInterval(checkSessionValidity, 5000);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Initial check
    checkSessionValidity();

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, currentUser]);

  const forceLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    removeCurrentSession();
  };

  const login = (username: string, password: string): boolean => {
    const isValid = VALID_CREDENTIALS.some(
      cred => cred.username === username && cred.password === password
    );

    if (isValid) {
      const newSessionId = generateSessionId();
      const activeSessions = getActiveSessions();
      
      // Remove any existing sessions for this user
      const filteredSessions = activeSessions.filter(
        session => session.username !== username
      );
      
      // Add new session
      const newSession: ActiveSession = {
        username,
        sessionId: newSessionId,
        timestamp: Date.now()
      };
      
      filteredSessions.push(newSession);
      setActiveSessions(filteredSessions);
      setCurrentSessionId(newSessionId);
      
      setIsAuthenticated(true);
      setCurrentUser(username);
      
      console.log(`New session created for ${username}. Previous sessions terminated.`);
      return true;
    }
    return false;
  };

  const logout = () => {
    const currentSessionId = getCurrentSessionId();
    const activeSessions = getActiveSessions();
    
    // Remove current session from active sessions
    const filteredSessions = activeSessions.filter(
      session => session.sessionId !== currentSessionId
    );
    
    setActiveSessions(filteredSessions);
    forceLogout();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
