'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface RadioTabOption {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface RadioTabsProps {
  options: RadioTabOption[];
  value: string;
  onChange: (value: string) => void;
  containerWidth?: number;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary';
}

export function RadioTabs({
  options,
  value,
  onChange,
  containerWidth = 500,
  className,
  variant = 'default',
}: RadioTabsProps) {
  const handleChange = (optionId: string) => {
    onChange(optionId);
  };

  // Calculate the width of each tab
  const tabWidth = containerWidth / options.length;

  // Determine which option is selected
  const selectedIndex = options.findIndex(option => option.id === value);
  
  // Determine the variant colors
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: '#f8fafc', // Light silver/white
          border: '#e2e8f0',     // Light gray border
          activeBackground: '#e2e8f0', // Silver
          textColor: '#64748b',  // Slate gray
          activeTextColor: '#334155', // Darker slate for active text
        };
      case 'secondary':
        return {
          background: '#f1f5f9', // Very light silver
          border: '#cbd5e1',     // Light silver border
          activeBackground: '#cbd5e1', // Silver
          textColor: '#64748b',  // Slate gray
          activeTextColor: '#334155', // Darker slate for active text
        };
      default:
        return {
          background: '#ffffff', // White
          border: '#e2e8f0',     // Light gray border
          activeBackground: {
            first: '#e2e8f0',    // Silver
            second: '#cbd5e1',   // Darker silver
          },
          textColor: '#64748b',  // Slate gray
          activeTextColor: {
            first: '#334155',    // Dark slate
            second: '#334155',   // Dark slate
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <div 
      className={cn("radio-tabs relative flex items-center rounded-lg overflow-hidden border-2", className)}
      style={{
        width: `${containerWidth}px`,
        backgroundColor: typeof variantStyles.background === 'string' ? variantStyles.background : '#212121',
        borderColor: typeof variantStyles.border === 'string' ? variantStyles.border : '#ffffff',
      }}
    >
      {options.map((option, index) => (
        <label 
          key={option.id}
          className={cn(
            "radio-tab-label w-full py-2.5 px-4 cursor-pointer flex justify-center items-center z-[1] font-medium text-sm",
            value === option.id && "active"
          )}
          style={{
            color: value === option.id 
              ? (typeof variantStyles.activeTextColor === 'object' 
                ? (index === 0 ? variantStyles.activeTextColor.first : variantStyles.activeTextColor.second) 
                : variantStyles.activeTextColor)
              : variantStyles.textColor
          }}
        >
          <input 
            type="radio" 
            name="radio-tabs" 
            id={`tab-${option.id}`}
            value={option.id}
            checked={value === option.id}
            onChange={() => handleChange(option.id)}
            className="sr-only"
          />
          <div className="flex items-center gap-2">
            {option.icon && <option.icon className="h-4 w-4 icon" />}
            <span>{option.label}</span>
          </div>
        </label>
      ))}
      
      {selectedIndex !== -1 && (
        <span 
          className="selection absolute h-full z-0 transition-transform duration-300 ease-in-out"
          style={{
            width: `${tabWidth}px`,
            transform: `translateX(calc(${selectedIndex} * ${tabWidth}px))`,
            backgroundColor: typeof variantStyles.activeBackground === 'object' 
              ? (selectedIndex === 0 ? variantStyles.activeBackground.first : variantStyles.activeBackground.second) 
              : variantStyles.activeBackground,
            display: 'inline-block'
          }}
        />
      )}
    </div>
  );
}
