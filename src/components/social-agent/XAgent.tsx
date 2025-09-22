'use client';

import React from 'react';
import { SocialAgentInterface } from './SocialAgentInterface';

interface XAgentProps {
  onBack: () => void;
  portal?: string;
}

export function XAgent({ onBack, portal }: XAgentProps) {
  return (
    <SocialAgentInterface
      platform="X"
      onBack={onBack}
      portal={portal}
    />
  );
}

export default XAgent;