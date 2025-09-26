'use client';

import React, { useState, useEffect } from 'react';
import { 
  calculateRankingAnalytics,
  getTopKeywordsFromRankings,
} from '@/lib/firebase';
import { fetchKeywordsFromBackend } from '@/lib/backend-api';
import { getCurrentBranding } from '@/lib/branding';

import { KeywordTab } from './KeywordTab';
import { RankingsTab } from './RankingsTab';
import { OverviewTabProps } from './types';

export function SEOTabOrchestrator({ 
  firebaseLoading = false, 
  firebaseError = null, 
  firebaseBestKeywords = [], 
  loadFirebaseData,
  lastRefreshTime,
  activeSubTab = 'keywords',
  isAnyPageGenerating = false,
  pageGenerationLoading = null,
}: OverviewTabProps) {
  const activeTab = activeSubTab;
  
  // Shared state for all tabs - start with current business
  const [selectedFilter, setSelectedFilter] = useState(getCurrentBranding().name);
  
  // Ranking state
  const [rankingData, setRankingData] = useState<any>(null);
  const [topKeywords, setTopKeywords] = useState<any[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankingError, setRankingError] = useState<string | null>(null);

  // Fetch ranking data from backend API
  const fetchRankingData = async () => {
    setRankingLoading(true);
    setRankingError(null);
    
    try {
      console.log('🔄 Fetching ranking data from backend API...');
      
      // For now, we'll use the keywords data as ranking data
      // In the future, this should be a dedicated rankings endpoint
      const keywords = await fetchKeywordsFromBackend();
      const rankings = keywords.map(keyword => ({
        keyword: keyword.keyword,
        currentPosition: keyword.position || 0,
        found: keyword.position > 0,
        createdAt: keyword.createdAt,
        visibilityScore: keyword.seoScore || 0,
        searchVolume: keyword.searchVolume || 0,
        difficulty: keyword.difficulty || 0
      }));
      console.log(`✅ Fetched ${rankings.length} rankings from backend API`);
      
      if (rankings.length > 0) {
        const analytics = calculateRankingAnalytics(rankings);
        setRankingData(analytics);
        
        const topKw = getTopKeywordsFromRankings(rankings, 5);
        setTopKeywords(topKw);
        
        console.log('✅ Analytics calculated:', analytics);
        console.log('✅ Top keywords calculated:', topKw);
      } else {
        setRankingData({
          averagePosition: 0,
          top10Keywords: 0,
          visibilityScore: 0,
          totalKeywords: 0,
          improvingKeywords: 0,
          positionTrend: [],
          visibilityTrend: []
        });
        setTopKeywords([]);
      }
      
    } catch (error) {
      console.error('❌ Error fetching ranking data from Firebase:', error);
      setRankingError('Failed to load ranking data from Firebase');
    } finally {
      setRankingLoading(false);
    }
  };
  
  // Fetch current rankings using backend API
  const fetchCurrentRankings = async () => {
    try {
      console.log('📊 Fetching current rankings for desertrecoverycenters.com...');
      setRankingLoading(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/rankings/fetch-current`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetDomain: 'desertrecoverycenters.com' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Rankings fetched successfully:', data.data.summary);
        setTimeout(() => {
          fetchRankingData();
        }, 3000);
      } else {
        console.error('❌ Failed to fetch rankings:', data.message);
        setRankingError(data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching current rankings:', error);
      setRankingError('Failed to fetch current rankings');
    } finally {
      setRankingLoading(false);
    }
  };

  // Load data when tabs are selected
  React.useEffect(() => {
    if (activeTab === 'rankings') {
      fetchRankingData();
    }
  }, [activeTab]);

  // Fetch data on component mount
  useEffect(() => {
    fetchRankingData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Tab Content */}
      <div className="transition-all duration-500 ease-in-out">
        {activeTab === 'keywords' && (
          <div className="animate-in fade-in-0 slide-in-from-left-2 duration-500">
            <KeywordTab
              firebaseLoading={firebaseLoading}
              firebaseError={firebaseError}
              firebaseBestKeywords={firebaseBestKeywords}
              loadFirebaseData={loadFirebaseData}
              lastRefreshTime={lastRefreshTime}
              selectedFilter={selectedFilter}
              pageGenerationLoading={pageGenerationLoading}
              isAnyPageGenerating={isAnyPageGenerating}
              onTabChange={setSelectedFilter}
            />
          </div>
        )}

        {activeTab === 'rankings' && (
          <div className="animate-in fade-in-0 slide-in-from-right-2 duration-500">
            <RankingsTab
              rankingLoading={rankingLoading}
              rankingError={rankingError}
              rankingData={rankingData}
              topKeywords={topKeywords}
              fetchRankingData={fetchRankingData}
              fetchCurrentRankings={fetchCurrentRankings}
            />
          </div>
        )}
      </div>
    </div>
  );
}
