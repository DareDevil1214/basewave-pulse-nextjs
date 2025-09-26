'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, Calendar, ArrowLeft, Share, ChevronDown, Loader2, ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { BlogGenerationForm } from './BlogGenerationForm';
import { CombinedGenerationForm } from '@/components/combined-agent';
import { BlogPostsTable } from './BlogPostsTable';
import { BlogSchedulerTab } from './BlogSchedulerTab';
import { getPortalLink } from '@/lib/social-links';
import { getCurrentBranding } from '@/lib/branding';

interface BlogPortalProps {
  portal: 'newpeople';
  onChangeBlog?: () => void;
}

interface PortalConfig {
  name: string;
  displayName: string;
  logo: string;
  description: string;
}

const PORTAL_CONFIGS: Record<string, PortalConfig> = {
  newpeople: {
    name: 'newpeople',
    displayName: 'New People',
    logo: '/logo-load.webp', // Fallback logo
    description: 'Create and manage content for your New People portal'
  }
};

export function BlogPortal({ portal, onChangeBlog }: BlogPortalProps) {
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showCombinedForm, setShowCombinedForm] = useState(false);
  const [showGenerateDropdown, setShowGenerateDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'scheduler'>('posts');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get user's business branding
  const branding = getCurrentBranding();
  const [contentReady, setContentReady] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const config = PORTAL_CONFIGS[portal];

  // Enhanced loading state management for smooth transitions
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Add a small delay before marking content as ready
      setTimeout(() => {
        setContentReady(true);
      }, 300);
    }, 800); // Increased from 600ms for smoother transition

    return () => clearTimeout(timer);
  }, [portal]);

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowGenerateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleGenerateClick = () => {
    setShowGenerateForm(true);
    setShowGenerateDropdown(false);
  };

  const handleCombinedGenerateClick = () => {
    setShowCombinedForm(true);
    setShowGenerateDropdown(false);
  };

  const handleSchedulerClick = () => {
    setActiveTab('scheduler');
  };

  const handleGenerateSuccess = () => {
    setShowGenerateForm(false);
    setShowCombinedForm(false);
    // Trigger a refresh of the blog posts table
    setRefreshTrigger(prev => prev + 1);
  };
  
  const handleBackToPosts = () => {
    setActiveTab('posts');
  };

  const handleChangeBlog = () => {
    if (onChangeBlog) {
      onChangeBlog();
    } else {
      // Fallback to reload if no handler provided
      window.location.reload();
    }
  };

  const renderTabContent = () => {
    if (activeTab === 'scheduler') {
      return <BlogSchedulerTab portal={portal} onBack={handleBackToPosts} />;
    }
    return <BlogPostsTable portal={portal} refreshTrigger={refreshTrigger} />;
  };

  // If scheduler tab is active, render only the BlogSchedulerTab (it has its own layout)
  if (activeTab === 'scheduler') {
    return (
      <>
        {renderTabContent()}
        {/* Generate Form Modal */}
        {showGenerateForm && (
          <BlogGenerationForm 
            portal={portal}
            onClose={() => setShowGenerateForm(false)}
            onSuccess={handleGenerateSuccess}
          />
        )}
      </>
    );
  }

  // Show loading state if either loading is true OR content is not ready yet
  const shouldShowLoading = isLoading || !contentReady;

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence mode="wait">
        {shouldShowLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gray-50 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6">
                <img 
                  src={config.logo}
                  alt={`${config.displayName} logo`}
                  className="w-full h-full object-contain animate-pulse"
                />
              </div>
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="h-6 w-6 text-blue-500 animate-spin mr-2" />
                <span className="text-lg font-medium text-gray-700">
                  {isLoading ? `Loading ${config.displayName}...` : 'Preparing interface...'}
                </span>
              </div>
              <p className="text-gray-500">
                {isLoading ? 'Preparing your content management interface' : 'Almost ready to display'}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Clean Header - Matching Dashboard/SEO Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Blog Content</h1>
              <p className="text-gray-600 text-base md:text-lg">Create and manage content for your {branding.name || config.displayName} portal</p>
            </motion.div>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center">
                  <motion.div 
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <img 
                      src={branding.logoUrl || config.logo}
                      alt={`${branding.name || config.displayName} logo`}
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Portal Link Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => {
                      const portalLink = getPortalLink(portal);
                      if (portalLink) {
                        window.open(portalLink, '_blank');
                      }
                    }}
                    className="group/btn h-12 px-6 bg-black text-white hover:bg-gray-800 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg w-full sm:w-auto"
                    disabled={!getPortalLink(portal)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span className="font-medium">Open Portal</span>
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleSchedulerClick}
                    className="group/btn h-12 px-6 bg-black text-white hover:bg-gray-800 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg w-full sm:w-auto"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-medium">Open Scheduler</span>
                  </Button>
                </motion.div>

                <div className="relative" ref={dropdownRef}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => setShowGenerateDropdown(!showGenerateDropdown)}
                      className="group/btn h-12 px-6 bg-black text-white hover:bg-gray-800 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg w-full sm:w-auto"
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      <span className="font-medium">Generate Content</span>
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </motion.div>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showGenerateDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-full sm:w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                      >
                        <button
                          onClick={handleGenerateClick}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <Bot className="h-4 w-4 text-gray-600" />
                          <div>
                            <div className="font-medium text-gray-900">Blog Only</div>
                            <div className="text-xs text-gray-500">Generate blog post only</div>
                          </div>
                        </button>
                        <button
                          onClick={handleCombinedGenerateClick}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-t border-gray-100 transition-colors"
                        >
                          <Share className="h-4 w-4 text-black" />
                          <div>
                            <div className="font-medium text-gray-900">Blog + Social Media</div>
                            <div className="text-xs text-gray-500">Generate blog post and social media posts</div>
                          </div>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {renderTabContent()}
            </motion.div>

            {/* Generate Form Modal */}
            <AnimatePresence>
              {showGenerateForm && (
                <BlogGenerationForm 
                  portal={portal}
                  onClose={() => setShowGenerateForm(false)}
                  onSuccess={handleGenerateSuccess}
                />
              )}
            </AnimatePresence>

            {/* Combined Generation Form Modal */}
            <AnimatePresence>
              {showCombinedForm && (
                <CombinedGenerationForm 
                  portal={portal}
                  onClose={() => setShowCombinedForm(false)}
                  onSuccess={handleGenerateSuccess}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
