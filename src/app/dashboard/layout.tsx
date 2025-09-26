'use client';

import { usePathname } from 'next/navigation';
import { ModernDashboardLayout } from '@/components/ui/modern-dashboard-layout';
import { OnboardingGuard } from '@/components/OnboardingGuard';

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
  } else if (pathname === '/dashboard/admin') {
    return {
      title: 'Admin Panel',
      description: 'Manage businesses and users'
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
    <OnboardingGuard>
      <ModernDashboardLayout 
        pageTitle={pageInfo.title}
        pageDescription={pageInfo.description}
      >
        {children}
      </ModernDashboardLayout>
    </OnboardingGuard>
  );
}