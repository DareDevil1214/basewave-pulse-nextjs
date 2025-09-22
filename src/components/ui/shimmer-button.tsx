'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ShimmerButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function ShimmerButton({ 
  children, 
  onClick, 
  className = '',
  disabled = false,
  type = 'button'
}: ShimmerButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group/button relative inline-flex items-center justify-center overflow-hidden rounded-md bg-black px-6 py-2 text-base font-semibold text-white transition-all duration-300 ease-in-out border border-white/20",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span className="text-lg">{children}</span>
      <div
        className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]"
      >
        <div className="relative h-full w-10 bg-white/20"></div>
      </div>
    </button>
  );
}
