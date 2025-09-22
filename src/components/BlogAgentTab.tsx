'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BlogPortal } from './blog-agent';

export function BlogAgentTab() {
  const searchParams = useSearchParams();
  const portalParam = searchParams.get('portal');
  const [animationState, setAnimationState] = useState<'initial' | 'animate' | 'exit'>('initial');

  useEffect(() => {
    // Start animation after component mounts
    const timer = setTimeout(() => {
      setAnimationState('animate');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [portalParam]);

  // Map URL parameters to portal identifiers
  const getPortalFromParam = (param: string | null): 'eternalelite' | 'eliteequilibrium' | 'neovibemag' => {
    switch(param) {
      case 'eternal-elite':
        return 'eternalelite';
      case 'elite-equilibrium':
        return 'eliteequilibrium';
      case 'neo-vibe-mag':
        return 'neovibemag';
      default:
        return 'eternalelite';
    }
  };

  // Render the selected blog component based on URL parameter
  const renderSelectedBlog = () => {
    const portal = getPortalFromParam(portalParam);
    
    if (portalParam) {
      return (
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Blog Agent</h1>
            <p className="text-gray-600 text-lg">AI-powered content generation for your blog portals</p>
            <div className="flex items-center gap-3 mt-4">
              <img 
                src={portal === 'eternalelite' ? '/eternal-logo.png' : 
                     portal === 'eliteequilibrium' ? '/elite-logo.png' : '/logo-load.webp'} 
                alt={portal === 'eternalelite' ? 'Eternal Elite' : 
                     portal === 'eliteequilibrium' ? 'Elite Equilibrium' : 'Neo Vibe Mag'} 
                className="w-8 h-8" 
              />
              <span className="text-lg font-semibold text-gray-700">
                {portal === 'eternalelite' ? 'Eternal Elite' : 
                 portal === 'eliteequilibrium' ? 'Elite Equilibrium' : 'Neo Vibe Mag'} Portal
              </span>
            </div>
          </div>
          <BlogPortal portal={portal} />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 border border-blue-100 max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Blog Agent</h1>
          <p className="text-gray-600 mb-8 text-lg">
            AI-powered content generation for your blog portals. Select a portal from the sidebar to start creating engaging content.
          </p>
          
          <div className="text-sm text-gray-500">
            <p>💡 <strong>Tip:</strong> Use the dropdown arrow in the sidebar for quick portal switching</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <div 
          className={`w-full h-full transition-all duration-500 ease-out ${
            animationState === 'initial' ? 'opacity-0 translate-y-10' : 
            animationState === 'animate' ? 'opacity-100 translate-y-0' : 
            'opacity-0 -translate-y-10'
          }`}
        >
          {renderSelectedBlog()}
        </div>
      </div>
    </div>
  );
}