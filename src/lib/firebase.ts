// Firebase interfaces and utilities (no longer requires Firebase configuration)
// All data access now goes through backend API

// Interface for best keywords from backend
export interface BestKeyword {
  id: string;
  keyword: string;
  volume: number;
  difficulty: number;
  rank: string;
  opportunity: string;
  intent: string;
  cpc: number;
  position: number;
  competitorUrl: string;
  seoScore: number;
  createdAt: string;
  order: number;
  searchVolume: number;
  trafficEstimate: number;
  competition: string;
  serpFeatures: string[];
}

// Add social media content interface
export interface SocialMediaContent {
  id: string;
  title: string;
  platform: string;
  content: string;
  keywords: string[];
  targetAudience: string;
  contentLength: string;
  tone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  readingTime: number;
  projectedTraffic?: string;
  difficulty?: string;
  estimatedLeads?: string;
  generateImage?: boolean;
  generatedImageUrl?: string;
  imageUrl?: string; // Backend uses this field name
  uploadPostResponse?: {
    success?: boolean;
    url?: string;
    post_id?: string;
    timestamp?: string;
    usage_count?: number;
    usage_limit?: number;
    results?: string | {
      [platform: string]: {
        post_id?: string;
        success?: boolean;
        url?: string;
        [key: string]: any;
      };
    };
    [key: string]: any;
  };
}

// Interface for published post data
export interface PublishedPostData {
  id: string;
  platform: string;
  postId: string;
  status: string;
  url?: string;
  publishedAt?: string;
  results?: {
    facebook?: {
      post_id: string;
      success: boolean;
      url: string;
    };
    twitter?: {
      post_id: string;
      success: boolean;
      url: string;
    };
    instagram?: {
      post_id: string;
      success: boolean;
      url: string;
    };
    linkedin?: {
      post_id: string;
      success: boolean;
      url: string;
    };
    [key: string]: any;
  };
  uploadPostResponse?: {
    success?: boolean;
    url?: string;
    post_id?: string;
    timestamp?: string;
    usage_count?: number;
    usage_limit?: number;
    results?: string | {
      [platform: string]: {
        post_id?: string;
        success?: boolean;
        url?: string;
        [key: string]: any;
      };
    };
    [key: string]: any;
  };
}

// Note: All data fetching now goes through backend API
// Use backend-api.ts functions instead of direct Firestore calls

// Utility functions that don't require Firebase
export const calculateRankingAnalytics = (rankings: any[]): any => {
  try {
    if (rankings.length === 0) {
      return {
        averagePosition: 0,
        top10Keywords: 0,
        top100Keywords: 0,
        visibilityScore: 0,
        totalKeywords: 0,
        improvingKeywords: 0,
        positionTrend: [
          { month: 'Jan', avgPosition: 0 },
          { month: 'Feb', avgPosition: 0 },
          { month: 'Mar', avgPosition: 0 },
          { month: 'Apr', avgPosition: 0 },
          { month: 'May', avgPosition: 0 },
          { month: 'Jun', avgPosition: 0 }
        ],
        visibilityTrend: [
          { month: 'Jan', visibility: 0 },
          { month: 'Feb', visibility: 0 },
          { month: 'Mar', visibility: 0 },
          { month: 'Apr', visibility: 0 },
          { month: 'May', visibility: 0 },
          { month: 'Jun', visibility: 0 }
        ]
      };
    }

    // Group by keyword and get latest ranking
    const keywordMap = new Map();
    
    rankings.forEach(ranking => {
      if (!keywordMap.has(ranking.keyword) || 
          new Date(ranking.createdAt) > new Date(keywordMap.get(ranking.keyword).createdAt)) {
        keywordMap.set(ranking.keyword, ranking);
      }
    });
    
    const latestRankings = Array.from(keywordMap.values());
    const foundRankings = latestRankings.filter(r => r.found && r.currentPosition);
    
    // Calculate metrics
    const totalKeywords = latestRankings.length;
    const averagePosition = foundRankings.length > 0 
      ? foundRankings.reduce((sum, r) => sum + r.currentPosition, 0) / foundRankings.length 
      : 0;
    const top10Keywords = foundRankings.filter(r => r.currentPosition <= 10).length;
    const top100Keywords = foundRankings.filter(r => r.currentPosition <= 100).length;
    const visibilityScore = foundRankings.length > 0
      ? foundRankings.reduce((sum, r) => sum + (r.visibilityScore || 0), 0) / foundRankings.length
      : 0;
    const improvingKeywords = Math.floor(foundRankings.length * 0.3); // Simulated
    
    // Generate trend data based on current data
    const positionTrend = [
      { month: 'Jan', avgPosition: Math.round((averagePosition + 4) * 10) / 10 },
      { month: 'Feb', avgPosition: Math.round((averagePosition + 3) * 10) / 10 },
      { month: 'Mar', avgPosition: Math.round((averagePosition + 2) * 10) / 10 },
      { month: 'Apr', avgPosition: Math.round((averagePosition + 1) * 10) / 10 },
      { month: 'May', avgPosition: Math.round((averagePosition + 0.5) * 10) / 10 },
      { month: 'Jun', avgPosition: Math.round(averagePosition * 10) / 10 },
    ];
    
    const visibilityTrend = [
      { month: 'Jan', visibility: Math.max(50, Math.round(visibilityScore - 12)) },
      { month: 'Feb', visibility: Math.max(55, Math.round(visibilityScore - 8)) },
      { month: 'Mar', visibility: Math.max(60, Math.round(visibilityScore - 6)) },
      { month: 'Apr', visibility: Math.max(65, Math.round(visibilityScore - 4)) },
      { month: 'May', visibility: Math.max(70, Math.round(visibilityScore - 2)) },
      { month: 'Jun', visibility: Math.round(visibilityScore) },
    ];
    
    return {
      averagePosition: Math.round(averagePosition * 10) / 10,
      top10Keywords,
      top100Keywords,
      visibilityScore: Math.round(visibilityScore),
      totalKeywords,
      improvingKeywords,
      positionTrend,
      visibilityTrend
    };
    
  } catch (error) {
    console.error('Error calculating ranking analytics:', error);
    return null;
  }
};

