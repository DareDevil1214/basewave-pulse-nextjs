'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Target, TrendingUp, Search } from 'lucide-react';
import { SEOTabOrchestrator } from '@/components/seo/SEOTabOrchestrator';
import { fetchBestKeywords, BestKeyword } from '@/lib/firebase';

export default function SEOPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') || 'keywords';
  const [animationState, setAnimationState] = useState<'initial' | 'animate' | 'exit'>('initial');

  // Firebase state
  const [firebaseLoading, setFirebaseLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('');
  const [firebaseBestKeywords, setFirebaseBestKeywords] = useState<BestKeyword[]>([]);

  // Page generation state
  const [isAnyPageGenerating, setIsAnyPageGenerating] = useState(false);
  const [pageGenerationLoading, setPageGenerationLoading] = useState<string | null>(null);

  useEffect(() => {
    // Start animation after component mounts
    const timer = setTimeout(() => {
      setAnimationState('animate');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [tabParam]);

  const loadFirebaseData = async () => {
    setFirebaseLoading(true);
    setFirebaseError(null);
    try {
      const bestKeywords = await fetchBestKeywords();
      
      setFirebaseBestKeywords(bestKeywords);
      
      console.log(`✅ Firebase data loaded: ${bestKeywords.length} best keywords`);
      setLastRefreshTime(new Date().toLocaleTimeString());
    } catch (error: any) {
      console.error('❌ Error loading Firebase data:', error);
      setFirebaseError(error.message || 'Failed to load data');
    } finally {
      setFirebaseLoading(false);
    }
  };

  useEffect(() => {
    loadFirebaseData();
  }, []);

  const handleBackToSelection = () => {
    window.history.pushState(null, '', '/dashboard/seo');
  };

  const renderSelectedTab = () => {
    if (!tabParam || tabParam === 'keywords' || tabParam === 'rankings') {
      return (
        <SEOTabOrchestrator 
          firebaseLoading={firebaseLoading}
          firebaseError={firebaseError}
          firebaseBestKeywords={firebaseBestKeywords}
          loadFirebaseData={loadFirebaseData}
          lastRefreshTime={lastRefreshTime}
          activeSubTab={tabParam as 'keywords' | 'rankings'}
          isAnyPageGenerating={isAnyPageGenerating}
          pageGenerationLoading={pageGenerationLoading}
        />
      );
    }
    
    // Default view when no tab is selected
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="bg-white rounded-2xl p-12 border border-gray-100 max-w-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">SEO Tools</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Comprehensive SEO analysis and optimization tools. Select a tool from the sidebar to start analyzing your website performance.
          </p>
          
          {/* SEO Tool Options Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <a 
              href="/dashboard/seo?tab=keywords"
              className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 group-hover:text-green-600">Keywords</h3>
              <p className="text-xs text-gray-500 mt-1">Keyword Analysis & Research</p>
            </a>
            
            <a 
              href="/dashboard/seo?tab=rankings"
              className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 group-hover:text-green-600">Rankings</h3>
              <p className="text-xs text-gray-500 mt-1">Position Tracking & Analytics</p>
            </a>
          </div>
          
          <div className="text-sm text-gray-500">
            <p><strong>Tip:</strong> Use the dropdown arrow in the sidebar for quick tool switching</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto scrollable">
        <div 
          className={`w-full h-full transition-all duration-500 ease-out ${
            animationState === 'initial' ? 'opacity-0 translate-y-10' : 
            animationState === 'animate' ? 'opacity-100 translate-y-0' : 
            'opacity-0 -translate-y-10'
          }`}
        >
          {renderSelectedTab()}
        </div>
      </div>
    </div>
  );
}
