'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { getCurrentBranding } from '@/lib/branding';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  validateLogin, 
  type LoginCredentials 
} from '@/lib/auth';

export function LoginPage() {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user = await validateLogin(credentials);
      
      if (user) {
        login(user);
      } else {
        setError('Invalid username or password');
        // Auto-dismiss after 3 seconds
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Simple Top-Right Error Notification */}
      {error && (
        <div 
          className={`fixed top-4 right-4 z-50 p-4 bg-red-500 text-white rounded-lg shadow-lg animate-shake transform transition-all duration-300 ${
            mounted ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-medium">Password Incorrect</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 hover:bg-red-600 rounded p-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl animate-pulse opacity-60"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse opacity-40" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-r from-cyan-200/25 to-blue-200/25 rounded-full blur-2xl animate-pulse opacity-50" style={{ animationDelay: '4s' }}></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        
        {/* Sparkle Effects */}
        <div className="absolute top-1/4 left-1/2 animate-ping">
          <Sparkles className="w-4 h-4 text-blue-400/60" />
        </div>
        <div className="absolute top-3/4 left-1/4 animate-ping" style={{ animationDelay: '1s' }}>
          <Sparkles className="w-3 h-3 text-indigo-400/60" />
        </div>
        <div className="absolute top-1/2 right-1/4 animate-ping" style={{ animationDelay: '3s' }}>
          <Sparkles className="w-2 h-2 text-cyan-400/60" />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Main Login Card */}
        <div 
          className={`w-full max-w-md transform transition-all duration-1000 ease-out ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ animationDelay: '200ms' }}
        >
          {/* Glass Card */}
          <div className="relative bg-white/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-blue-500/10">
            {/* Card Border Gradient */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-cyan-500/20 p-[1px]">
              <div className="h-full w-full rounded-3xl bg-white/60 backdrop-blur-xl"></div>
            </div>
            
            <div className="relative z-10">
              {/* Logo Section at Top */}
              <div
                className={`text-center mb-6 transform transition-all duration-700 ease-out ${
                  mounted ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-2 opacity-0 scale-95'
                }`}
                style={{ animationDelay: '200ms' }}
              >
                <div className="relative inline-block">
                  <Image
                    src="/new-logo.png"
                    alt={`${getCurrentBranding().name} Logo`}
                    width={256}
                    height={96}
                    className="max-w-[256px] w-full h-auto opacity-70 hover:opacity-100 transition-opacity duration-300"
                  />
                  {/* Logo Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-indigo-400/5 blur-md rounded-full scale-110 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                  Welcome Back
                </h2>
                <p className="text-gray-600/80 font-medium">
                  Sign in to access your dashboard
                </p>
              </div>



              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div 
                  className={`transform transition-all duration-700 ease-out ${
                    mounted ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                  }`}
                  style={{ animationDelay: '400ms' }}
                >
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-3">
                    Username
                  </label>
                  <div className="relative group">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 ${
                      focusedField === 'username' ? 'text-blue-600 scale-110' : 'text-gray-400'
                    }`}>
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      value={credentials.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      className={`block w-full pl-12 pr-4 py-4 bg-white/50 backdrop-blur-sm rounded-2xl transition-all duration-300 ease-out placeholder:text-gray-400 text-gray-800 font-medium focus:outline-none ${
                        focusedField === 'username'
                          ? 'bg-white/70 shadow-lg shadow-blue-500/20 scale-[1.02] ring-2 ring-blue-500/30'
                          : 'hover:bg-white/60 hover:shadow-md hover:scale-[1.01] focus:bg-white/70 focus:shadow-lg'
                      }`}
                      placeholder="Enter your username"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div 
                  className={`transform transition-all duration-700 ease-out ${
                    mounted ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                  }`}
                  style={{ animationDelay: '600ms' }}
                >
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                    Password
                  </label>
                  <div className="relative group">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 ${
                      focusedField === 'password' ? 'text-blue-600 scale-110' : 'text-gray-400'
                    }`}>
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={credentials.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className={`block w-full pl-12 pr-12 py-4 bg-white/50 backdrop-blur-sm rounded-2xl transition-all duration-300 ease-out placeholder:text-gray-400 text-gray-800 font-medium focus:outline-none ${
                        focusedField === 'password'
                          ? 'bg-white/70 shadow-lg shadow-blue-500/20 scale-[1.02] ring-2 ring-blue-500/30'
                          : 'hover:bg-white/60 hover:shadow-md hover:scale-[1.01] focus:bg-white/70 focus:shadow-lg'
                      }`}
                      placeholder="Enter your password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center group/eye"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 group-hover/eye:text-gray-600 transition-all duration-200 transform group-hover/eye:scale-110" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 group-hover/eye:text-gray-600 transition-all duration-200 transform group-hover/eye:scale-110" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <div 
                  className={`pt-2 transform transition-all duration-700 ease-out ${
                    mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                  style={{ animationDelay: '800ms' }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading || !credentials.username || !credentials.password}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white font-semibold rounded-2xl transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] hover:-translate-y-1 disabled:hover:scale-100 disabled:hover:translate-y-0 group overflow-hidden relative"
                  >
                    {/* Button Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                    
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="animate-pulse">Signing In...</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center gap-2 relative z-10">
                        Sign In
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    )}
                  </Button>
                </div>
              </form>

              {/* Security Notice */}
              <div
                className={`mt-8 text-center transform transition-all duration-700 ease-out ${
                  mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                }`}
                style={{ animationDelay: '1000ms' }}
              >
                <div className="inline-flex items-center gap-2 text-xs text-gray-500/80 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Lock className="h-3 w-3 text-green-500" />
                  <span className="font-medium">Secure Environment Protected</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className={`text-center mt-12 transform transition-all duration-700 ease-out ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          style={{ animationDelay: '1200ms' }}
        >
          <p className="text-sm text-gray-500/80 font-medium">
            © 2024 {getCurrentBranding().name}. All rights reserved.
          </p>
          <p className="text-xs text-gray-400/80 mt-2">
            v2.1.0 - CV Builder and Portfolio Platform
          </p>
        </div>
      </div>
    </div>
  );
}