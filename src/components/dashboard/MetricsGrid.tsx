import { MetricCard } from './MetricCard';
import { Globe, Users } from 'lucide-react';

interface DashboardMetrics {
  totalBlogs: number;
  totalSocialPosts: number;
  totalKeywords: number;
  scheduledContent: number;
  avgKeywordRank: number;
  blogPortals: number;
  socialAccounts: number;
}

interface MetricsGridProps {
  metrics: DashboardMetrics;
  loading: boolean;
}

export function MetricsGrid({ metrics, loading }: MetricsGridProps) {
  return (
    <div className="space-y-6">
      {/* Top Row - First 3 metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Blogs"
          value={metrics.totalBlogs}
          subtitle="Published articles"
          loading={loading}
        />
        <MetricCard
          title="Social Media Posts"
          value={metrics.totalSocialPosts}
          subtitle="Across all platforms"
          loading={loading}
        />
        <MetricCard
          title="Scheduled Content"
          value={metrics.scheduledContent}
          subtitle="Upcoming posts"
          loading={loading}
        />
      </div>

      {/* Bottom Row - Last 3 metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="SEO Keywords"
          value={metrics.totalKeywords}
          subtitle="Tracked keywords"
          loading={loading}
        />
        <MetricCard
          title="Blog Portals"
          value={metrics.blogPortals}
          subtitle="New People"
          loading={loading}
        />
        <MetricCard
          title="Social Accounts"
          value={metrics.socialAccounts}
          subtitle="Instagram, Facebook, Threads, LinkedIn, X"
          loading={loading}
        />
      </div>
    </div>
  );
}
