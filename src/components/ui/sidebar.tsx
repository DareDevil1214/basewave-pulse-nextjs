'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Search,
  Bot,
  Smartphone,
  User,
  Users,
  LogOut,
  Settings,
  ChevronDown,
  Target,
  TrendingUp,
  Globe,
  Brain,
  Shield
} from 'lucide-react';
import { getCurrentBranding, getPortalConfig } from '@/lib/branding';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
// import { AnimatedLogo, CollapsedAnimatedLogo } from '@/components/ui/animated-logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface User {
  name: string;
  email: string;
  role: string;
  isAuthenticated: boolean;
  username?: string;
  permissions?: string[];
}

interface SidebarProps {
  className?: string;
  user?: User;
  onSignOut?: () => void;
}

const getNavigationItems = (userRole?: string) => [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    badge: null
  },
  {
    title: 'Base Data',
    href: '/dashboard/base-data',
    icon: Globe,
    badge: null
  },
  {
    title: 'SEO',
    href: '/dashboard/seo',
    icon: Search,
    badge: null
  },
  {
    title: 'Opportunities',
    href: '/dashboard/opportunities',
    icon: Target,
    badge: null
  },
  {
    title: 'Blog Agent',
    href: '/dashboard/blog-agent',
    icon: Bot,
    badge: null
  },
  {
    title: 'Social Agent',
    href: '/dashboard/social-agent',
    icon: Smartphone,
    badge: null
  },
  {
    title: 'Leads',
    href: '/dashboard/leads',
    icon: Users,
    badge: null
  },
  {
    title: 'Reporting',
    href: '/dashboard/reporting',
    icon: TrendingUp,
    badge: null
  },
  {
    title: 'RAG System',
    href: '/dashboard/rag',
    icon: Brain,
    badge: null
  },
  // Only show Admin tab for admin users
  ...(userRole === 'admin' ? [{
    title: 'Admin',
    href: '/dashboard/admin',
    icon: Shield,
    badge: null
  }] : []),
];

// Dynamic blog portals based on current business branding
const getBlogPortals = () => {
  const branding = getCurrentBranding();
  const portalConfig = getPortalConfig();
  
  return [
    {
      id: portalConfig.id,
      title: portalConfig.name,
      href: `/dashboard/blog-agent?portal=${portalConfig.id}`,
      logo: portalConfig.logoUrl
    }
  ];
};

const socialPlatforms = [
  {
    id: 'facebook',
    title: 'Facebook',
    logo: '/social-assets/facebook.webp',
    isLocked: false
  },
  {
    id: 'instagram',
    title: 'Instagram',
    logo: '/social-assets/instagram.webp',
    isLocked: false
  },
  {
    id: 'threads',
    title: 'Threads',
    logo: '/social-assets/threads.webp',
    isLocked: false
  },
  {
    id: 'x',
    title: 'X (Twitter)',
    logo: '/social-assets/x-twitter.webp',
    isLocked: false
  },
  {
    id: 'linkedin',
    title: 'LinkedIn',
    logo: '/social-assets/linkedin.webp',
    isLocked: false
  },
];

// Dynamic social portals based on current business branding
const getSocialPortals = () => {
  const portalConfig = getPortalConfig();
  
  return [
    {
      id: portalConfig.id,
      title: portalConfig.name,
      username: portalConfig.id
    }
  ];
};

// Dynamic opportunity portals based on current business branding
const getOpportunityPortals = () => {
  const portalConfig = getPortalConfig();
  
  return [
    {
      id: portalConfig.id,
      title: portalConfig.name,
      href: `/dashboard/opportunities?portal=${portalConfig.id}`,
      logo: portalConfig.logoUrl
    }
  ];
};

const seoTabs = [
  {
    id: 'keywords',
    title: 'Keywords',
    href: '/dashboard/seo?tab=keywords',
    icon: Target
  },
  {
    id: 'rankings',
    title: 'Rankings',
    href: '/dashboard/seo?tab=rankings',
    icon: TrendingUp
  }
];

// Dynamic portal items based on current business branding
const getPortalItems = () => {
  const portalConfig = getPortalConfig();
  
  return [
    {
      id: portalConfig.id,
      title: portalConfig.name,
      href: `/dashboard/base-data?portal=${portalConfig.id}`,
      logo: portalConfig.logoUrl
    }
  ];
};

