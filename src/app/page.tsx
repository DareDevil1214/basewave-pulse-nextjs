'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/components/LoginPage';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Check if user needs onboarding
      const userData = localStorage.getItem('user_data');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          if (!parsed.onboardingCompleted) {
            router.push('/onboarding');
            return;
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={() => {}} />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show loading while redirecting
  return <LoadingScreen onLoadingComplete={() => {}} />;
}
