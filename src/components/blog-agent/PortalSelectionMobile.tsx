'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2, ImageIcon } from 'lucide-react';

interface PortalCard {
  id: string;
  portal: 'newpeople';
  title: string;
  description: string;
  logo: string;
  themeColor: string;
}

interface PortalSelectionMobileProps {
  onPortalSelect: (portal: 'newpeople') => void;
}

// Enhanced image component with loading state
const PortalLogo = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center`}>
        <ImageIcon className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center rounded-xl">
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        </div>
      )}
      <Image 
        src={src} 
        alt={alt} 
        width={48} 
        height={48} 
        className={`object-contain transition-opacity duration-300 ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageLoading(false);
          setImageError(true);
        }}
      />
    </div>
  );
};

export function PortalSelectionMobile({ onPortalSelect }: PortalSelectionMobileProps) {
  const [selectedPortal, setSelectedPortal] = useState<string | null>(null);

  const portalCards: PortalCard[] = [
    {
      id: 'new-people',
      portal: 'newpeople',
      title: 'New People',
      description: 'AI-powered portfolio creation and management platform, transforming resumes into stunning online portfolios.',
      logo: '/logo-load.webp',
      themeColor: '#059669' // Green theme
    }
  ];

  const handlePortalSelect = (portal: 'newpeople', id: string) => {
    setSelectedPortal(id);
    onPortalSelect(portal);
  };

  return (
    <div className="w-full px-4 py-6 bg-gray-50 min-h-screen">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Your Portal</h2>
        <p className="text-gray-600 text-sm">Choose the content platform that best fits your needs</p>
      </div>
      
      <div className="space-y-4">
        {portalCards.map((card) => (
          <div
            key={card.id}
            onClick={() => handlePortalSelect(card.portal, card.id)}
            className={`
              relative bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 cursor-pointer
              ${selectedPortal === card.id 
                ? 'border-blue-500 shadow-xl scale-[1.02]' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
              }
            `}
          >
            {/* Selection indicator */}
            {selectedPortal === card.id && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: card.themeColor }}
              >
                <PortalLogo 
                  src={card.logo} 
                  alt={card.title} 
                  className="w-full h-full rounded-xl overflow-hidden"
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{card.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{card.description}</p>
              </div>
              
              {/* Arrow indicator */}
              <div className="flex-shrink-0">
                <svg 
                  className={`w-5 h-5 transition-colors duration-300 ${
                    selectedPortal === card.id ? 'text-blue-500' : 'text-gray-400'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            
            {/* Bottom accent line */}
            <div 
              className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl transition-all duration-300 ${
                selectedPortal === card.id ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundColor: card.themeColor }}
            />
          </div>
        ))}
      </div>
      
      {/* Selection info */}
      {selectedPortal && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">
                Portal selected! Tap again to confirm.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
