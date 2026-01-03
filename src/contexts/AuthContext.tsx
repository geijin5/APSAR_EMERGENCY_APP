import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {authService} from '../services/AuthService';
import {User, AuthState} from '../types/index';

interface AuthContextType {
  authState: AuthState;
  user: User | null;
  isAuthenticated: boolean;
  isMember: boolean;
  isOfficer: boolean;
  isAdmin: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  loginWith2FA: (emailOrPhone: string, password: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    expiresAt: null,
  });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await authService.initialize();
        const state = authService.getAuthState();
        setAuthState(state);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = async (emailOrPhone: string, password: string) => {
    try {
      await authService.login(emailOrPhone, password);
      const state = authService.getAuthState();
      setAuthState(state);
    } catch (error) {
      throw error;
    }
  };

  const loginWith2FA = async (emailOrPhone: string, password: string, code: string) => {
    try {
      await authService.loginWith2FA(emailOrPhone, password, code);
      const state = authService.getAuthState();
      setAuthState(state);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        expiresAt: null,
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const refreshAuth = async () => {
    try {
      await authService.refreshAccessToken();
      const state = authService.getAuthState();
      setAuthState(state);
    } catch (error) {
      console.error('Auth refresh failed:', error);
    }
  };

  const updateUser = (user: User) => {
    setAuthState(prev => ({
      ...prev,
      user,
    }));
  };

  const value: AuthContextType = {
    authState,
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isMember: authService.isMember(),
    isOfficer: authService.isOfficer(),
    isAdmin: authService.isAdmin(),
    login,
    loginWith2FA,
    logout,
    refreshAuth,
    updateUser,
  };

  if (!initialized) {
    // Return loading state or splash screen
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