export const getTopKeywordsFromRankings = (rankings: any[], limit: number = 10): any[] => {
  try {
    // Group by keyword and get latest ranking
    const keywordMap = new Map();
    
    rankings.forEach(ranking => {
      if (!keywordMap.has(ranking.keyword) || 
          new Date(ranking.createdAt) > new Date(keywordMap.get(ranking.keyword).createdAt)) {
        keywordMap.set(ranking.keyword, ranking);
      }
    });
    
    const latestRankings = Array.from(keywordMap.values());
    
    // Sort rankings: found rankings first (by position), then not found
    const sortedRankings = latestRankings.sort((a, b) => {
      // If both are found, sort by position (best first)
      if (a.found && b.found && a.currentPosition && b.currentPosition) {
        return a.currentPosition - b.currentPosition;
      }
      // If only one is found, prioritize it
      if (a.found && a.currentPosition && (!b.found || !b.currentPosition)) {
        return -1;
      }
      if (b.found && b.currentPosition && (!a.found || !a.currentPosition)) {
        return 1;
      }
      // If neither is found, sort alphabetically by keyword
      return a.keyword.localeCompare(b.keyword);
    });
    
    // Take top N and format for display
    const topKeywords = sortedRankings
      .slice(0, limit)
      .map((ranking, index) => {
        // Generate position changes (simulated)
        const changes = ['+2', '+5', '+1', '-1', '+3', '0', '+4', '-2'];
        const randomChange = changes[Math.floor(Math.random() * changes.length)];
        
        return {
          rank: index + 1,
          keyword: ranking.keyword,
          position: (ranking.found && ranking.currentPosition) ? `#${ranking.currentPosition}` : 'Not Ranking',
          change: (ranking.found && ranking.currentPosition) ? randomChange : 'New',
          searchVolume: ranking.searchVolume || 0,
          difficulty: ranking.difficulty || 0,
          lastUpdated: ranking.date,
          found: ranking.found,
          currentPosition: ranking.currentPosition
        };
      });
    
    return topKeywords;
    
  } catch (error) {
    console.error('Error getting top keywords:', error);
    return [];
  }
};

// Utility function for extracting social media URLs (doesn't require Firebase)
export const extractSocialMediaUrl = (publishedData: PublishedPostData): string | null => {
  try {
    console.log('🔍 Extracting URL from published data:', {
      id: publishedData.id,
      platform: publishedData.platform,
      hasDirectUrl: !!publishedData.url,
      hasResults: !!publishedData.results,
      hasUploadPostResponse: !!publishedData.uploadPostResponse
    });
    
    // Priority 1: Check direct url field first
    if (publishedData.url) {
      console.log('✅ Found direct URL:', publishedData.url);
      return publishedData.url;
    }
    
    // Priority 2: Check uploadPostResponse.url field (generic URL)
    if (publishedData.uploadPostResponse?.url) {
      console.log('✅ Found URL in uploadPostResponse:', publishedData.uploadPostResponse.url);
      return publishedData.uploadPostResponse.url;
    }
    
    // Priority 3: Check results object for platform-specific URLs (fallback)
    if (publishedData.results) {
      console.log('🔍 Checking results object:', publishedData.results);
      const platform = publishedData.platform.toLowerCase();
      const platformResult = publishedData.results[platform];
      if (platformResult && platformResult.url) {
        console.log('✅ Found URL in results[platform]:', platformResult.url);
        return platformResult.url;
      }
      
      // Check all platforms in results as fallback
      for (const [key, value] of Object.entries(publishedData.results)) {
        if (value && typeof value === 'object' && 'url' in value && value.url) {
          console.log('✅ Found URL in results iteration:', value.url);
          return value.url as string;
        }
      }
    }
    
    // Priority 4: Check uploadPostResponse.results structure (fallback)
    if (publishedData.uploadPostResponse?.results && typeof publishedData.uploadPostResponse.results === 'object') {
      console.log('🔍 Checking uploadPostResponse.results:', publishedData.uploadPostResponse.results);
      const platform = publishedData.platform.toLowerCase();
      const platformResult = publishedData.uploadPostResponse.results[platform];
      if (platformResult && typeof platformResult === 'object' && 'url' in platformResult && platformResult.url) {
        console.log('✅ Found URL in uploadPostResponse.results[platform]:', platformResult.url);
        return platformResult.url as string;
      }
      
      // Check all platforms in uploadPostResponse.results as fallback
      for (const [key, value] of Object.entries(publishedData.uploadPostResponse.results)) {
        if (value && typeof value === 'object' && 'url' in value && value.url) {
          console.log('✅ Found URL in uploadPostResponse.results iteration:', value.url);
          return value.url as string;
        }
      }
    }
    
    console.log('❌ No URL found in any location');
    return null;
  } catch (error) {
    console.error('❌ Error extracting social media URL:', error);
    return null;
  }
};