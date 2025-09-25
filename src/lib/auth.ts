// Authentication utilities for BaseWave Platform
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from './firebase';

export interface User {
  username: string;
  name: string;
  email: string;
  role: string;
  isAuthenticated: boolean;
  permissions: string[];
  firebaseUser?: FirebaseUser;
  businessId?: string;
  businessName?: string;
  logoUrl?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Get admin credentials from environment variables
const getAdminCredentials = () => {
  const username = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
  const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  const name = process.env.NEXT_PUBLIC_ADMIN_USER_NAME;
  const email = process.env.NEXT_PUBLIC_ADMIN_USER_EMAIL;
  const role = process.env.NEXT_PUBLIC_ADMIN_USER_ROLE;

  if (!username || !password || !name || !email || !role) {
    throw new Error('Missing required authentication environment variables. Please check your .env.local file.');
  }

  // Basic password strength validation for development
  if (password.length < 6) {
    console.warn('⚠️  Warning: Admin password is less than 6 characters. Consider using a stronger password.');
  }

  return { username, password, name, email, role };
};

// Single development user for all access
const PREDEFINED_USERS: Record<string, { password: string; user: Omit<User, 'username' | 'isAuthenticated'> }> = {
  get admin() {
    const { password, name, email, role } = getAdminCredentials();
    return {
      password,
      user: {
        name,
        email,
        role,
        permissions: ['all']
      }
    };
  }
};

// Get the admin username from environment
const getAdminUsername = (): string => {
  const { username } = getAdminCredentials();
  return username;
};

// Validate login credentials by calling backend API
export const validateLogin = async (credentials: LoginCredentials): Promise<User | null> => {
  const { username, password } = credentials;
  
  console.log('🔍 Login attempt:', { username, password: '***', passwordLength: password.length });
  
  try {
    // Call backend login API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Login failed:', data.message);
      throw new Error(data.message || 'Login failed');
    }

    if (!data.success) {
      console.error('❌ Login failed:', data.message);
      throw new Error(data.message || 'Login failed');
    }

    console.log('✅ Login successful via API');
    
    // Transform backend response to frontend User format
    const userData = data.data;
    
    // Store JWT token in localStorage for API calls
    if (userData.token) {
      localStorage.setItem('jwt_token', userData.token);
    }

    // Store user data for branding system
    const userDataForStorage = {
      username: userData.username,
      businessName: userData.businessName,
      logoUrl: userData.logoUrl,
      businessId: userData.businessId,
      website: userData.website,
      description: userData.description,
      primaryColor: userData.primaryColor,
      secondaryColor: userData.secondaryColor,
      socialLinks: userData.socialLinks
    };
    localStorage.setItem('user_data', JSON.stringify(userDataForStorage));
    
    return {
      username: userData.username,
      name: userData.businessName || userData.username,
      email: userData.email,
      role: userData.role,
      isAuthenticated: true,
      permissions: userData.role === 'admin' ? ['all'] : ['user'],
      businessId: userData.businessId,
      businessName: userData.businessName,
      logoUrl: userData.logoUrl,
      token: userData.token
    };
  } catch (error) {
    console.error('❌ Login error:', error);
    return null;
  }
};




// Session management utilities
export const createSession = (user: User): string => {
  // Create session token with 24-hour expiration
  const sessionData = {
    username: user.username,
    role: user.role,
    email: user.email,
    name: user.name,
    permissions: user.permissions,
    timestamp: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
  };
  
  return btoa(JSON.stringify(sessionData));
};

export const validateSession = (sessionToken: string): User | null => {
  try {
    const sessionData = JSON.parse(atob(sessionToken));
    
    // Check if session is expired (24 hours)
    if (Date.now() > sessionData.expiresAt) {
      console.log('Session expired, removing token');
      localStorage.removeItem('basewave_session');
      return null;
    }
    
    // Return user data from session (avoiding database lookup)
    return {
      username: sessionData.username,
      name: sessionData.name,
      email: sessionData.email,
      role: sessionData.role,
      isAuthenticated: true,
      permissions: sessionData.permissions || ['all']
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
};

// Refresh session to extend expiration time
export const refreshSession = (user: User): void => {
  try {
    const newSessionToken = createSession(user);
    localStorage.setItem('basewave_session', newSessionToken);
    console.log('Session refreshed for another 24 hours');
  } catch (error) {
    console.error('Error refreshing session:', error);
  }
};

export const signOutFromFirebase = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Firebase sign out error:', error);
  }
};
