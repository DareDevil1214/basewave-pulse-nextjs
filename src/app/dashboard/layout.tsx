'use client';

import { usePathname } from 'next/navigation';
import { ModernDashboardLayout } from '@/components/ui/modern-dashboard-layout';

const getPageInfo = (pathname: string) => {
  if (pathname === '/dashboard') {
    return {
      title: 'Dashboard',
      description: 'Welcome back to your intelligence platform'
    };
  } else if (pathname === '/dashboard/blog-agent') {
    return {
      title: 'Blog Agent',
      description: 'AI-powered content generation and blog management'
    };
  } else if (pathname === '/dashboard/social-agent') {
    return {
      title: 'Social Agent',
      description: 'Multi-platform social media content creation and management'
    };
  } else if (pathname === '/dashboard/seo') {
    return {
      title: 'SEO Analytics',
      description: 'Search engine optimization insights and keyword analytics'
    };
  } else if (pathname === '/dashboard/opportunities') {
    return {
      title: 'Opportunities',
      description: 'Manage and track business opportunities across your portals'
    };
  } else {
    return {
      title: 'Dashboard',
      description: 'Welcome back to your intelligence platform'
    };
  }
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageInfo = getPageInfo(pathname);

  return (
    <ModernDashboardLayout 
      pageTitle={pageInfo.title}
      pageDescription={pageInfo.description}
    >
      {children}
    </ModernDashboardLayout>
  );
}