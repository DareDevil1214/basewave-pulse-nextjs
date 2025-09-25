// Dynamic portal mapping system
// Maps portal IDs to display names and configurations

import { getCurrentBranding, getPortalConfig } from './branding';

// Legacy portal mappings for backward compatibility
const LEGACY_PORTAL_MAPPINGS: Record<string, string> = {
  'newpeople': 'basewave',
  'new-people': 'basewave',
  'cv-maker': 'cv-maker'
};

// Portal display names
const PORTAL_DISPLAY_NAMES: Record<string, string> = {
  'basewave': 'BaseWave',
  'cv-maker': 'CV Maker'
};

// Portal logo mappings
const PORTAL_LOGOS: Record<string, string> = {
  'basewave': '/logo-basewave.png',
  'cv-maker': '/cv-maker.png'
};

/**
 * Get the current portal ID based on business branding
 * Falls back to 'basewave' if no business data
 */
export function getCurrentPortalId(): string {
  const branding = getCurrentBranding();
  return branding.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'basewave';
}

/**
 * Get portal display name
 * @param portalId - Portal identifier
 * @returns Display name for the portal
 */
export function getPortalDisplayName(portalId?: string): string {
  if (!portalId) {
    return getCurrentBranding().name;
  }
  
  // Check if it's a legacy portal ID
  const mappedId = LEGACY_PORTAL_MAPPINGS[portalId] || portalId;
  
  // Return display name from branding or fallback
  if (mappedId === getCurrentPortalId()) {
    return getCurrentBranding().name;
  }
  
  return PORTAL_DISPLAY_NAMES[mappedId] || portalId;
}

/**
 * Get portal logo URL
 * @param portalId - Portal identifier
 * @returns Logo URL for the portal
 */
export function getPortalLogoUrl(portalId?: string): string {
  if (!portalId) {
    return getCurrentBranding().logoUrl || '/logo-basewave.png';
  }
  
  // Check if it's a legacy portal ID
  const mappedId = LEGACY_PORTAL_MAPPINGS[portalId] || portalId;
  
  // Return logo from branding or fallback
  if (mappedId === getCurrentPortalId()) {
    return getCurrentBranding().logoUrl || '/logo-basewave.png';
  }
  
  return PORTAL_LOGOS[mappedId] || '/logo-basewave.png';
}

/**
 * Map legacy portal ID to current portal ID
 * @param legacyPortalId - Legacy portal identifier
 * @returns Current portal identifier
 */
export function mapLegacyPortalId(legacyPortalId: string): string {
  return LEGACY_PORTAL_MAPPINGS[legacyPortalId] || legacyPortalId;
}

/**
 * Check if portal ID is the current business portal
 * @param portalId - Portal identifier to check
 * @returns True if it's the current business portal
 */
export function isCurrentBusinessPortal(portalId: string): boolean {
  return mapLegacyPortalId(portalId) === getCurrentPortalId();
}

/**
 * Get all available portals
 * @returns Array of portal configurations
 */
export function getAvailablePortals() {
  const currentPortal = getCurrentPortalId();
  const currentBranding = getCurrentBranding();
  
  return [
    {
      id: currentPortal,
      name: currentBranding.name,
      logoUrl: currentBranding.logoUrl || '/logo-basewave.png',
      website: currentBranding.website || 'https://basewave.com',
      isCurrent: true
    },
    // Add other portals as needed
    {
      id: 'cv-maker',
      name: 'CV Maker',
      logoUrl: '/cv-maker.png',
      website: 'https://cv-maker.com',
      isCurrent: false
    }
  ];
}

/**
 * Get portal configuration by ID
 * @param portalId - Portal identifier
 * @returns Portal configuration object
 */
export function getPortalConfigById(portalId: string) {
  const availablePortals = getAvailablePortals();
  return availablePortals.find(portal => portal.id === portalId) || availablePortals[0];
}