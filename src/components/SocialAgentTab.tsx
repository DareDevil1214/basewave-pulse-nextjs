'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { InstagramAgent } from './social-agent/InstagramAgent';
import { LinkedInAgent } from './social-agent/LinkedInAgent';
import { FacebookAgent } from './social-agent/FacebookAgent';
import { XAgent } from './social-agent/XAgent';
import { ThreadsAgent } from './social-agent/ThreadsAgent';

export type SocialPlatform = 'tiktok' | 'instagram' | 'linkedin' | 'youtube' | 'facebook' | 'x' | 'pinterest' | 'threads';

interface SocialAgentTabProps {
  // Add any props if needed in the future
}

export function SocialAgentTab({}: SocialAgentTabProps) {
  const searchParams = useSearchParams();
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  const selectedPortal = 'newpeople';

  useEffect(() => {
    const platform = searchParams.get('platform') as SocialPlatform;

    if (platform) {
      setSelectedPlatform(platform);
    }
  }, [searchParams]);

  const handleBackToSelection = () => {
    setSelectedPlatform(null);
  };

  const renderSelectedPlatform = () => {
    if (!selectedPlatform) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Welcome to Social Media Agents</h2>
            <p className="text-gray-500">Please select a platform from the sidebar to get started.</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      onBack: handleBackToSelection,
      portal: selectedPortal
    };

    switch (selectedPlatform) {
      case 'instagram':
        return <InstagramAgent {...commonProps} />;
      case 'linkedin':
        return <LinkedInAgent {...commonProps} />;
      case 'facebook':
        return <FacebookAgent {...commonProps} />;
      case 'x':
        return <XAgent {...commonProps} />;
      case 'threads':
        return <ThreadsAgent {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={`platform-${selectedPlatform}-${selectedPortal}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {renderSelectedPlatform()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default SocialAgentTab;