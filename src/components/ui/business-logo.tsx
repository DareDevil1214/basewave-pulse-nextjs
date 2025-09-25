'use client';

import { cn } from '@/lib/utils';
import { Building2 } from 'lucide-react';

interface BusinessLogoProps {
  logoUrl?: string | null;
  businessName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFallback?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
};

export function BusinessLogo({ 
  logoUrl, 
  businessName, 
  className,
  size = 'md',
  showFallback = true
}: BusinessLogoProps) {
  if (logoUrl && showFallback) {
    return (
      <img
        src={logoUrl}
        alt={businessName || 'Business Logo'}
        className={cn(
          'object-cover rounded-lg border border-gray-200',
          sizeClasses[size],
          className
        )}
        onError={(e) => {
          // If image fails to load, show fallback
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) {
            fallback.style.display = 'flex';
          }
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        'bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200',
        sizeClasses[size],
        className
      )}
    >
      <Building2 className={cn(
        'text-gray-500',
        size === 'sm' ? 'h-4 w-4' :
        size === 'md' ? 'h-5 w-5' :
        size === 'lg' ? 'h-6 w-6' :
        'h-8 w-8'
      )} />
    </div>
  );
}
