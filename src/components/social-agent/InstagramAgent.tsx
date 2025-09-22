'use client';

import React from 'react';
import { SocialAgentInterface } from './SocialAgentInterface';

interface InstagramAgentProps {
  onBack: () => void;
  portal?: string;
}

export function InstagramAgent({ onBack, portal }: InstagramAgentProps) {
  return (
    <SocialAgentInterface
      platform="instagram"
      onBack={onBack}
      portal={portal}
    />
  );
}

export default InstagramAgent;