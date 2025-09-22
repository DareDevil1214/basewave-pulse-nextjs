'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SocialContentLibrary from './SocialContentLibrary';
import { ArrowLeft, Bot, Calendar, Users, Hash, TrendingUp, RefreshCw, Search, ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SocialAccountSelection } from './SocialAccountSelection';
import { SocialGenerationForm } from './SocialGenerationForm';
import { SocialSchedulerTab } from './SocialSchedulerTab';
import Beams from "@/components/ui/beams";
import { getSocialLink } from '@/lib/social-links';

interface SocialAccount {
  id: string;
  name: string;
  username: string;
  isConnected: boolean;
  followers?: string;
  avatar?: string;
}

interface SocialAgentInterfaceProps {
  platform: string;
  onBack: () => void;
  portal?: string;
}

export function SocialAgentInterface({ platform, onBack, portal }: SocialAgentInterfaceProps) {
  const getAccountIdFromPortal = (portalName: string | undefined): string | null => {
    if (!portalName) return null;
    const portalToAccountMap: { [key: string]: string } = {
      'newpeople': 'newpeople',
      'new-people': 'newpeople'
    };
    return portalToAccountMap[portalName.toLowerCase()] || null;
  };

  const [selectedAccount, setSelectedAccount] = useState<string | null>(getAccountIdFromPortal(portal));
  const [activeTab, setActiveTab] = useState<'content'>('content');
  const [showGenerationForm, setShowGenerationForm] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState<string>('');

  React.useEffect(() => {
    const accountId = getAccountIdFromPortal(portal);
    setSelectedAccount(accountId);
  }, [portal]);

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

  const getPlatformIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    
    switch (platformLower) {
      case 'facebook':
        return (
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
        );
      case 'instagram':
        return (
          <div className="w-12 h-12 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
        );
      case 'x':
      case 'twitter':
        return (
          <div className="w-12 h-12 bg-gradient-to-r from-gray-800 to-black rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
        );
      case 'linkedin':
        return (
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
        );
      case 'youtube':
        return (
          <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        );
      case 'tiktok':
        return (
          <div className="w-12 h-12 bg-gradient-to-r from-black to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
          </div>
        );
      case 'pinterest':
        return (
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.219.085.339-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-12.013C24.007 5.367 18.641.001.017 0z"/>
            </svg>
          </div>
        );
      case 'threads':
        return (
          <div className="w-12 h-12 bg-gradient-to-r from-gray-900 to-black rounded-xl flex items-center justify-center shadow-lg">
            <img 
              src="/threads-app-icon.svg" 
              alt="Threads" 
              className="w-6 h-6"
            />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
            <Hash className="h-6 w-6 text-white" />
          </div>
        );
    }
  };



  const connectedAccounts: SocialAccount[] = [
    {
      id: 'neovibemag',
      name: 'Neo Vibe Mag',
      username: 'neovibemag',
      isConnected: true
    },
    {
      id: 'eliteequilibrium',
      name: 'Elite Equilibrium',
      username: 'eliteequilibrium',
      isConnected: true
    },
    {
      id: 'eternalelite',
      name: 'Eternal Elite',
      username: 'eternalelite',
      isConnected: true
    }
  ];

  const tabs = [];

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccount(accountId);
  };

  const handleBackToAccounts = () => {
    setSelectedAccount(null);
    setShowScheduler(false);
  };

  const handleGenerateClick = () => {
    setShowGenerationForm(true);
  };

  const handleSchedulerClick = () => {
    setShowScheduler(true);
  };

  const handleGenerationSuccess = () => {
    setShowGenerationForm(false);
    setActiveTab('content');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSchedulerBack = () => {
    setShowScheduler(false);
  };

  if (!selectedAccount) {
    return (
      <SocialAccountSelection
        platform={platform}
        accounts={connectedAccounts}
        onAccountSelect={handleAccountSelect}
        onBack={onBack}
      />
    );
  }

  if (showScheduler) {
    return (
      <SocialSchedulerTab
        platform={platform}
        account={selectedAccount}
        onBack={handleSchedulerBack}
      />
    );
  }

  const selectedAccountData = connectedAccounts.find(acc => acc.id === selectedAccount);

  const renderTabContent = () => {
    return (
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="bg-white/70 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-200/50 shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center">
              <div className="w-2 h-2 bg-black rounded-full mr-3 sm:mr-4"></div>
              Recent Social Posts
            </h3>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search social posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-80 bg-white/50 border-gray-200/50 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Social Content Library */}
        <SocialContentLibrary 
          platform={platform}
          account={selectedAccount}
          refreshTrigger={refreshTrigger}
          searchTerm={searchTerm}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6">

        {/* Clean Header - Matching Dashboard/SEO Style */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Social Agent</h1>
          <p className="text-gray-600 text-base md:text-lg">Multi-platform social media content creation and management</p>
        </div>

        {/* Platform & Portal Info + Controls */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            {!portal && (
              <Button
                onClick={handleBackToAccounts}
                variant="outline"
                className="group/btn h-12 px-6 bg-white/80 backdrop-blur-sm border border-slate-200/50 text-slate-700 hover:bg-slate-50 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="font-medium">Back</span>
              </Button>
            )}
            <div className="flex items-center justify-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden">
                <img 
                  src={`/${selectedAccountData?.username === 'eliteequilibrium' ? 'elite-logo.png' : selectedAccountData?.username === 'eternalelite' ? 'eternal-logo.png' : 'logo-load.webp'}`}
                  alt={`${selectedAccountData?.username} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Social Media Link */}
            {selectedAccountData && (
              <Button
                onClick={() => {
                  const socialLink = getSocialLink(selectedAccountData.username, platform);
                  if (socialLink) {
                    window.open(socialLink, '_blank');
                  }
                }}
                className="group/btn h-12 px-6 bg-black text-white hover:bg-gray-800 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] w-full sm:w-auto"
                disabled={!getSocialLink(selectedAccountData.username, platform)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                <span className="font-medium">Open {getPlatformDisplayName(platform)}</span>
              </Button>
            )}
            
            <Button
              onClick={handleSchedulerClick}
              className="group/btn h-12 px-6 bg-black text-white hover:bg-gray-800 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] w-full sm:w-auto"
            >
              <Clock className="h-4 w-4 mr-2" />
              <span className="font-medium">Open Scheduler</span>
            </Button>
            
            <Button
              onClick={handleGenerateClick}
              className="group/btn h-12 px-6 bg-black text-white hover:bg-gray-800 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] w-full sm:w-auto"
            >
              <Bot className="h-4 w-4 mr-2" />
              <span className="font-medium">Generate Content</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>

        {/* Generation Form Modal */}
        {showGenerationForm && selectedAccount && (
          <SocialGenerationForm
            platform={platform}
            account={selectedAccount}
            onClose={() => setShowGenerationForm(false)}
            onSuccess={handleGenerationSuccess}
          />
        )}
      </div>
    </div>
  );
}

export default SocialAgentInterface;