'use client';

import React, { useState, useEffect } from 'react';
import { 
  fetchKeywordRankings,
  calculateRankingAnalytics,
  getTopKeywordsFromRankings,
} from '@/lib/firebase';

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
  
  // Shared state for all tabs
  const [selectedFilter, setSelectedFilter] = useState('CV Maker');
  
  // Ranking state
  const [rankingData, setRankingData] = useState<any>(null);
  const [topKeywords, setTopKeywords] = useState<any[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankingError, setRankingError] = useState<string | null>(null);

  // Fetch ranking data from Firebase
  const fetchRankingData = async () => {
    setRankingLoading(true);
    setRankingError(null);
    
    try {
      console.log('🔄 Fetching ranking data from Firebase...');
      
      const rankings = await fetchKeywordRankings();
      console.log(`✅ Fetched ${rankings.length} rankings from Firebase`);
      
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
