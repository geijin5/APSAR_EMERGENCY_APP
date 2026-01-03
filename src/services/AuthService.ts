import EncryptedStorage from 'react-native-encrypted-storage';
import axios, {AxiosInstance} from 'axios';
import {AuthState, User, UserRole} from '../types/index';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  AUTH_EXPIRES_AT: 'auth_expires_at',
};

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.anaconda-deerlodge-emergency.gov';

class AuthService {
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    expiresAt: null,
  };

  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to attach auth token
    this.apiClient.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token refresh
    this.apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshed = await this.refreshAccessToken();
            if (refreshed) {
              originalRequest.headers.Authorization = `Bearer ${this.authState.token}`;
              return this.apiClient(originalRequest);
            }
          } catch (refreshError) {
            await this.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Initialize auth service and load stored auth state
   */
  async initialize(): Promise<void> {
    try {
      const token = await EncryptedStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const refreshToken = await EncryptedStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const userData = await EncryptedStorage.getItem(STORAGE_KEYS.USER_DATA);
      const expiresAt = await EncryptedStorage.getItem(STORAGE_KEYS.AUTH_EXPIRES_AT);

      if (token && userData) {
        const expiresAtDate = expiresAt ? new Date(expiresAt) : null;

        // Check if token is expired
        if (expiresAtDate && expiresAtDate > new Date()) {
          this.authState = {
            isAuthenticated: true,
            user: JSON.parse(userData),
            token,
            refreshToken: refreshToken || null,
            expiresAt: expiresAtDate,
          };

          // Verify token is still valid
          try {
            await this.verifyToken();
          } catch (error) {
            // Token invalid, try to refresh
            if (refreshToken) {
              try {
                await this.refreshAccessToken();
              } catch (refreshError) {
                await this.logout();
              }
            } else {
              await this.logout();
            }
          }
        } else {
          // Token expired, try to refresh
          if (refreshToken) {
            try {
              await this.refreshAccessToken();
            } catch (error) {
              await this.logout();
            }
          } else {
            await this.logout();
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth service:', error);
      await this.logout();
    }
  }

  /**
   * Register a new public user
   */
  async register(
    email: string,
    phone: string,
    name: string,
    password?: string
  ): Promise<{user: User; token: string}> {
    try {
      const response = await this.apiClient.post('/api/auth/register', {
        email,
        phone,
        name,
        password,
      });

      const {user, token, refreshToken, expiresAt} = response.data;

      await this.setAuthState({
        isAuthenticated: true,
        user,
        token,
        refreshToken,
        expiresAt: new Date(expiresAt),
      });

      return {user, token};
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  }

  /**
   * Login with email/username and password
   */
  async login(emailOrPhone: string, password: string): Promise<{user: User; token: string}> {
    try {
      const response = await this.apiClient.post('/api/auth/login', {
        emailOrPhone,
        password,
      });

      const {user, token, refreshToken, expiresAt} = response.data;

      await this.setAuthState({
        isAuthenticated: true,
        user,
        token,
        refreshToken,
        expiresAt: new Date(expiresAt),
      });

      return {user, token};
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    }
  }

  /**
   * Login with 2FA code
   */
  async loginWith2FA(emailOrPhone: string, password: string, code: string): Promise<{user: User; token: string}> {
    try {
      const response = await this.apiClient.post('/api/auth/login/2fa', {
        emailOrPhone,
        password,
        code,
      });

      const {user, token, refreshToken, expiresAt} = response.data;

      await this.setAuthState({
        isAuthenticated: true,
        user,
        token,
        refreshToken,
        expiresAt: new Date(expiresAt),
      });

      return {user, token};
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || '2FA verification failed. Please try again.'
      );
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate token on server
      if (this.authState.token) {
        try {
          await this.apiClient.post('/api/auth/logout');
        } catch (error) {
          // Ignore logout errors
          console.warn('Logout API call failed:', error);
        }
      }

      // Clear local storage
      await EncryptedStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.AUTH_EXPIRES_AT,
      ]);

      // Reset auth state
      this.authState = {
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        expiresAt: null,
      };
    } catch (error) {
      console.error('Logout failed:', error);
      // Force reset even if storage clear fails
      this.authState = {
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        expiresAt: null,
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = this.authState.refreshToken || await EncryptedStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.apiClient.post('/api/auth/refresh', {
        refreshToken,
      });

      const {token, refreshToken: newRefreshToken, expiresAt} = response.data;

      await this.setAuthState({
        isAuthenticated: true,
        user: this.authState.user, // Keep existing user data
        token,
        refreshToken: newRefreshToken || refreshToken,
        expiresAt: new Date(expiresAt),
      });

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Verify current token is valid
   */
  async verifyToken(): Promise<boolean> {
    try {
      await this.apiClient.get('/api/auth/verify');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current authentication state
   */
  getAuthState(): AuthState {
    return {...this.authState};
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.authState.user;
  }

  /**
   * Get current token
   */
  async getToken(): Promise<string | null> {
    if (this.authState.token) {
      // Check if token is expired
      if (this.authState.expiresAt && this.authState.expiresAt > new Date()) {
        return this.authState.token;
      } else {
        // Try to refresh
        await this.refreshAccessToken();
        return this.authState.token;
      }
    }

    // Try to load from storage
    const token = await EncryptedStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return token;
  }

  /**
   * Check if user has specific role
   * Role hierarchy: member < officer < admin
   */
  hasRole(role: UserRole): boolean {
    if (!this.authState.user) return false;
    
    const roleHierarchy: Record<UserRole, number> = {
      member: 1,
      officer: 2,
      admin: 3,
    };

    const userRoleLevel = roleHierarchy[this.authState.user.role] || 0;
    const requiredRoleLevel = roleHierarchy[role] || 0;

    return userRoleLevel >= requiredRoleLevel;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated && this.authState.user !== null;
  }

  /**
   * Check if user is a member (lowest level, but authenticated)
   */
  isMember(): boolean {
    return this.hasRole('member');
  }

  /**
   * Check if user is officer or above
   */
  isOfficer(): boolean {
    return this.hasRole('officer');
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Enable 2FA for current user
   */
  async enable2FA(): Promise<{secret: string; qrCode: string}> {
    try {
      const response = await this.apiClient.post('/api/auth/2fa/enable');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to enable 2FA. Please try again.'
      );
    }
  }

  /**
   * Verify and confirm 2FA setup
   */
  async verify2FASetup(code: string): Promise<void> {
    try {
      await this.apiClient.post('/api/auth/2fa/verify', {code});
      // Update user in auth state
      if (this.authState.user) {
        this.authState.user.twoFactorEnabled = true;
        await this.setAuthState(this.authState);
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || '2FA verification failed. Please try again.'
      );
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(emailOrPhone: string): Promise<void> {
    try {
      await this.apiClient.post('/api/auth/password/reset', {emailOrPhone});
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to send password reset. Please try again.'
      );
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    try {
      await this.apiClient.post('/api/auth/password/reset/confirm', {
        token,
        newPassword,
      });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Password reset failed. Please try again.'
      );
    }
  }

  /**
   * Update current user profile
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await this.apiClient.put('/api/auth/profile', updates);
      const user = response.data.user;
      
      // Update auth state
      this.authState.user = user;
      await this.setAuthState(this.authState);

      return user;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to update profile. Please try again.'
      );
    }
  }

  /**
   * Get API client instance (for use in other services)
   */
  getApiClient(): AxiosInstance {
    return this.apiClient;
  }

  /**
   * Set authentication state and persist to storage
   */
  private async setAuthState(state: AuthState): Promise<void> {
    this.authState = state;

    try {
      if (state.token) {
        await EncryptedStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, state.token);
      }
      if (state.refreshToken) {
        await EncryptedStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, state.refreshToken);
      }
      if (state.user) {
        await EncryptedStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(state.user));
      }
      if (state.expiresAt) {
        await EncryptedStorage.setItem(STORAGE_KEYS.AUTH_EXPIRES_AT, state.expiresAt.toISOString());
      }
    } catch (error) {
      console.error('Failed to persist auth state:', error);
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;

