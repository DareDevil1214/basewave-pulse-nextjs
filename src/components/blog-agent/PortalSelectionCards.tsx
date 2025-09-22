'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2, ImageIcon } from 'lucide-react';
import './PortalSelectionCards.css';

interface PortalCard {
  id: string;
  portal: 'newpeople';
  title: string;
  description: string;
  logo: string;
  themeColor: string;
}

interface PortalSelectionCardsProps {
  onPortalSelect: (portal: 'newpeople') => void;
}

// Enhanced image component with loading state
const PortalLogo = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center`}>
        <ImageIcon className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center rounded-xl">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      )}
      <Image 
        src={src} 
        alt={alt} 
        width={128} 
        height={128} 
        className={`object-contain logo-shadow w-full h-full transition-opacity duration-300 ${
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

export function PortalSelectionCards({ onPortalSelect }: PortalSelectionCardsProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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

  const handleCardClick = (portal: 'newpeople') => {
    onPortalSelect(portal);
  };

  return (
    <div className="hidden sm:flex flex-wrap justify-center gap-6 lg:gap-8 p-4" style={{ marginTop: '-100px' }}>
      {portalCards.map((card) => (
        <div 
          key={card.id}
          className="parent"
          onMouseEnter={() => setHoveredCard(card.id)}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => handleCardClick(card.portal)}
        >
          <div className="card">
            <div 
              className="content-box"
              style={{ backgroundColor: card.themeColor }}
            >
              <div className="flex flex-col items-center mb-4">
                <div className="w-32 h-32 mb-3 logo-container">
                  <PortalLogo 
                    src={card.logo} 
                    alt={card.title} 
                    className="w-full h-full rounded-xl overflow-hidden"
                  />
                </div>
                <span className="card-title">{card.title}</span>
              </div>
              <p className="card-content">
                {card.description}
              </p>
              <span className="see-more">Select Portal</span>
            </div>
            <div className="date-box">
              <span className="month">AI</span>
              <span className="date">AGENT</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
