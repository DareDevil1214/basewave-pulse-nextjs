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
  'new-people': {
    facebook: 'https://www.facebook.com/newpeople',
    instagram: 'https://www.instagram.com/newpeople/',
    threads: 'https://www.threads.com/@newpeople',
    twitter: 'https://x.com/newpeople',
    linkedin: 'https://www.linkedin.com/company/newpeople'
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
  'new-people': {
    website: 'https://www.new-people.cv/'
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
    'newpeople': 'new-people',
    'new-people': 'new-people'
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
