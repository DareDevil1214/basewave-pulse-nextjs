'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/components/LoginPage';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function Home() {
  const { isAuthenticated, isLoading, onboardingComplete } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && onboardingComplete !== null) {
      if (!onboardingComplete) {
        router.push('/onboarding');
        return;
      }
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, onboardingComplete, router]);

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={() => {}} />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show loading while redirecting
  return <LoadingScreen onLoadingComplete={() => {}} />;
}
