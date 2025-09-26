'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getCurrentBranding } from '@/lib/branding';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const branding = getCurrentBranding();

  useEffect(() => {
    // Show loading screen for 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for fade out animation to complete before calling onLoadingComplete
      setTimeout(() => {
        onLoadingComplete();
      }, 500); // 500ms for fade out animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center z-50 animate-fade-out">
        <div className="text-center animate-scale-out">
          <div className="relative mb-6 animate-logo-out">
                      <Image
            src={branding.logoUrl || "/logo-load.webp"}
            alt={`${branding.name} Logo`}
            width={180}
            height={180}
            className="mx-auto drop-shadow-lg"
            priority
          />
          </div>
          <div className="animate-pulse-out">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo with animations */}
        <div className="relative mb-6 animate-logo-entrance">
          <div className="absolute inset-0 bg-gray-200/20 rounded-full blur-xl animate-pulse-slow"></div>
          <Image
            src={branding.logoUrl || "/logo-load.webp"}
            alt={`${branding.name} Logo`}
            width={180}
            height={180}
            className="relative mx-auto drop-shadow-lg animate-float"
            priority
          />
        </div>

        {/* Loading indicator */}
        <div className="space-y-4 animate-fade-in-delayed">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-1"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce-2"></div>
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce-3"></div>
          </div>
          
          <div className="w-32 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gray-400 rounded-full animate-loading-bar"></div>
          </div>
          
          <p className="text-sm text-gray-600 font-medium animate-text-shimmer">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
} 