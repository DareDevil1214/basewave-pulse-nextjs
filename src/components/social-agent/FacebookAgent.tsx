'use client';

import React from 'react';
import { SocialAgentInterface } from './SocialAgentInterface';

interface FacebookAgentProps {
  onBack: () => void;
  portal?: string;
}

export function FacebookAgent({ onBack, portal }: FacebookAgentProps) {
  return (
    <SocialAgentInterface
      platform="facebook"
      onBack={onBack}
      portal={portal}
    />
  );
}

export default FacebookAgent;