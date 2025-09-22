// Portal mapping utility for consistent filtering across collections

export interface PortalMapping {
  [key: string]: string;
}

// Map portal display names to collection filter values
export const PORTAL_MAPPING: PortalMapping = {
  'neovibemag': 'neovibemag',
  'neo-vibe-mag': 'neovibemag',
  'elite-equilibrium': 'eliteequilibrium',
  'eliteequilibrium': 'eliteequilibrium',  // ✅ Add this if missing
  'eternalelite': 'eternalelite',
  'eternal-elite': 'eternalelite',
  'newpeople': 'newpeople',
  'new-people': 'newpeople'
};

// Get the normalized portal name for filtering
export const getNormalizedPortalName = (portal: string): string => {
  const normalized = portal.toLowerCase();
  return PORTAL_MAPPING[normalized] || normalized;
};

// Get the normalized portal name for blog content filtering (compBlogContent collection)
export const getNormalizedPortalNameForBlog = (portal: string): string => {
  const normalized = portal.toLowerCase();
  
  return PORTAL_MAPPING[normalized] || normalized;
};

// Get portal display name from normalized name
export const getPortalDisplayName = (normalizedPortal: string): string => {
  const displayNames: { [key: string]: string } = {
    'neovibemag': 'Neo Vibe Mag',
    'eliteequilibrium': 'Elite Equilibrium',
    'eternalelite': 'Eternal Elite',
    'newpeople': 'New People'
  };
  return displayNames[normalizedPortal] || normalizedPortal;
};

// Get portal logo path
export const getPortalLogoPath = (portal: string): string => {
  const logoPaths: { [key: string]: string } = {
    'neovibemag': '/logo-load.webp',
    'eliteequilibrium': '/elite-logo.png',
    'eternalelite': '/eternal-logo.png',
    'newpeople': '/logo-load.webp'
  };
  return logoPaths[portal] || '/logo.png';
};
