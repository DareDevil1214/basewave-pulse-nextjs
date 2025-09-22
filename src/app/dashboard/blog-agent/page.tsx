'use client';

import { BlogPortal } from '@/components/blog-agent';

export default function BlogAgentPage() {
  const portal = 'newpeople';

  // Render the unified BlogPortal component
  return <BlogPortal portal={portal} />;
}