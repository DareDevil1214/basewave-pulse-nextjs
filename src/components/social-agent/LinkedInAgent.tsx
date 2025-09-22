'use client';

import React from 'react';
import { SocialAgentInterface } from './SocialAgentInterface';

interface LinkedInAgentProps {
  onBack: () => void;
  portal?: string;
}

export function LinkedInAgent({ onBack, portal }: LinkedInAgentProps) {
  return (
    <SocialAgentInterface
      platform="linkedin"
      onBack={onBack}
      portal={portal}
    />
  );
}

export default LinkedInAgent;