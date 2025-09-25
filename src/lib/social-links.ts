import { getCurrentBranding } from './branding';

export interface SocialLinks {
  facebook: string;
  instagram: string;
  threads: string;
  twitter: string;
  linkedin: string;
}

export interface PortalLinks {
  website: string;
}

export const SOCIAL_LINKS: Record<string, SocialLinks> = {
  'eternal-elite': {
    facebook: 'https://www.facebook.com/profile.php?id=61579253498526',
    instagram: 'https://www.instagram.com/eternalelite45/',
    threads: 'https://www.threads.com/@eternalelite45',
    twitter: 'https://x.com/EternalElite12',
    linkedin: 'https://www.linkedin.com/in/eternal-elite-a2a7a3379/'
  },
  'elite-equilibrium': {
    facebook: 'https://www.facebook.com/profile.php?id=61579065467492',
    instagram: 'https://www.instagram.com/eliteequilibrium/',
    threads: 'https://www.threads.com/@eliteequilibrium',
    twitter: 'https://x.com/equil36247',
    linkedin: 'https://www.linkedin.com/in/elite-equilibrium-68779b379/'
  },
  'neo-vibe-mag': {
    facebook: 'https://www.facebook.com/profile.php?id=61579452839234',
    instagram: 'https://www.instagram.com/neovibemag/',
    threads: 'https://www.threads.com/@neovibemag',
    twitter: 'https://x.com/NeovibeMag',
    linkedin: 'https://www.linkedin.com/in/neovibe-mag-62a908379/'
  },
  'basewave': {
    facebook: 'https://www.facebook.com/basewave',
    instagram: 'https://www.instagram.com/basewave/',
    threads: 'https://www.threads.com/@basewave',
    twitter: 'https://x.com/basewave',
    linkedin: 'https://www.linkedin.com/company/basewave'
  }
};

export const PORTAL_LINKS: Record<string, PortalLinks> = {
  'eternal-elite': {
    website: 'https://www.eternal-elite.com/insights'
  },
  'elite-equilibrium': {
    website: 'https://www.eliteequilibrium.com/recoveryinsights'
  },
  'neo-vibe-mag': {
    website: 'https://www.neovibemag.com/articles'
  },
  'basewave': {
    website: 'https://basewave.com'
  }
};

export const getPortalId = (portal: string): string => {
  const portalMap: { [key: string]: string } = {
    'neovibemag': 'neo-vibe-mag',
    'neo-vibe-mag': 'neo-vibe-mag',
    'eliteequilibrium': 'elite-equilibrium',
    'elite-equilibrium': 'elite-equilibrium',
    'eternalelite': 'eternal-elite',
    'eternal-elite': 'eternal-elite',
    'newpeople': 'basewave',
    'new-people': 'basewave',
    'basewave': 'basewave'
  };
  return portalMap[portal.toLowerCase()] || portal;
};

export const getSocialLink = (portal: string, platform: string): string | null => {
  const portalId = getPortalId(portal);
  const socialLinks = SOCIAL_LINKS[portalId];
  
  if (!socialLinks) return null;
  
  const platformMap: { [key: string]: keyof SocialLinks } = {
    'facebook': 'facebook',
    'instagram': 'instagram',
    'threads': 'threads',
    'twitter': 'twitter',
    'x': 'twitter',
    'linkedin': 'linkedin'
  };
  
  const linkKey = platformMap[platform.toLowerCase()];
  return linkKey ? socialLinks[linkKey] : null;
};

export const getPortalLink = (portal: string): string | null => {
  const portalId = getPortalId(portal);
  const portalLinks = PORTAL_LINKS[portalId];
  return portalLinks ? portalLinks.website : null;
};

// Get current business social links
export function getCurrentSocialLinks(): SocialLinks {
  const branding = getCurrentBranding();
  return branding.socialLinks || SOCIAL_LINKS.basewave;
}

// Get current business portal link
export function getCurrentPortalLink(): string {
  const branding = getCurrentBranding();
  return branding.website || 'https://basewave.com';
}
