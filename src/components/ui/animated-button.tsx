'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function AnimatedButton({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  disabled,
  ...props 
}: AnimatedButtonProps) {
  const sizeClasses = {
    sm: "py-1.5 px-4 text-xs",
    md: "py-2 px-6 text-sm",
    lg: "py-3 px-8 text-base"
  };
  
  const variantClasses = {
    primary: {
      base: "text-blue-600 bg-white border border-blue-200",
      hover: "hover:text-white before:bg-gradient-to-r before:from-blue-500 before:to-blue-300"
    },
    danger: {
      base: "text-red-600 bg-white border border-red-200",
      hover: "hover:text-white before:bg-gradient-to-r before:from-red-500 before:to-red-300"
    }
  };
  
  const animationClasses = "relative font-bold rounded-full overflow-hidden transition-all duration-300 ease-in-out shadow-md hover:scale-105 hover:shadow-lg active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 before:absolute before:top-0 before:-left-full before:w-full before:h-full before:transition-all before:duration-500 before:ease-in-out before:z-[-1] before:rounded-full hover:before:left-0";
  
  return (
    <button
      className={cn(
        animationClasses,
        sizeClasses[size],
        variantClasses[variant].base,
        variantClasses[variant].hover,
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default AnimatedButton;