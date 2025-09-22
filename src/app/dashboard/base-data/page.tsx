'use client';

import { useSearchParams } from 'next/navigation';
import { PortalHeader, PortalConfigsSection, PortalKeywordsSection, CVMakerKeywordsSection } from '@/components/base-data';

export default function BaseDataPage() {
  const searchParams = useSearchParams();
  const currentPortal = searchParams.get('portal') || 'newpeople';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full space-y-8">
        {/* Portal Header */}
        <PortalHeader selectedPortal={currentPortal} />

        {/* Portal Configurations Section - Only for New People */}
        {currentPortal === 'newpeople' && (
          <PortalConfigsSection />
        )}

        {/* Portal Keywords Section */}
        {currentPortal === 'newpeople' && (
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
