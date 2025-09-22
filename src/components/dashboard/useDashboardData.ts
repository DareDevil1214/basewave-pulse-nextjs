import { useState, useEffect } from 'react';
import {
  fetchBestKeywords,
  fetchSocialPostsFromFirebase,
  fetchBlogPostsFromFirebase,
  fetchBlogSchedules,
  fetchSocialScheduledPosts,
  BestKeyword
} from '@/lib/firebase';
import { fetchBlogPosts } from '@/lib/blog-posts';

interface DashboardMetrics {
  totalBlogs: number;
  totalSocialPosts: number;
  totalKeywords: number;
  scheduledContent: number;
  avgKeywordRank: number;
  blogPortals: number;
  socialAccounts: number;
}

interface RecentBlog {
  id: string;
  title: string;
  portal: string;
  createdAt: string;
  status: string;
  wordCount?: number;
}

interface RecentSocialPost {
  id: string;
  title: string;
  platform: string;
  createdAt: string;
  status: string;
  account: string;
}

interface ScheduledItem {
  id: string;
  title: string;
  type: 'blog' | 'social';
  scheduledDate: string;
  platform?: string;
  status: string;
  portal?: string;
  keywords?: string[];
}

export function useDashboardData() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalBlogs: 0,
    totalSocialPosts: 0,
    totalKeywords: 0,
    scheduledContent: 0,
    avgKeywordRank: 0,
    blogPortals: 0,
    socialAccounts: 0
  });

  const [recentBlogs, setRecentBlogs] = useState<RecentBlog[]>([]);
  const [recentSocialPosts, setRecentSocialPosts] = useState<RecentSocialPost[]>([]);
  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>([]);
  const [topKeywords, setTopKeywords] = useState<BestKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all real data from Firebase and APIs
      const [
        bestKeywords,
        blogContent,
        socialPostsFromFirebase,
        blogPostsFromFirebase,
        blogSchedules,
        socialScheduledPosts
      ] = await Promise.all([
        fetchBestKeywords().catch(() => []),
        fetchBlogPosts().catch(() => []),
        fetchSocialPostsFromFirebase().catch(() => []),
        fetchBlogPostsFromFirebase().catch(() => []),
        fetchBlogSchedules().catch(() => []),
        fetchSocialScheduledPosts().catch(() => [])
      ]);

      console.log('Dashboard data fetched:', {
        bestKeywords: bestKeywords.length,
        blogContent: blogContent.length,
        socialPostsFromFirebase: socialPostsFromFirebase.length,
        blogPostsFromFirebase: blogPostsFromFirebase.length,
        blogSchedules: blogSchedules.length,
        socialScheduledPosts: socialScheduledPosts.length
      });

      console.log('📅 Scheduled content breakdown:', {
        blogSchedules: blogSchedules.length,
        socialScheduledPosts: socialScheduledPosts.length,
        total: blogSchedules.length + socialScheduledPosts.length
      });



      // Process recent blogs from Firebase blog_posts collection
      const processedBlogs: RecentBlog[] = blogPostsFromFirebase
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
        .slice(0, 4)
        .map(blog => ({
          id: blog.id || '',
          title: blog.title || blog.originalTitle || 'Untitled',
          portal: blog.portal || blog.contentType || 'blog',
          createdAt: blog.createdAt || '',
          status: blog.status || 'published',
          wordCount: blog.wordCount || 0
        }));

            // Process recent social media posts from Firebase socialAgent_generatedPosts collection
      const processedSocialPosts: RecentSocialPost[] = socialPostsFromFirebase
        .filter(post => post.status === 'published')
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
        .slice(0, 4)
        .map(post => {
          return {
            id: post.id || '',
            title: (post as any).originalTitle || (post as any).title || 'Social Media Post',
            platform: (post as any).platform || 'Twitter', // Platform field might be missing
            createdAt: post.createdAt || '',
            status: post.status || 'published',
            account: (post as any).portal || (post as any).account || 'Unknown Portal' // Use portal field since that's what's coming through
          };
        });



      // Process scheduled content from real scheduling collections
      const processedScheduled: ScheduledItem[] = [];

             // Add blog schedules as scheduled content
       blogSchedules.forEach(schedule => {
         processedScheduled.push({
          id: schedule.id,
          title: schedule.name || schedule.title || 'Untitled Blog Post',
          type: 'blog',
          scheduledDate: schedule.createdAt || schedule.scheduledFor || schedule.scheduledDate || '',
          status: schedule.status || 'scheduled',
          portal: schedule.portal || 'Unknown Portal',
          keywords: schedule.keywords || []
        });
      });

                    // Add social scheduled posts as scheduled content
       socialScheduledPosts.forEach(post => {
         processedScheduled.push({
           id: post.id,
           title: post.name || post.title || post.originalTitle || 'Social Media Post',
           type: 'social',
           scheduledDate: post.createdAt || post.scheduledFor || post.scheduledDate || '',
           platform: post.platforms?.[0] || post.platform || 'Unknown Platform',
           status: post.status || 'scheduled',
           portal: post.account || 'Unknown Portal'
         });
       });

      

      // Calculate average keyword rank
      const rankedKeywords = bestKeywords.filter(k => k.difficulty && k.difficulty > 0);
      const avgRank = rankedKeywords.length > 0
        ? rankedKeywords.reduce((sum, k) => sum + (k.difficulty || 0), 0) / rankedKeywords.length
        : 0;

      // Update state with real data
      setMetrics({
        totalBlogs: blogPostsFromFirebase.length,
        totalSocialPosts: socialPostsFromFirebase.length,
        totalKeywords: bestKeywords.length,
        scheduledContent: blogSchedules.length + socialScheduledPosts.length,
        avgKeywordRank: Math.round(avgRank),
        blogPortals: Math.max(1, new Set(blogPostsFromFirebase.map(blog => blog.portal)).size), // Minimum 1 portal
        socialAccounts: Math.max(5, new Set(socialPostsFromFirebase.map(post => (post as any).account)).size) // Minimum 5 accounts
      });

      setRecentBlogs(processedBlogs);
      setRecentSocialPosts(processedSocialPosts);
      setScheduledItems(processedScheduled);
      setTopKeywords(bestKeywords.slice(0, 5));
      setLastUpdate(new Date().toLocaleTimeString());

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default empty values on error
      setMetrics({
        totalBlogs: 0,
        totalSocialPosts: 0,
        totalKeywords: 0,
        scheduledContent: 0,
        avgKeywordRank: 0,
        blogPortals: 0,
        socialAccounts: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto refresh every 10 minutes
    const interval = setInterval(fetchDashboardData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    recentBlogs,
    recentSocialPosts,
    scheduledItems,
    topKeywords,
    loading,
    lastUpdate,
    fetchDashboardData
  };
}