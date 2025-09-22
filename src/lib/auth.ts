// Authentication utilities for New People Platform
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

// Validate login credentials - accepts any username with correct password
export const validateLogin = (credentials: LoginCredentials): User | null => {
  const { username, password } = credentials;
  
  console.log('🔍 Login attempt:', { username, password: '***', passwordLength: password.length });
  
  try {
    // In development mode, accept any username with the correct password
    const userData = PREDEFINED_USERS['admin'];
    console.log('🔑 Expected password from env:', userData?.password ? '***' : 'undefined');
    console.log('🔑 Expected password length:', userData?.password?.length || 0);
    console.log('🔑 Password comparison:', password === userData?.password);
    
    if (!userData) {
      console.error('❌ No admin user data found');
      return null;
    }
    
    if (userData.password !== password) {
      console.error('❌ Password mismatch');
      return null;
    }
    
    console.log('✅ Login successful');
    
    return {
      username: username.toLowerCase() || getAdminUsername(),
      ...userData.user,
      isAuthenticated: true
    };
  } catch (error) {
    console.error('❌ Environment variable error:', error);
    // Fallback to hardcoded credentials for development
    if (username === 'admin' && password === 'admin123') {
      console.log('✅ Using fallback credentials');
      return {
        username: 'admin',
        name: 'Development User',
        email: 'dev@newpeople.com',
        role: 'Administrator',
        isAuthenticated: true,
        permissions: ['all']
      };
    }
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
      localStorage.removeItem('newpeople_session');
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
    localStorage.setItem('newpeople_session', newSessionToken);
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
