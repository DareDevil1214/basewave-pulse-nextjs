'use client';

import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
  debounceMs?: number;
}

export function SearchBar({ 
  placeholder = "Search...", 
  onSearch, 
  className = "",
  debounceMs = 300 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, onSearch, debounceMs]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className={`relative transition-all duration-300 ${className}`}>
      <div 
        className={`
          relative flex items-center transition-all duration-300 ease-in-out
          ${isFocused 
            ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg' 
            : 'ring-1 ring-gray-300 hover:ring-gray-400'
          }
          rounded-lg bg-white
        `}
      >
        <div className="absolute left-2 sm:left-3 flex items-center pointer-events-none">
          <Search 
            className={`
              h-3 w-3 sm:h-4 sm:w-4 transition-colors duration-200
              ${isFocused ? 'text-blue-500' : 'text-gray-400'}
            `} 
          />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-2.5 text-xs sm:text-sm 
            bg-transparent border-0 outline-none
            placeholder-gray-500 text-gray-900
            transition-all duration-200
            ${isFocused ? 'placeholder-gray-400' : ''}
          `}
        />
        
        {query && (
          <button
            onClick={handleClear}
            className={`
              absolute right-2 sm:right-3 p-1 rounded-full
              transition-all duration-200 ease-in-out
              hover:bg-gray-100 text-gray-400 hover:text-gray-600
              opacity-0 animate-fadeIn
            `}
            style={{ opacity: 1 }}
          >
            <X className="h-2 w-2 sm:h-3 sm:w-3" />
          </button>
        )}
      </div>
      
      {/* Search suggestions or loading indicator could go here */}
      {isFocused && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-10">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 animate-slideDown">
            <div className="text-xs text-gray-500 px-2 py-1">
              Searching for &ldquo;{query}&rdquo;...
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 