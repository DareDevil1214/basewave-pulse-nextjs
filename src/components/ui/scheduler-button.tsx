'use client';

import { ReactNode } from 'react';

interface SchedulerButtonProps {
  onClick?: () => void;
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function SchedulerButton({ onClick, children = "Scheduler", disabled = false, className = "" }: SchedulerButtonProps) {
  return (
    <button 
      className={`relative group cursor-pointer text-gray-50 overflow-hidden h-12 w-48 rounded-md bg-gray-900 p-2 flex justify-center items-center font-extrabold ${className}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      <div className="absolute top-2 right-16 group-hover:top-8 group-hover:-right-8 z-10 w-32 h-32 rounded-full group-hover:scale-150 group-hover:opacity-50 duration-500 bg-gray-800"></div>
      <div className="absolute top-2 right-16 group-hover:top-8 group-hover:-right-8 z-10 w-24 h-24 rounded-full group-hover:scale-150 group-hover:opacity-50 duration-500 bg-gray-700"></div>
      <div className="absolute top-2 right-16 group-hover:top-8 group-hover:-right-8 z-10 w-16 h-16 rounded-full group-hover:scale-150 group-hover:opacity-50 duration-500 bg-gray-600"></div>
      <div className="absolute top-2 right-16 group-hover:top-8 group-hover:-right-8 z-10 w-10 h-10 rounded-full group-hover:scale-150 group-hover:opacity-50 duration-500 bg-gray-500"></div>
      <p className="z-10 text-sm">{children}</p>
    </button>
  );
}
