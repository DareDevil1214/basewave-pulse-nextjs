'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  Command,
  Lock,
  Sparkles,
  Activity,
  HelpCircle
} from 'lucide-react';

interface User {
  name: string;
  email: string;
  role: string;
  isAuthenticated: boolean;
  username?: string;
  permissions?: string[];
}

interface ModernHeaderProps {
  user: User;
  onSignOut: () => void;
  pageTitle?: string;
  pageDescription?: string;
}

export function ModernHeader({ 
  user, 
  onSignOut, 
  pageTitle = "Dashboard",
  pageDescription = "Welcome back to your intelligence platform"
}: ModernHeaderProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [notifications] = useState(3); // Mock notification count

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <header className="relative bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 z-10">
      <div className="flex items-center justify-between">
        {/* Left Section - Page Info */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
              {pageTitle}
            </h1>
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200">
              <Activity className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {pageDescription} • {currentTime}
          </p>
        </motion.div>

        {/* Right Section - Actions & User */}
        <div className="flex items-center gap-4">
          {/* Search Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              size="sm"
              className="relative h-10 w-10 rounded-xl hover:bg-gray-100 transition-all duration-200"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-4 w-4 text-gray-600" />
            </Button>
          </motion.div>

          {/* Command Palette */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              size="sm"
              className="hidden md:flex items-center gap-2 h-10 px-3 rounded-xl hover:bg-gray-100 transition-all duration-200 border border-gray-200"
            >
              <Command className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-500 font-medium">⌘K</span>
            </Button>
          </motion.div>

          {/* Notifications */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Button 
              variant="ghost" 
              size="sm"
              className="relative h-10 w-10 rounded-xl hover:bg-gray-100 transition-all duration-200"
            >
              <Bell className="h-4 w-4 text-gray-600" />
              {notifications > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-medium rounded-full flex items-center justify-center"
                >
                  {notifications}
                </motion.span>
              )}
            </Button>
          </motion.div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="ghost" className="relative h-10 w-auto px-3 rounded-xl hover:bg-gray-100 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 ring-2 ring-gray-100">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium text-gray-900">{user.name}</span>
                      <span className="text-xs text-gray-500">{user.role}</span>
                    </div>
                  </div>
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              className="w-64 dropdown-content shadow-xl border-gray-200/50" 
              align="end" 
              forceMount
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                      {getInitials(user.name)}
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
                  onClick={() => {
                    alert('Profile feature is currently disabled. Please contact support for access.');
                  }}
                  className="opacity-50 cursor-not-allowed rounded-lg py-3"
                  disabled
                >
                  <User className="mr-3 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>Profile Settings</span>
                    <span className="text-xs text-gray-400">Manage your account</span>
                  </div>
                  <Lock className="ml-auto h-3 w-3" />
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => {
                    alert('Settings feature is currently disabled. Please contact support for access.');
                  }}
                  className="opacity-50 cursor-not-allowed rounded-lg py-3"
                  disabled
                >
                  <Settings className="mr-3 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>Preferences</span>
                    <span className="text-xs text-gray-400">Customize your experience</span>
                  </div>
                  <Lock className="ml-auto h-3 w-3" />
                </DropdownMenuItem>

                <DropdownMenuItem 
                  className="rounded-lg py-3 cursor-pointer hover:bg-purple-50 hover:text-purple-700"
                  onClick={() => alert('Upgrade feature coming soon!')}
                >
                  <Sparkles className="mr-3 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>Upgrade to Pro</span>
                    <span className="text-xs text-gray-400">Unlock premium features</span>
                  </div>
                  <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                    New
                  </Badge>
                </DropdownMenuItem>

                <DropdownMenuItem 
                  className="rounded-lg py-3 cursor-pointer"
                  onClick={() => alert('Help center opening soon!')}
                >
                  <HelpCircle className="mr-3 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>Help & Support</span>
                    <span className="text-xs text-gray-400">Get assistance</span>
                  </div>
                </DropdownMenuItem>
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
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50"
          >
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-500">Press <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">ESC</kbd> to close</p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowSearch(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 to-indigo-50/20 -z-10"></div>
    </header>
  );
}