// Dynamic RAG portals based on current business branding
const getRagPortals = () => {
  const portalConfig = getPortalConfig();
  
  return [
    {
      id: portalConfig.id,
      title: portalConfig.name,
      href: `/dashboard/rag?portal=${portalConfig.id}`,
      logo: portalConfig.logoUrl
    }
  ];
};

export function Sidebar({ className, user, onSignOut }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isBlogAgentOpen, setIsBlogAgentOpen] = useState(false);
  const [isSocialAgentOpen, setIsSocialAgentOpen] = useState(false);
  const [openSocialPlatform, setOpenSocialPlatform] = useState<string | null>(null);
  const [isSEOOpen, setIsSEOOpen] = useState(false);
  const [isOpportunitiesOpen, setIsOpportunitiesOpen] = useState(false);
  const [isBaseDataOpen, setIsBaseDataOpen] = useState(false);
  const [isRAGSystemOpen, setIsRAGSystemOpen] = useState(false);
  const pathname = usePathname();

  const searchParams = useSearchParams();
  const currentPortal = searchParams.get('portal');
  const currentPlatform = searchParams.get('platform');
  const currentTab = searchParams.get('tab');

  // Auto-close dropdowns when navigating away from their sections
  useEffect(() => {
    if (!pathname.startsWith('/dashboard/blog-agent')) {
      setIsBlogAgentOpen(false);
    }
    if (!pathname.startsWith('/dashboard/social-agent')) {
      setIsSocialAgentOpen(false);
      setOpenSocialPlatform(null);
    }
    if (!pathname.startsWith('/dashboard/seo')) {
      setIsSEOOpen(false);
    }
    if (!pathname.startsWith('/dashboard/opportunities')) {
      setIsOpportunitiesOpen(false);
    }
    if (!pathname.startsWith('/dashboard/base-data')) {
      setIsBaseDataOpen(false);
    }
    if (!pathname.startsWith('/dashboard/rag')) {
      setIsRAGSystemOpen(false);
    }
  }, [pathname]);

  const sidebarVariants = {
    expanded: {
      width: 280,
      transition: {
        duration: 0.4,
        type: "spring" as const,
        stiffness: 300,
        damping: 40
      }
    },
    collapsed: {
      width: 80,
      transition: {
        duration: 0.4,
        type: "spring" as const,
        stiffness: 300,
        damping: 40
      }
    }
  };

  const contentVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        delay: 0.1
      }
    },
    collapsed: {
      opacity: 0,
      x: -10,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      className={cn(
        "relative h-full bg-gray-50 flex flex-col overflow-hidden",
        className
      )}
    >
             {/* Header */}
       <div className="pt-0 pb-2">
         <div className="flex items-start justify-center -mt-15">
           <Link href="/dashboard">
             <img
               src={getCurrentBranding().logoUrl}
               alt={`${getCurrentBranding().name} Logo`}
               className={cn(
                 "object-contain transition-all duration-300 cursor-pointer hover:scale-105",
                 isCollapsed ? "w-48 h-48" : "w-56 h-56"
               )}
             />
           </Link>
         </div>

        {/* Quick Actions */}
        {/* <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="flex items-center gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-500"
                onClick={() => alert('Search functionality coming soon!')}
              >
                <Search className="h-4 w-4" />
                <span className="text-sm">Search...</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                onClick={() => alert('No new notifications')}
              >
                <Bell className="h-4 w-4 text-gray-500" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                  3
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {isCollapsed && (
          <div className="flex flex-col items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              onClick={() => alert('Search functionality coming soon!')}
            >
              <Search className="h-4 w-4 text-gray-500" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              onClick={() => alert('No new notifications')}
            >
              <Bell className="h-4 w-4 text-gray-500" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></span>
            </motion.button>
          </div>
        )} */}
      </div>

             {/* Navigation */}
       <nav className="flex-1 px-4 pt-0 -mt-10 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
         <div className="space-y-1">
          {getNavigationItems(user?.role).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.title === 'Blog Agent' && pathname.startsWith('/dashboard/blog-agent')) ||
              (item.title === 'Social Agent' && pathname.startsWith('/dashboard/social-agent')) ||
              (item.title === 'SEO' && pathname.startsWith('/dashboard/seo')) ||
              (item.title === 'Base Data' && pathname.startsWith('/dashboard/base-data')) ||
              (item.title === 'RAG System' && pathname.startsWith('/dashboard/rag'));

            // Special handling for Blog Agent
            if (item.title === 'Blog Agent') {
              return (
                <div key={item.href}>
                  <motion.div
                    onClick={() => setIsBlogAgentOpen(!isBlogAgentOpen)}
                    className={cn(
                      "relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                      isActive
                        ? "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 shadow-sm border border-gray-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200",
                      isActive
                        ? "bg-gray-100 text-gray-700"
                        : "text-gray-500 group-hover:text-gray-700"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.div
                          variants={contentVariants}
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                          className="flex items-center justify-between flex-1 min-w-0"
                        >
                          <span className="font-medium text-sm truncate">
                            {item.title}
                          </span>
                          <motion.div
                            animate={{ rotate: isBlogAgentOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isActive && (
                      <motion.div
                        className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gray-600 to-gray-800 rounded-r-full"
                        layoutId="sidebar-indicator"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Blog Agent Dropdown */}
                  <AnimatePresence>
                    {isBlogAgentOpen && !isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-6 mt-2 space-y-1"
                      >
                        {getBlogPortals().map((portal) => {
                          const isSelected = currentPortal === portal.id;
                          return (
                            <Link key={portal.id} href={portal.href}>
                              <motion.div
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer group",
                                  isSelected
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                )}
                                whileHover={{ x: 4 }}
                                transition={{ duration: 0.2 }}
                              >
                                <img
                                  src={portal.logo}
                                  alt={portal.title}
                                  className="w-5 h-5 object-contain"
                                />
                                <span className="text-sm font-medium">{portal.title}</span>
                                {isSelected && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto"></div>
                                )}
                              </motion.div>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            // Special handling for Social Agent
            if (item.title === 'Social Agent') {
              return (
                <div key={item.href}>
                  <motion.div
                    onClick={() => setIsSocialAgentOpen(!isSocialAgentOpen)}
                    className={cn(
                      "relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                      isActive
                        ? "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 shadow-sm border border-gray-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200",
                      isActive
                        ? "bg-gray-100 text-gray-700"
                        : "text-gray-500 group-hover:text-gray-700"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.div
                          variants={contentVariants}
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                          className="flex items-center justify-between flex-1 min-w-0"
                        >
                          <span className="font-medium text-sm truncate">
                            {item.title}
                          </span>
                          <motion.div
                            animate={{ rotate: isSocialAgentOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isActive && (
                      <motion.div
                        className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gray-600 to-gray-800 rounded-r-full"
                        layoutId="sidebar-indicator"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Social Agent Dropdown */}
                  <AnimatePresence>
                    {isSocialAgentOpen && !isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-6 mt-2 space-y-1"
                      >
                       {socialPlatforms.map((platform) => {
  const isPlatformSelected = currentPlatform === platform.id;
  return (
    <div key={platform.id} className="space-y-1">
      {/* Platform Row */}
      <motion.div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer group",
          platform.isLocked 
            ? "text-gray-400 opacity-60 cursor-not-allowed"
            : isPlatformSelected
            ? "bg-blue-50 text-blue-700 border border-blue-200"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        )}
        whileHover={!platform.isLocked ? { x: 4 } : {}}
        transition={{ duration: 0.2 }}
        onClick={() => {
          if (!platform.isLocked) {
            setOpenSocialPlatform(openSocialPlatform === platform.id ? null : platform.id);
          }
        }}
      >
        <img 
          src={platform.logo} 
          alt={platform.title} 
          className="w-5 h-5 object-contain"
        />
        <span className="text-sm font-medium flex-1">{platform.title}</span>
        
        {platform.isLocked ? (
          <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        ) : (
          <motion.div
            animate={{ rotate: openSocialPlatform === platform.id ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3 h-3" />
          </motion.div>
        )}
        
        {isPlatformSelected && (
          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
        )}
      </motion.div>

      {/* Portal Sub-dropdown */}
      <AnimatePresence>
        {openSocialPlatform === platform.id && !platform.isLocked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-8 space-y-1"
          >
            {getSocialPortals().map((portal) => {
              const isPortalSelected = currentPlatform === platform.id && currentPortal === portal.id;
              return (
                <Link 
                  key={portal.id} 
                  href={`/dashboard/social-agent?platform=${platform.id}&portal=${portal.id}`}
                >
                  <motion.div
                    className={cn(
                      "flex items-center gap-3 px-3 py-1.5 rounded-lg transition-colors duration-200 cursor-pointer group",
                      isPortalSelected 
                        ? "bg-blue-50 text-blue-700 border border-blue-200" 
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    )}
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      isPortalSelected ? "bg-blue-500" : "bg-gray-300"
                    )}></div>
                    <span className="text-xs font-medium">{portal.title}</span>
                    {isPortalSelected && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto"></div>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
})}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            // Special handling for SEO
            if (item.title === 'SEO') {
              return (
                <div key={item.href}>
                  <motion.div
                    onClick={() => setIsSEOOpen(!isSEOOpen)}
                    className={cn(
                      "relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                      isActive
                        ? "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 shadow-sm border border-gray-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200",
                      isActive
                        ? "bg-gray-100 text-gray-700"
                        : "text-gray-500 group-hover:text-gray-700"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.div
                          variants={contentVariants}
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                          className="flex items-center justify-between flex-1 min-w-0"
                        >
                          <span className="font-medium text-sm truncate">
                            {item.title}
                          </span>
                          <motion.div
                            animate={{ rotate: isSEOOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isActive && (
                      <motion.div
                        className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gray-600 to-gray-800 rounded-r-full"
                        layoutId="sidebar-indicator"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30
                        }}
                      />
                    )}
                  </motion.div>

                  {/* SEO Dropdown */}
                  <AnimatePresence>
                    {isSEOOpen && !isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-6 mt-2 space-y-1"
                      >
                                                 {seoTabs.map((tab) => {
                           const TabIcon = tab.icon;
                           const isTabSelected = currentTab === tab.id;
                           return (
                             <Link key={tab.id} href={tab.href}>
                               <motion.div
                                 className={cn(
                                   "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer group",
                                   isTabSelected
                                     ? "bg-blue-50 text-blue-700 border border-blue-200"
                                     : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                 )}
                                 whileHover={{ x: 4 }}
                                 transition={{ duration: 0.2 }}
                               >
                                 <TabIcon className="w-4 h-4" />
                                 <span className="text-sm font-medium">{tab.title}</span>
                                 {isTabSelected && (
                                   <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto"></div>
                                 )}
                               </motion.div>
                             </Link>
                           );
                         })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            // Special handling for Base Data
            if (item.title === 'Base Data') {
              return (
                <div key={item.href}>
                  <motion.div
                    onClick={() => setIsBaseDataOpen(!isBaseDataOpen)}
                    className={cn(
                      "relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                      isActive
                        ? "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 shadow-sm border border-gray-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200",
                      isActive
                        ? "bg-gray-100 text-gray-700"
                        : "text-gray-500 group-hover:text-gray-700"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.div
                          variants={contentVariants}
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                          className="flex items-center justify-between flex-1 min-w-0"
                        >
                          <span className="font-medium text-sm truncate">
                            {item.title}
                          </span>
                          <motion.div
                            animate={{ rotate: isBaseDataOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isActive && (
                      <motion.div
                        className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gray-600 to-gray-800 rounded-r-full"
                        layoutId="sidebar-indicator"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Base Data Dropdown */}
                  <AnimatePresence>
                    {isBaseDataOpen && !isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-6 mt-2 space-y-1"
                      >
                        {getPortalItems().map((portal) => {
                          const isSelected = currentPortal === portal.id;
                          return (
                            <Link key={portal.id} href={portal.href}>
                              <motion.div
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer group",
                                  isSelected
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                )}
                                whileHover={{ x: 4 }}
                                transition={{ duration: 0.2 }}
                              >
                                <img
                                  src={portal.logo}
                                  alt={portal.title}
                                  className="w-5 h-5 object-contain"
                                />
                                <span className="text-sm font-medium">{portal.title}</span>
                                {isSelected && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto"></div>
                                )}
                              </motion.div>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            // Special handling for Opportunities
            if (item.title === 'Opportunities') {
              return (
                <div key={item.href}>
                  <motion.div
                    onClick={() => setIsOpportunitiesOpen(!isOpportunitiesOpen)}
                    className={cn(
                      "relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                      isActive
                        ? "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 shadow-sm border border-gray-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200",
                      isActive
                        ? "bg-gray-100 text-gray-700"
                        : "text-gray-500 group-hover:text-gray-700"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.div
                          variants={contentVariants}
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                          className="flex items-center justify-between flex-1 min-w-0"
                        >
                          <span className="font-medium text-sm truncate">
                            {item.title}
                          </span>
                          <motion.div
                            animate={{ rotate: isOpportunitiesOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isActive && (
                      <motion.div
                        className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gray-600 to-gray-800 rounded-r-full"
                        layoutId="sidebar-indicator"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Opportunities Dropdown */}
                  <AnimatePresence>
                    {isOpportunitiesOpen && !isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-6 mt-2 space-y-1"
                      >
                        {getOpportunityPortals().map((portal) => {
                          const isSelected = currentPortal === portal.id;
                          return (
                            <Link key={portal.id} href={portal.href}>
                              <motion.div
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer group",
                                  isSelected
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                )}
                                whileHover={{ x: 4 }}
                                transition={{ duration: 0.2 }}
                              >
                                <img
                                  src={portal.logo}
                                  alt={portal.title}
                                  className="w-5 h-5 object-contain"
                                />
                                <span className="text-sm font-medium">{portal.title}</span>
                                {isSelected && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto"></div>
                                )}
                              </motion.div>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            // Special handling for RAG System
            if (item.title === 'RAG System') {
              return (
                <div key={item.href}>
                  <motion.div
                    onClick={() => setIsRAGSystemOpen(!isRAGSystemOpen)}
                    className={cn(
                      "relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                      isActive
                        ? "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 shadow-sm border border-gray-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200",
                      isActive
                        ? "bg-gray-100 text-gray-700"
                        : "text-gray-500 group-hover:text-gray-700"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.div
                          variants={contentVariants}
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                          className="flex items-center justify-between flex-1 min-w-0"
                        >
                          <span className="font-medium text-sm truncate">
                            {item.title}
                          </span>
                          <motion.div
                            animate={{ rotate: isRAGSystemOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isActive && (
                      <motion.div
                        className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gray-600 to-gray-800 rounded-r-full"
                        layoutId="sidebar-indicator"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30
                        }}
                      />
                    )}
                  </motion.div>

                  {/* RAG System Dropdown */}
                  <AnimatePresence>
                    {isRAGSystemOpen && !isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-6 mt-2 space-y-1"
                      >
                        {getRagPortals().map((portal) => {
                          const isSelected = currentPortal === portal.id;
                          return (
                            <Link key={portal.id} href={portal.href}>
                              <motion.div
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer group",
                                  isSelected
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                )}
                                whileHover={{ x: 4 }}
                                transition={{ duration: 0.2 }}
                              >
                                <img
                                  src={portal.logo}
                                  alt={portal.title}
                                  className="w-5 h-5 object-contain"
                                />
                                <span className="text-sm font-medium">{portal.title}</span>
                                {isSelected && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto"></div>
                                )}
                              </motion.div>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            // Regular navigation items
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                    isActive
                      ? "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 shadow-sm border border-gray-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200",
                    isActive
                      ? "bg-gray-100 text-gray-700"
                      : "text-gray-500 group-hover:text-gray-700"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.div
                        variants={contentVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="flex items-center justify-between flex-1 min-w-0"
                      >
                        <span className="font-medium text-sm truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className={cn(
                            "px-2 py-0.5 text-xs font-medium rounded-full",
                            item.badge === 'AI'
                              ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700"
                              : "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700"
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gray-600 to-gray-800 rounded-r-full"
                      layoutId="sidebar-indicator"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30
                      }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="py-4">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>


      </nav>



      {/* User Section */}
      {user && (
        <div className="p-4 bg-gray-50/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full cursor-pointer"
              >
                <div className={cn(
                  "flex items-center gap-3 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200",
                  isCollapsed ? "p-2 justify-center" : "p-3"
                )}>
                  <Avatar className={cn(
                    "ring-2 ring-white shadow-sm",
                    isCollapsed ? "h-8 w-8" : "h-10 w-10"
                  )}>
                    <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-800 text-white font-semibold flex items-center justify-center">
                      <User className={cn(
                        "text-white",
                        isCollapsed ? "h-4 w-4" : "h-5 w-5"
                      )} />
                    </AvatarFallback>
                  </Avatar>

                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.div
                        variants={contentVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        className="flex-1 min-w-0"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-gray-900 truncate">
                            {user.name}
                          </span>
                          <span className="text-xs text-gray-500 truncate">
                            {user.email}
                          </span>
                          <Badge variant="secondary" className="w-fit text-xs mt-1">
                            {user.role}
                          </Badge>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-64 shadow-xl border-gray-200/50"
              align={isCollapsed ? "start" : "end"}
              side="top"
            >
              <div className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                    <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-800 text-white font-semibold flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    <Badge variant="secondary" className="w-fit text-xs mt-1">
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator />



              <div className="p-2">
                <DropdownMenuItem
                  onClick={onSignOut}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 group rounded-lg py-3"
                >
                  <LogOut className="mr-3 h-4 w-4 group-hover:animate-pulse" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

    </motion.aside>
  );
}