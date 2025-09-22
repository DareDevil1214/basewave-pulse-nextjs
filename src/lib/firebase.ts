import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, query, orderBy, limit, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error('Missing required Firebase configuration. Please check your environment variables.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Analytics only on client side
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Firebase Auth
export const auth = getAuth(app);



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







// Fetch best keywords from Firestore
export const fetchBestKeywords = async (): Promise<BestKeyword[]> => {
  try {
    console.log('🔍 Fetching best keywords from Firebase...');
    
    const querySnapshot = await getDocs(collection(db, 'best_keywords'));
    console.log('📄 Best keywords snapshot size:', querySnapshot.size);
    
    if (querySnapshot.size === 0) {
      console.log('❌ No documents found in best_keywords collection');
      return [];
    }
    
    const bestKeywords: BestKeyword[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as BestKeyword;
      bestKeywords.push({
        ...data,
        id: doc.id
      });
    });
    
    // Sort by order field
    bestKeywords.sort((a, b) => a.order - b.order);
    
    console.log('✅ Fetched best keywords:', bestKeywords.length, 'documents');
    return bestKeywords;
  } catch (error) {
    console.error('❌ Error fetching best keywords:', error);
    return [];
  }
};

// Fetch keyword rankings from Firestore
export const fetchKeywordRankings = async (): Promise<any[]> => {
  try {
    const db = getFirestore();
    const rankingsRef = collection(db, 'keyword_rankings');
    const q = query(rankingsRef, orderBy('createdAt', 'desc'), limit(100));
    const querySnapshot = await getDocs(q);
    
    const rankings: any[] = [];
    querySnapshot.forEach((doc) => {
      rankings.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return rankings;
  } catch (error) {
    console.error('Error fetching keyword rankings from Firebase:', error);
    return [];
  }
};

// Calculate ranking analytics from Firebase data
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

// Get top keywords from Firebase ranking data
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

export default app;



// Direct Firebase collection fetchers for Dashboard
export const fetchSocialPostsFromFirebase = async (): Promise<any[]> => {
  try {
    console.log('📋 Fetching social posts from Firebase collection...');
    const postsRef = collection(db, 'socialAgent_generatedPosts');
    
    // Try with orderBy first, fallback to no ordering if createdAt field is missing
    let querySnapshot;
    try {
      const q = query(postsRef, orderBy('createdAt', 'desc'));
      querySnapshot = await getDocs(q);
    } catch (error) {
      console.log('⚠️ createdAt field missing, fetching without ordering...');
      querySnapshot = await getDocs(postsRef);
    }
    
    console.log(`📄 Query snapshot size: ${querySnapshot.size}`);
    
    const posts: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📋 Document ${doc.id}:`, data);
      console.log(`📋 Document ${doc.id} account field:`, data.account);
      console.log(`📋 Document ${doc.id} keys:`, Object.keys(data));
      posts.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log(`✅ Fetched ${posts.length} social posts from Firebase`);
    console.log('📋 First few posts:', posts.slice(0, 3));
    return posts;
  } catch (error) {
    console.error('❌ Error fetching social posts from Firebase:', error);
    return [];
  }
};

export const fetchBlogPostsFromFirebase = async (): Promise<any[]> => {
  try {
    console.log('📋 Fetching blog posts from Firebase collection...');
    const postsRef = collection(db, 'blog_posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const posts: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log(`✅ Fetched ${posts.length} blog posts from Firebase`);
    return posts;
  } catch (error) {
    console.error('❌ Error fetching blog posts from Firebase:', error);
    return [];
  }
};




// Extract social media URL from published post data
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

// Fetch blog schedules from blogSchedules collection
export const fetchBlogSchedules = async (): Promise<any[]> => {
  try {
    console.log('📋 Fetching blog schedules from Firebase...');
    const schedulesRef = collection(db, 'blogSchedules');
    const q = query(schedulesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const schedules: any[] = [];
    querySnapshot.forEach((doc) => {
      schedules.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Fetched ${schedules.length} blog schedules from Firebase`);
    return schedules;
  } catch (error) {
    console.error('❌ Error fetching blog schedules from Firebase:', error);
    return [];
  }
};

// Fetch social media scheduled posts from socialAgent_scheduledPosts collection
export const fetchSocialScheduledPosts = async (): Promise<any[]> => {
  try {
    console.log('📋 Fetching social media scheduled posts from Firebase...');
    const scheduledPostsRef = collection(db, 'socialAgent_scheduledPosts');
    const q = query(scheduledPostsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const scheduledPosts: any[] = [];
    querySnapshot.forEach((doc) => {
      scheduledPosts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Fetched ${scheduledPosts.length} social media scheduled posts from Firebase`);
    return scheduledPosts;
  } catch (error) {
    console.error('❌ Error fetching social media scheduled posts from Firebase:', error);
    return [];
  }
};


// Add this function to your existing firebase.ts file
export const fetchLeadsFromFirebase = async () => {
  try {
    const leadsRef = collection(db, 'portals_lead');
    
    // Use Firebase query with orderBy for efficient sorting (newest first)
    const q = query(leadsRef, orderBy('createdAt', 'desc'));
    const leadsSnapshot = await getDocs(q);
    
    const leads: any[] = [];
    leadsSnapshot.forEach((doc) => {
      leads.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Data is already sorted by Firebase, but we can add a fallback sort if needed
    // This ensures consistency even if some documents don't have createdAt
    leads.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Latest first (descending order)
    });
    
    return leads;
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
};

// Update lead status in Firebase
export const updateLeadStatus = async (leadId: string, newStatus: string) => {
  try {
    console.log(`🔄 Updating lead ${leadId} status to: ${newStatus}`);
    const leadRef = doc(db, 'portals_lead', leadId);
    await updateDoc(leadRef, {
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
    console.log(`✅ Successfully updated lead ${leadId} status to: ${newStatus}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating lead ${leadId} status:`, error);
    throw error;
  }
};

// Delete lead from Firebase
export const deleteLead = async (leadId: string) => {
  try {
    console.log(`🗑️ Deleting lead ${leadId} from Firebase...`);
    const leadRef = doc(db, 'portals_lead', leadId);
    await deleteDoc(leadRef);
    console.log(`✅ Successfully deleted lead ${leadId} from Firebase`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting lead ${leadId}:`, error);
    throw error;
  }
};

// Reporting functions
export const fetchReportingData = async () => {
  try {
    console.log('📊 Fetching reporting data from Firebase...');
    const reportingRef = collection(db, 'reportingData');
    const reportingSnapshot = await getDocs(reportingRef);
    
    if (!reportingSnapshot.empty) {
      const doc = reportingSnapshot.docs[0]; // Get first document
      const data = doc.data();
      console.log('✅ Successfully fetched reporting data:', data);
      return {
        id: doc.id,
        emails: data.reporting?.emails || [],
        lastWebhookTime: data.lastWebhookTime || 0
      };
    } else {
      console.log('ℹ️ No reporting data found, creating default structure');
      return {
        id: null,
        emails: [],
        lastWebhookTime: 0
      };
    }
  } catch (error) {
    console.error('❌ Error fetching reporting data:', error);
    throw error;
  }
};

export const updateReportingEmails = async (emails: string[]) => {
  try {
    console.log('📧 Updating reporting emails in Firebase:', emails);
    
    // Check if reportingData collection exists and has documents
    const reportingRef = collection(db, 'reportingData');
    const reportingSnapshot = await getDocs(reportingRef);
    
    if (reportingSnapshot.empty) {
      // Create new document with default structure
      const newDocRef = doc(reportingRef);
      await setDoc(newDocRef, {
        reporting: {
          emails: emails
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Created new reporting document with emails');
    } else {
      // Update existing document
      const docRef = doc(db, 'reportingData', reportingSnapshot.docs[0].id);
      await updateDoc(docRef, {
        'reporting.emails': emails,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Successfully updated reporting emails');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error updating reporting emails:', error);
    throw error;
  }
};

export const updateLastWebhookTime = async (timestamp: number) => {
  try {
    console.log('⏰ Updating last webhook time in Firebase:', new Date(timestamp).toISOString());
    
    // Check if reportingData collection exists and has documents
    const reportingRef = collection(db, 'reportingData');
    const reportingSnapshot = await getDocs(reportingRef);
    
    if (reportingSnapshot.empty) {
      // Create new document with default structure
      const newDocRef = doc(reportingRef);
      await setDoc(newDocRef, {
        reporting: {
          emails: []
        },
        lastWebhookTime: timestamp,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Created new reporting document with last webhook time');
    } else {
      // Update existing document
      const docRef = doc(db, 'reportingData', reportingSnapshot.docs[0].id);
      await updateDoc(docRef, {
        lastWebhookTime: timestamp,
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Successfully updated last webhook time');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error updating last webhook time:', error);
    throw error;
  }
};