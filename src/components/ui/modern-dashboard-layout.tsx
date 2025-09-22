'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/ui/sidebar';

import { LoginPage } from '@/components/LoginPage';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { X, Menu } from 'lucide-react';

interface ModernDashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
}

export function ModernDashboardLayout({ 
  children, 
  pageTitle,
  pageDescription 
}: ModernDashboardLayoutProps) {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [notification] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);

  // Set dashboard mode for fixed layout
  useEffect(() => {
    document.body.classList.add('dashboard-mode');
    
    return () => {
      document.body.classList.remove('dashboard-mode');
    };
  }, []);

  // Handle body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-nav-open');
    } else {
      document.body.classList.remove('mobile-nav-open');
    }

    return () => {
      document.body.classList.remove('mobile-nav-open');
    };
  }, [isMobileMenuOpen]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // Handle initial loading and app reload detection
  useEffect(() => {
    const checkReload = () => {
      const hasReloaded = sessionStorage.getItem('app_has_loaded');
      
      if (!hasReloaded) {
        setShowLoadingScreen(true);
        setHasInitialLoad(true);
        sessionStorage.setItem('app_has_loaded', 'true');
      } else {
        setShowLoadingScreen(false);
        setHasInitialLoad(false);
      }
    };

    checkReload();

    const handleBeforeUnload = () => {
      sessionStorage.removeItem('app_has_loaded');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Show loading screen for 2 seconds on initial load/reload
  useEffect(() => {
    if (hasInitialLoad && !isLoading) {
      const timer = setTimeout(() => {
        setShowLoadingScreen(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [hasInitialLoad, isLoading]);

  const handleLoadingComplete = () => {
    setShowLoadingScreen(false);
  };



  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Show loading screen if it's the initial load
  if (showLoadingScreen && hasInitialLoad) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  // Show login page if not authenticated
  if (!isAuthenticated && !isLoading) {
    return <LoginPage />;
  }

  // Show loading screen if auth is still loading
  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }



  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg backdrop-blur-sm border transition-all duration-300 ${
              notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' && (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {notification.type === 'info' && (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              {notification.type === 'error' && (
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
              <span className="font-medium text-sm">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar 
          user={user || undefined}
          onSignOut={handleLogout}
        />
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 40,
              duration: 0.4
            }}
            className="fixed left-0 top-0 bottom-0 w-80 z-50 md:hidden"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(event, info) => {
              if (info.offset.x < -100) {
                setIsMobileMenuOpen(false);
              }
            }}
          >
            <div className="w-full h-full bg-gray-50 flex flex-col border-r border-gray-200">
              <div className="p-4 flex items-center justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <Sidebar 
                  className="border-0 shadow-none h-full overflow-y-auto" 
                  user={user || undefined}
                  onSignOut={handleLogout}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 right-4 z-30">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileMenuOpen(true)}
            className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>

              {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <motion.div 
              className="min-h-full bg-gray-50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4,
                type: "spring",
                stiffness: 100
              }}
            >
              {/* Consistent spacing wrapper for all dashboard tabs */}
              <div className="w-full px-4 md:px-8 py-4 md:py-6">
                {children}
              </div>
            </motion.div>
          </main>
        </div>



      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgb(148,163,184,0.08)_1px,_transparent_0)] [background-size:20px_20px]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/30"></div>
      </div>
    </div>
  );
}