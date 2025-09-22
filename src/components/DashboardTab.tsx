'use client';

import {
  DashboardHeader,
  MetricsGrid,
  ContentSections,
  useDashboardData
} from '@/components/dashboard';

export function DashboardTab() {
  const {
    metrics,
    recentBlogs,
    recentSocialPosts,
    scheduledItems,
    topKeywords,
    loading
  } = useDashboardData();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full space-y-8">
        {/* Dashboard Header */}
        <DashboardHeader />

        {/* Metrics Grid - Full Width */}
        <MetricsGrid metrics={metrics} loading={loading} />

        {/* Content Sections - Full Width Grid with Equal Spacing */}
        <ContentSections
          recentBlogs={recentBlogs}
          recentSocialPosts={recentSocialPosts}
          scheduledItems={scheduledItems}
          topKeywords={topKeywords}
            loading={loading}
        />
      </div>
    </div>
  );
}