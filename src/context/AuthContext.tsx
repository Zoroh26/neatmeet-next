"use client";
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout } from '../services/api';
import type { Employee, LoginCredentials } from '../types';

type AuthContextType = {
  user: Employee | null;
  login: (credentials: LoginCredentials) => Promise<Employee | null>;
  logout: () => void;
  updateUser: (updatedUser: Employee) => void;
  needsPasswordChange: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Employee | null>(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const saved = sessionStorage.getItem('currentUser');
      if (saved) {
        try {
          const sessionData = JSON.parse(saved);
          return sessionData.user || null;
        } catch {
          sessionStorage.removeItem('currentUser');
          return null;
        }
      }
    }
    return null;
  });

  // Check if user needs to change password
  const needsPasswordChange = user?.isInitialPassword === true;

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await apiLogin(credentials);
      if (response.data.success && response.data.data) {
        const sessionData = {
          user: response.data.data.user,
          token: response.data.data.token
        };
        // Ensure user role is present and is 'admin' or 'employee'
        if (!sessionData.user.role || (sessionData.user.role !== 'admin' && sessionData.user.role !== 'employee')) {
          throw new Error('Invalid user role. Access denied.');
        }
        sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
        setUser(response.data.data.user);
        // Also try to extract token from Set-Cookie header if present
        const setCookieHeader = response.headers['set-cookie'];
        if (setCookieHeader) {
          // Backend also set cookie
        }
        return response.data.data.user;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      // Clear any invalid session data
      sessionStorage.removeItem('currentUser');
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    sessionStorage.removeItem('currentUser');
  };

  const updateUser = (updatedUser: Employee) => {
    setUser(updatedUser);
    // Also update sessionStorage
    const sessionData = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    if (sessionData) {
      sessionData.user = updatedUser;
      sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, needsPasswordChange }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;