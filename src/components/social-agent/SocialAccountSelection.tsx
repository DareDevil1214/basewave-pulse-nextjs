'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import Image from 'next/image';
import '../blog-agent/PortalSelectionCards.css';
import SocialAccountSelectionMobile from './SocialAccountSelectionMobile';

interface SocialAccount {
  id: string;
  name: string;
  username: string;
  isConnected: boolean;
  followers?: string;
  avatar?: string;
}

interface SocialAccountSelectionProps {
  platform: string;
  accounts: SocialAccount[];
  onAccountSelect: (accountId: string) => void;
  onBack: () => void;
}

export function SocialAccountSelection({ 
  platform, 
  accounts, 
  onAccountSelect, 
  onBack 
}: SocialAccountSelectionProps) {
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

  // Helper function to get theme colors for the 3D cards
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="hidden sm:block bg-white p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              className="bg-white text-center w-28 sm:w-36 rounded-2xl h-10 sm:h-12 relative text-black text-sm sm:text-lg font-semibold group border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              type="button"
              onClick={onBack}
            >
              <div
                className="bg-blue-400 rounded-xl h-8 sm:h-10 w-1/4 flex items-center justify-center absolute left-1 top-[2px] group-hover:w-[136px] z-10 duration-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 1024 1024"
                  height="16px"
                  width="16px"
                  className="sm:h-5 sm:w-5"
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
          <div className="flex-1 flex justify-center">
            <div className="text-center">
              <div className="mb-2">
                <button className="button text-xl sm:text-2xl lg:text-3xl">
                  <div className="b-hover">
                    <div className="cir-1 filter"></div>
                    <div className="cir-2 filter"></div>
                    <div className="cir-3 filter"></div>
                    <div className="cir-4 filter"></div>
                    <div className="cir-5 filter"></div>
                    <div className="cir-6 filter"></div>
                  </div>
                  {getPlatformDisplayName(platform)} <span className="font-bold">Accounts</span>
                </button>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">Select your portal to manage content</p>
            </div>
          </div>
          <div className="w-16 sm:w-20"></div>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="flex-1 p-6">
        {/* Mobile Card View */}
        <div className="block sm:hidden p-4 sm:p-6">
          <SocialAccountSelectionMobile
            platform={platform}
            accounts={accounts}
            onAccountSelect={onAccountSelect}
            onBack={onBack}
          />
        </div>

        {/* Desktop 3D Card View */}
        <div className="hidden sm:block w-full">
          <div className="flex justify-center items-center">
            <div className="flex flex-wrap justify-center gap-8 max-w-6xl">
              {accounts.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="parent"
                  style={{ 
                    width: '300px',
                    marginTop: '0',
                    margin: '0'
                  }}
                  onClick={() => onAccountSelect(account.id)}
                >
                  <div className="card">
                    <div 
                      className="content-box"
                      style={{ backgroundColor: getThemeColor(account.id) }}
                    >
                      <div className="flex flex-col items-center mb-4">
                        <div className="w-32 h-32 mb-3 logo-container">
                          <Image 
                            src={getLogoPath(account.id)} 
                            alt={account.name} 
                            width={128} 
                            height={128} 
                            className="object-contain logo-shadow"
                          />
                        </div>
                        <span className="card-title">{account.name}</span>
                      </div>
                      <p className="card-content">
                        {getSocialMediaUrl(platform, account.username) ? (
                          <a 
                            href={getSocialMediaUrl(platform, account.username)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-300 hover:text-blue-100 hover:underline transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            @{account.username}
                          </a>
                        ) : (
                          <span>@{account.username}</span>
                        )}{account.followers ? ` • ${account.followers} followers` : ''}
                      </p>
                      <span className="see-more">Select Portal</span>
                    </div>
                    <div className="date-box">
                      <span className="month">{platform.charAt(0).toUpperCase()}</span>
                      <span className="date">SOCIAL</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* No Accounts Message */}
        {accounts.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">No Accounts Found</h3>
            <p className="text-white/60">No {getPlatformDisplayName(platform)} accounts are currently connected.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SocialAccountSelection;