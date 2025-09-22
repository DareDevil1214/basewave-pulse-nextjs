import { 
  KeywordSearchVolume, 
  KeywordDiff, 
  CompetitorUrlData 
} from '@/lib/firebase';

export interface KeywordPerformance {
  keyword: string;
  type: string;
  intent: string;
  position: number;
  previousPosition: number;
  change: number;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  url: string;
  trafficEstimate: number;
  conversionRate: number;
  bounceRate: number;
  avgSessionDuration: string;
  featuredSnippet: boolean;
  localPack: boolean;
  peopleAlsoAsk: boolean;
  relatedSearches: string[];
  competitors: Record<string, number>;
  trending: string;
  seasonality: string;
  contentGaps: string[];
}

export interface OrganicTraffic {
  current: number;
  previous: number;
  change: number;
  trends: Array<{
    date: string;
    traffic: number;
  }>;
}

export interface KeywordTabProps {
  firebaseLoading: boolean;
  firebaseError: string | null;
  lastRefreshTime: string;
  loadFirebaseData: () => void;
}





export interface SearchVolumeTabProps extends KeywordTabProps {
  firebaseSearchVolume: KeywordSearchVolume[];
}

export interface KeywordDiffTabProps extends KeywordTabProps {
  firebaseKeywordDiff: KeywordDiff[];
}



export interface CompetitorUrlTabProps extends KeywordTabProps {
  firebaseCompetitorUrlData: CompetitorUrlData[];
}



export interface SharedUIProps {
  text?: string;
  error?: string;
  retry?: () => void;
}

export interface OverviewTabProps {
  firebaseLoading?: boolean;
  firebaseError?: string | null;
  firebaseBestKeywords?: any[];
  loadFirebaseData: () => void;
  lastRefreshTime?: string;
  activeSubTab?: string;
  isAnyPageGenerating?: boolean;
  pageGenerationLoading?: any;
}
