'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user, isAuthenticated, onboardingComplete, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only check if user is authenticated and not loading
    if (isAuthenticated && !isLoading && onboardingComplete !== null) {
      if (!onboardingComplete) {
        console.log('User not onboarded, redirecting to onboarding page');
        router.push('/onboarding');
      }
    }
  }, [isAuthenticated, isLoading, onboardingComplete, router]);

  // Show loading while checking authentication and onboarding status
  if (isLoading || (isAuthenticated && onboardingComplete === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (will be handled by auth guard)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated but not onboarded, don't render children (will redirect)
  if (!onboardingComplete) {
    return null;
  }

  // If authenticated and onboarded, render children
  return <>{children}</>;
}
