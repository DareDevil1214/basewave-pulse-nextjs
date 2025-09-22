'use client';

import { ReactNode } from 'react';

interface TabOption {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface TabSelectorProps {
  tabs: TabOption[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'buttons';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  iconPosition?: 'left' | 'top';
  fullWidth?: boolean;
}

export function TabSelector({
  tabs,
  activeTab,
  onTabChange,
  variant = 'underline',
  size = 'md',
  className = '',
  iconPosition = 'left',
  fullWidth = false,
}: TabSelectorProps) {
  // Size classes
  const sizeClasses = {
    sm: 'text-xs py-1.5 px-2',
    md: 'text-sm py-2 px-3',
    lg: 'text-base py-2.5 px-4',
  };
  
  // Icon size classes
  const iconSizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  // Variant specific styles
  const getTabStyles = (tabId: string) => {
    const isActive = activeTab === tabId;
    
    if (variant === 'underline') {
      return `
        border-b-2 ${isActive 
          ? 'border-blue-600 text-blue-600 font-medium' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        } ${sizeClasses[size]}
      `;
    }
    
    if (variant === 'pills') {
      return `
        rounded-full ${isActive 
          ? 'bg-blue-100 text-blue-700 font-medium' 
          : 'text-gray-600 hover:bg-gray-100'
        } ${sizeClasses[size]}
      `;
    }
    
    // Default buttons style
    return `
      rounded-lg ${isActive 
        ? 'bg-blue-50 text-blue-700 border border-blue-200 font-medium' 
        : 'bg-white text-gray-600 border border-gray-200 hover:text-gray-700 hover:bg-gray-50'
      } ${sizeClasses[size]}
    `;
  };

  // Container classes
  const containerClasses = `
    flex ${variant === 'underline' ? 'border-b border-gray-200' : 'gap-2'} 
    ${fullWidth ? 'w-full' : ''} ${className}
  `;

  return (
    <div className={containerClasses}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              transition-all duration-200
              ${getTabStyles(tab.id)}
              ${fullWidth ? 'flex-1' : ''}
              ${iconPosition === 'left' ? 'flex items-center gap-2' : 'flex flex-col items-center gap-1'}
            `}
          >
            {Icon && (
              <Icon className={iconSizeClasses[size]} />
            )}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
