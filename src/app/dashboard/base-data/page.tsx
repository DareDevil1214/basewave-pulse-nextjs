'use client';

import { useSearchParams } from 'next/navigation';
import { getCurrentBranding } from '@/lib/branding';
import { PortalHeader, PortalConfigsSection, PortalKeywordsSection, CVMakerKeywordsSection } from '@/components/base-data';

export default function BaseDataPage() {
  const searchParams = useSearchParams();
  const currentPortal = searchParams.get('portal') || getCurrentBranding().name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'basewave';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full space-y-8">
        {/* Portal Header */}
        <PortalHeader selectedPortal={currentPortal} />

        {/* Portal Configurations Section - Only for current business */}
        {currentPortal === getCurrentBranding().name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') && (
          <PortalConfigsSection />
        )}

        {/* Portal Keywords Section */}
        {currentPortal === getCurrentBranding().name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') && (
          <PortalKeywordsSection />
        )}

        {/* CV Maker Keywords Section */}
        {currentPortal === 'cv-maker' && (
          <CVMakerKeywordsSection />
        )}
      </div>
    </div>
  );
}
