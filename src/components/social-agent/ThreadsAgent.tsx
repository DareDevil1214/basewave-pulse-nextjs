'use client';

import React from 'react';
import { SocialAgentInterface } from './SocialAgentInterface';

interface ThreadsAgentProps {
  onBack: () => void;
  portal?: string;
}

export function ThreadsAgent({ onBack, portal }: ThreadsAgentProps) {
  return (
    <SocialAgentInterface
      platform="threads"
      onBack={onBack}
      portal={portal}
    />
  );
}

export default ThreadsAgent;