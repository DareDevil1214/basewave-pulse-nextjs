'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  size?: 'sm' | 'md' | 'lg';
}

export function GradientButton({ 
  children, 
  onClick, 
  className = '',
  disabled = false,
  type = 'button',
  size = 'md'
}: GradientButtonProps) {
  const sizeClasses = {
    sm: 'text-sm px-3 py-2 min-w-20 min-h-8',
    md: 'text-base px-5 py-3 min-w-28 min-h-11',
    lg: 'text-lg px-7 py-4 min-w-32 min-h-12'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "btn-gradient relative cursor-pointer font-medium transition-all duration-700 bg-[length:280%_auto] bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 hover:bg-right-top border-none rounded-lg text-white shadow-[0px_0px_20px_rgba(71,184,255,0.5),0px_5px_5px_-1px_rgba(58,125,233,0.25),inset_4px_4px_8px_rgba(175,230,255,0.5),inset_-4px_-4px_8px_rgba(19,95,216,0.35)] focus:outline-none focus:shadow-[0_0_0_3px_white,0_0_0_6px_#3b82f6] active:outline-none active:shadow-[0_0_0_3px_white,0_0_0_6px_#3b82f6]",
        disabled && "opacity-50 cursor-not-allowed hover:bg-right-top",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </button>
  );
}
