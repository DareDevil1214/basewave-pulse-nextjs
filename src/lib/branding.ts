// Dynamic branding system that uses business data from Firestore
// Falls back to BaseWave as default when no business data exists

export interface BusinessBranding {
  name: string;
  logoUrl?: string;
  website?: string;
  description?: string;
  primaryColor?: string;
  secondaryColor?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    threads?: string;
  };
}

// Default BaseWave branding
const DEFAULT_BRANDING: BusinessBranding = {
  name: 'BaseWave',
  logoUrl: '/logo-basewave.png', // You'll need to add this logo
  website: 'https://basewave.com',
  description: 'AI-Powered Business Intelligence Platform',
  primaryColor: '#3B82F6', // Blue
  secondaryColor: '#1E40AF', // Dark blue
  socialLinks: {
    facebook: 'https://www.facebook.com/basewave',
    instagram: 'https://www.instagram.com/basewave/',
    twitter: 'https://x.com/basewave',
    linkedin: 'https://www.linkedin.com/company/basewave',
    threads: 'https://www.threads.com/@basewave'
  }
};

// Cache for business branding data
let businessBrandingCache: BusinessBranding | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get current business branding from user context or cache
 * Falls back to BaseWave default if no business data available
 */
export function getCurrentBranding(): BusinessBranding {
  // Check if we have cached data that's still valid
  if (businessBrandingCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return businessBrandingCache;
  }

  // Try to get business data from localStorage (set during login)
  try {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.businessName && user.businessName !== 'Not set') {
        const branding: BusinessBranding = {
          name: user.businessName,
          logoUrl: user.logoUrl || DEFAULT_BRANDING.logoUrl,
          website: user.website || DEFAULT_BRANDING.website,
          description: user.description || DEFAULT_BRANDING.description,
          primaryColor: user.primaryColor || DEFAULT_BRANDING.primaryColor,
          secondaryColor: user.secondaryColor || DEFAULT_BRANDING.secondaryColor,
          socialLinks: user.socialLinks || DEFAULT_BRANDING.socialLinks
        };
        
        // Cache the branding data
        businessBrandingCache = branding;
        cacheTimestamp = Date.now();
        
        return branding;
      }
    }
  } catch (error) {
    console.warn('Failed to parse user data from localStorage:', error);
  }

  // Fall back to default BaseWave branding
  return DEFAULT_BRANDING;
}

/**
 * Update business branding cache
 * This should be called when user data changes
 */
export function updateBrandingCache(branding: BusinessBranding) {
  businessBrandingCache = branding;
  cacheTimestamp = Date.now();
}

/**
 * Clear branding cache
 * This should be called on logout
 */
export function clearBrandingCache() {
  businessBrandingCache = null;
  cacheTimestamp = 0;
}

/**
 * Get portal ID based on business name
 * Maps business names to portal identifiers
 */
export function getPortalId(businessName?: string): string {
  if (!businessName || businessName === 'Not set') {
    return 'basewave';
  }

  // Convert business name to portal ID
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Get portal display name
 */
export function getPortalDisplayName(portalId?: string): string {
  const branding = getCurrentBranding();
  return branding.name;
}

/**
 * Get portal logo URL
 */
export function getPortalLogoUrl(portalId?: string): string {
  const branding = getCurrentBranding();
  return branding.logoUrl || DEFAULT_BRANDING.logoUrl;
}

/**
 * Get portal website URL
 */
export function getPortalWebsiteUrl(portalId?: string): string {
  const branding = getCurrentBranding();
  return branding.website || DEFAULT_BRANDING.website;
}

/**
 * Get portal social links
 */
export function getPortalSocialLinks(portalId?: string) {
  const branding = getCurrentBranding();
  return branding.socialLinks || DEFAULT_BRANDING.socialLinks;
}

/**
 * Check if current portal is BaseWave (default)
 */
export function isBaseWavePortal(): boolean {
  const branding = getCurrentBranding();
  return branding.name === DEFAULT_BRANDING.name;
}

/**
 * Get portal-specific configuration
 */
export function getPortalConfig(portalId?: string) {
  const branding = getCurrentBranding();
  const portal = getPortalId(branding.name);
  
  return {
    id: portal,
    name: branding.name,
    logoUrl: branding.logoUrl || DEFAULT_BRANDING.logoUrl,
    website: branding.website || DEFAULT_BRANDING.website,
    description: branding.description || DEFAULT_BRANDING.description,
    primaryColor: branding.primaryColor || DEFAULT_BRANDING.primaryColor,
    secondaryColor: branding.secondaryColor || DEFAULT_BRANDING.secondaryColor,
    socialLinks: branding.socialLinks || DEFAULT_BRANDING.socialLinks
  };
}
