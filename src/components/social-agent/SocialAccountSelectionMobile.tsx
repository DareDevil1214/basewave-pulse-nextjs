'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface SocialAccount {
  id: string;
  name: string;
  username: string;
  isConnected: boolean;
  followers?: string;
  avatar?: string;
}

interface SocialAccountSelectionMobileProps {
  platform: string;
  accounts: SocialAccount[];
  onAccountSelect: (accountId: string) => void;
  onBack: () => void;
}

export function SocialAccountSelectionMobile({ 
  platform, 
  accounts, 
  onAccountSelect, 
  onBack 
}: SocialAccountSelectionMobileProps) {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  // Helper function to get display name for platform
  const getPlatformDisplayName = (platform: string): string => {
    const displayNames: { [key: string]: string } = {
      'x': 'Twitter',
      'twitter': 'Twitter',
      'tiktok': 'TikTok',
      'instagram': 'Instagram',
      'linkedin': 'LinkedIn',
      'youtube': 'YouTube',
      'facebook': 'Facebook',
      'pinterest': 'Pinterest',
      'threads': 'Threads'
    };
    return displayNames[platform.toLowerCase()] || platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
  };

  // Helper function to get social media URL for account
  const getSocialMediaUrl = (platform: string, username: string): string => {
    const urls: { [key: string]: string } = {
      'eliteequilibrium': {
        'x': 'https://x.com/equil36247',
        'linkedin': 'https://www.linkedin.com/in/elite-equilibrium-68779b379/',
        'threads': 'https://www.threads.com/@eliteequilibrium',
        'instagram': 'https://www.instagram.com/eliteequilibrium/',
        'facebook': 'https://www.facebook.com/people/Elite-Equilibrium/61579065467492/'
      }[platform.toLowerCase()] || '',
      'neovibemag': {
        'x': 'https://x.com/NeovibeMag',
        'linkedin': 'https://www.linkedin.com/in/neovibe-mag-62a908379/',
        'threads': 'https://www.threads.com/@neovibemag',
        'instagram': 'https://www.instagram.com/neovibemag/',
        'facebook': 'https://www.facebook.com/profile.php?id=61579452839234'
      }[platform.toLowerCase()] || '',
      'eternalelite': {
        'x': 'https://x.com/EternalElite12',
        'linkedin': 'https://www.linkedin.com/in/eternal-elite-a2a7a3379/',
        'threads': 'https://www.threads.com/@eternalelite45',
        'instagram': 'https://www.instagram.com/eternalelite45/',
        'facebook': 'https://www.facebook.com/profile.php?id=61579253498526'
      }[platform.toLowerCase()] || '',
      'eternelite': {
        'x': 'https://x.com/EternalElite12',
        'linkedin': 'https://www.linkedin.com/in/eternal-elite-a2a7a3379/',
        'threads': 'https://www.threads.com/@eternalelite45',
        'instagram': 'https://www.instagram.com/eternalelite45/',
        'facebook': 'https://www.facebook.com/eternalelite'
      }[platform.toLowerCase()] || '',
      'newpeople': {
        'x': 'https://x.com/NewPeople',
        'linkedin': 'https://www.linkedin.com/company/new-people',
        'threads': 'https://www.threads.com/@newpeople',
        'instagram': 'https://www.instagram.com/newpeople/',
        'facebook': 'https://www.facebook.com/newpeople'
      }[platform.toLowerCase()] || ''
    };
    return urls[username] || '';
  };

  // Helper function to get theme colors for the cards
  const getThemeColor = (accountId: string) => {
    const themeColors = {
      'neovibemag': '#553c9a', // Dark purple
      'eliteequilibrium': '#2d3748', // Dark gray
      'eternalelite': '#1a365d', // Dark blue
      'newpeople': '#059669' // Green theme
    };
    return themeColors[accountId as keyof typeof themeColors] || '#2d3748';
  };

  // Helper function to get logo paths
  const getLogoPath = (accountId: string) => {
    const logoPaths = {
      'neovibemag': '/logo-load.webp',
      'eliteequilibrium': '/elite-logo.png',
      'eternalelite': '/eternal-logo.png',
      'eternelite': '/eternal-logo.png',
      'newpeople': '/logo-load.webp'
    };
    return logoPaths[accountId as keyof typeof logoPaths] || '/logo-load.webp';
  };

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccount(accountId);
    onAccountSelect(accountId);
  };

  return (
    <div className="w-full">
      {/* Mobile Header */}
      <div className="mb-6">
        {/* Mobile Go Back Button */}
        <div className="mb-4">
          <button
            className="bg-white text-center w-28 rounded-2xl h-10 relative text-black text-sm font-semibold group border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            type="button"
            onClick={onBack}
          >
            <div
              className="bg-blue-400 rounded-xl h-8 w-1/4 flex items-center justify-center absolute left-1 top-[2px] group-hover:w-[136px] z-10 duration-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1024 1024"
                height="16px"
                width="16px"
              >
                <path
                  d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
                  fill="#000000"
                ></path>
                <path
                  d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                  fill="#000000"
                ></path>
              </svg>
            </div>
            <p className="translate-x-2">Go Back</p>
          </button>
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {getPlatformDisplayName(platform)} <span className="text-blue-600">Accounts</span>
          </h1>
          <p className="text-gray-600 text-sm">Select your portal to manage content</p>
        </div>
      </div>

      <div className="space-y-4">
        {accounts.map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative bg-white rounded-2xl border-2 border-gray-200 p-4 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] cursor-pointer"
            style={{ borderColor: selectedAccount === account.id ? getThemeColor(account.id) : '#e5e7eb' }}
            onClick={() => handleAccountSelect(account.id)}
          >
            {/* Selection indicator */}
            {selectedAccount === account.id && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Card Content */}
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: getThemeColor(account.id) }}
              >
                <Image 
                  src={getLogoPath(account.id)} 
                  alt={account.name} 
                  width={48} 
                  height={48} 
                  className="object-contain w-12 h-12 sm:w-16 sm:h-16"
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">{account.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  {getSocialMediaUrl(platform, account.username) ? (
                    <a 
                      href={getSocialMediaUrl(platform, account.username)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline transition-colors text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      @{account.username}
                    </a>
                  ) : (
                    <span className="text-gray-600 text-sm">@{account.username}</span>
                  )}
                  {account.followers && (
                    <span className="text-gray-500 text-xs">• {account.followers} followers</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase()}
                  </span>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    SOCIAL
                  </span>
                </div>
              </div>
              
              {/* Arrow indicator */}
              <div className="flex-shrink-0">
                <svg 
                  className={`w-5 h-5 transition-colors duration-300 ${
                    selectedAccount === account.id ? 'text-blue-500' : 'text-gray-400'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            
            {/* Bottom accent line */}
            <div 
              className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl transition-all duration-300 ${
                selectedAccount === account.id ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundColor: getThemeColor(account.id) }}
            />
          </motion.div>
        ))}
      </div>

      {/* No Accounts Message */}
      {accounts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-gray-800 text-lg font-semibold mb-2">No Accounts Found</h3>
          <p className="text-gray-600 text-sm">No {getPlatformDisplayName(platform)} accounts are currently connected.</p>
        </div>
      )}
    </div>
  );
}

export default SocialAccountSelectionMobile;
