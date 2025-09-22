'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, RefreshCw, Clock, Play, Pause, Trash2, FileText, MoreVertical, ExternalLink, ArrowLeft, Sparkles, Edit3, Wand2, Hash, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Beams from '@/components/ui/beams';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getSocialLink } from '@/lib/social-links';
import { formatDisplayDate } from '@/utils/timeUtils';
import { 
  generateKeywordsFromTopic, 
  generateKeywordsFromInputs, 
  convertAIDataToFormFormat,
  validateTopic,
  validateManualInputs,
  AIKeywordData 
} from '@/lib/ai-keyword-generator';

interface SocialSchedule {
  id: string;
  platform: string;
  account: string;
  contentType: 'text' | 'image';
  name: string;
  description: string;
  cronExpression: string;
  frequency?: string;
  nextRunTime: string;
  isActive: boolean;
  createdAt: string;
  executionCount: number;
  maxPosts: number;
  platforms: string[];
  status: string;
}

// Helper function to format frequency display with day for weekly schedules
function formatFrequencyDisplay(frequency?: string, cronExpression?: string): string {
  if (!frequency) return 'Once';
  
  if (frequency === 'weekly' && cronExpression) {
    try {
      const cronParts = cronExpression.split(' ');
      if (cronParts.length === 5) {
        const dayOfWeek = parseInt(cronParts[4]);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `Weekly (${dayNames[dayOfWeek]})`;
      }
    } catch (error) {
      console.error('Error parsing cron expression for day:', error);
    }
  }
  
  // Capitalize first letter for other frequencies
  return frequency.charAt(0).toUpperCase() + frequency.slice(1);
}

interface SocialSchedulerTabProps {
  platform: string;
  account: string;
  onBack: () => void;
}

interface CompBlogArticle {
  title: string;
  description: string;
  primary_keywords: string[];
  secondary_keywords: string[];
  long_tail_keywords: string[];
  outline: string;
  visual: string;
  website: string;
  documentId?: string; // Add document ID
  articleId?: string; // Add article ID
}

interface CompBlogContent {
  articles: {
    [key: string]: CompBlogArticle;
  };
}

export function SocialSchedulerTab({ platform, account, onBack }: SocialSchedulerTabProps) {
  const [schedules, setSchedules] = useState<SocialSchedule[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentUTCTime, setCurrentUTCTime] = useState<string>('');

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

  // Helper function to convert platform to backend format
  const convertPlatformToBackendFormat = (platform: string): string => {
    const platformMap: { [key: string]: string } = {
      'x': 'X',
      'twitter': 'X',
      'tiktok': 'TikTok',
      'instagram': 'Instagram',
      'linkedin': 'LinkedIn',
      'youtube': 'YouTube',
      'facebook': 'Facebook',
      'pinterest': 'Pinterest',
      'threads': 'Threads'
    };
    return platformMap[platform.toLowerCase()] || platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
  };

  // Update current UTC time every second
  useEffect(() => {
    const updateTime = () => {
      setCurrentUTCTime(new Date().toLocaleString('en-US', { 
        timeZone: 'UTC',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    
    // Set initial time
    updateTime();
    
    // Update every second
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch schedules from backend
  useEffect(() => {
    console.log('useEffect triggered with:', { platform, account, refreshTrigger }); // Debug log
    
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        // Use the actual backend endpoint for social media schedules
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/socialagent/scheduler/list`);
        if (response.ok) {
          const data = await response.json();
          console.log('Raw schedules from backend:', data.data); // Debug log
          
          // Filter schedules by platform and account
          const filteredSchedules = (data.data || []).filter((schedule: any) => {
            // Convert both to lowercase for comparison
            const schedulePlatforms = schedule.platforms?.map((p: string) => p.toLowerCase()) || [];
            const currentPlatform = platform.toLowerCase();
            
            const platformMatch = schedulePlatforms.includes(currentPlatform) || 
                                schedule.platform?.toLowerCase() === currentPlatform;
            const accountMatch = schedule.account === account || schedule.account === 'auto';
            
            console.log(`Schedule ${schedule.name}:`, {
              schedulePlatforms,
              currentPlatform,
              platformMatch,
              accountMatch,
              willInclude: platformMatch && accountMatch
            }); // Debug log
            
            return platformMatch && accountMatch;
          });
          
          console.log('Filtered schedules:', filteredSchedules); // Debug log
          
          // Map backend data to frontend interface
          const mappedSchedules = filteredSchedules.map((schedule: any) => {
            // Debug: Log the nextRunTime value
            console.log('Schedule nextRunTime:', {
              name: schedule.name,
              nextRunTime: schedule.nextRunTime,
              nextRun: schedule.nextRun,
              type: typeof schedule.nextRunTime
            });
            
            return {
              id: schedule.id || schedule._id,
              platform: schedule.platforms?.[0] || schedule.platform || platform,
              account: schedule.account,
              contentType: schedule.contentType || 'text',
              name: schedule.name || 'Untitled Schedule',
              description: schedule.description || '',
              cronExpression: schedule.cronExpression || '',
              frequency: schedule.frequency || 'once',
              nextRunTime: schedule.nextRunTime || new Date().toISOString(),
              isActive: schedule.isActive !== undefined ? schedule.isActive : (schedule.status === 'success' ? false : true),
              createdAt: schedule.createdAt || new Date().toISOString(),
              executionCount: schedule.executionCount || 0,
              maxPosts: schedule.maxPosts || 1,
              platforms: schedule.platforms || [platform],
              status: schedule.status || (schedule.isActive ? 'active' : 'stopped')
            };
          });
          
          setSchedules(mappedSchedules);
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [platform, account, refreshTrigger]);

  // Auto-refresh schedules every 30 seconds to catch execution updates
  useEffect(() => {
    const interval = setInterval(() => {
      const fetchSchedules = async () => {
        try {
          // Use the actual backend endpoint for social media schedules
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/socialagent/scheduler/list`);
          if (response.ok) {
            const data = await response.json();
            
            // Filter schedules by platform and account
            const filteredSchedules = (data.data || []).filter((schedule: any) => {
              // Convert both to lowercase for comparison
              const schedulePlatforms = schedule.platforms?.map((p: string) => p.toLowerCase()) || [];
              const currentPlatform = platform.toLowerCase();
              
              const platformMatch = schedulePlatforms.includes(currentPlatform) || 
                                  schedule.platform?.toLowerCase() === currentPlatform;
              const accountMatch = schedule.account === account || schedule.account === 'auto';
              
              return platformMatch && accountMatch;
            });
            
            // Map backend data to frontend interface
            const mappedSchedules = filteredSchedules.map((schedule: any) => ({
              id: schedule.id || schedule._id,
              platform: schedule.platforms?.[0] || schedule.platform || platform,
              account: schedule.account,
              contentType: schedule.contentType || 'text',
              name: schedule.name || 'Untitled Schedule',
              description: schedule.description || '',
              cronExpression: schedule.cronExpression || '',
              frequency: schedule.frequency || 'once',
              nextRunTime: schedule.nextRunTime || new Date().toISOString(),
              isActive: schedule.isActive !== undefined ? schedule.isActive : (schedule.status === 'success' ? false : true),
              createdAt: schedule.createdAt || new Date().toISOString(),
              executionCount: schedule.executionCount || 0,
              maxPosts: schedule.maxPosts || 1,
              platforms: schedule.platforms || [platform],
              status: schedule.status || (schedule.isActive ? 'active' : 'stopped')
            }));
            
            setSchedules(mappedSchedules);
          }
        } catch (error) {
          console.error('Error auto-refreshing social media schedules:', error);
        }
      };
      
      fetchSchedules();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [platform, account]);

  const handleCreateSchedule = () => {
    setShowCreateForm(true);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleToggleSchedule = async (scheduleId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      // Use the actual backend endpoint for toggling schedules
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/socialagent/scheduler/${scheduleId}/${newStatus === 'active' ? 'start' : 'stop'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling schedule:', error);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      // Use the actual backend endpoint for deleting schedules
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/socialagent/scheduler/${scheduleId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'paused': return 'text-yellow-600';
      case 'stopped': return 'text-red-600';
      case 'success': return 'text-green-600';
      case 'completed': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'stopped': return <Pause className="h-4 w-4" />;
      case 'success': return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>;
      case 'completed': return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'paused': return 'Paused';
      case 'stopped': return 'Stopped';
      case 'success': return 'Success';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6">

        {/* Clean Header - Matching Dashboard/SEO Style */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Social Scheduler</h1>
          <p className="text-gray-600 text-lg">Schedule and manage your social media content across all platforms</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
              <svg className="h-3 w-3 mr-1.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-blue-800">UTC Time Zone</span>
            </div>
            <div className="inline-flex items-center px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
              <Clock className="h-3 w-3 mr-1.5 text-green-600" />
              <span className="text-xs font-medium text-green-800">Current UTC: {currentUTCTime}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button
            onClick={onBack}
            className="bg-white text-center w-36 rounded-2xl h-12 relative text-black text-lg font-semibold group border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            type="button"
          >
            <div
              className="bg-black rounded-xl h-10 w-1/4 flex items-center justify-center absolute left-1 top-[2px] group-hover:w-[136px] z-10 duration-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1024 1024"
                height="20px"
                width="20px"
              >
                <path
                  d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
                  fill="#ffffff"
                ></path>
                <path
                  d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                  fill="#ffffff"
                ></path>
              </svg>
            </div>
            <p className="translate-x-2">Go Back</p>
          </button>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh schedules"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            
            {/* Social Media Link */}
            <button
              onClick={() => {
                const socialLink = getSocialLink(account, platform);
                if (socialLink) {
                  window.open(socialLink, '_blank');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              disabled={!getSocialLink(account, platform)}
            >
              <ExternalLink className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Open {getPlatformDisplayName(platform)}</span>
              <span className="sm:hidden">Open</span>
            </button>
            
            <button
              onClick={handleCreateSchedule}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Create Schedule</span>
              <span className="sm:hidden">Create</span>
            </button>
          </div>
        </div>

        {/* Success Message - Center Aligned */}
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex justify-center py-4"
          >
            <div className="max-w-md p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 text-green-700">
                <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">{successMessage}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Content */}
        <div className="w-full space-y-4 sm:space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center">
                <RefreshCw className="h-6 w-6 text-blue-500 animate-spin mb-2" />
                <p className="text-sm text-slate-500">Loading schedules...</p>
              </div>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12 bg-white/50 rounded-xl border-2 border-dashed border-slate-200">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium text-base">
                No schedules found for {getPlatformDisplayName(platform)}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Create your first automated content schedule to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              <AnimatePresence>
                {schedules.map((schedule, index) => {
                  // Check if this is a completed "once" schedule - show success card
                  const isCompletedOnce = schedule.frequency === 'once' && (schedule.status === 'completed' || schedule.status === 'success');
                  
                  if (isCompletedOnce) {
                    return (
                      <motion.article
                        key={schedule.id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-white rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                      >
                        {/* Success Card - Simple design with just logo and success message */}
                        <div className="w-full h-48 relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100">
                          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20"></div>
                          
                          {/* Delete Icon */}
                          <div className="absolute top-4 right-4 z-10">
                            <button
                              onClick={(e) => {
                                console.log('Delete button clicked for schedule:', schedule.id);
                                e.stopPropagation();
                                e.preventDefault();
                                handleDeleteSchedule(schedule.id);
                              }}
                              className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors cursor-pointer"
                              title="Delete schedule"
                              type="button"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                          
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-center">
                              <img 
                                src={account === 'eliteequilibrium' ? '/elite-logo.png' : 
                                     account === 'eternalelite' ? '/eternal-logo.png' : '/logo-load.webp'} 
                                alt="Portal Logo" 
                                className="w-20 h-20 object-contain mx-auto opacity-80 mb-4" 
                              />
                              <div className="text-green-600 font-medium text-sm mb-2">
                                Successfully Posted
                              </div>
                              <div className="text-green-700 font-bold text-xl">
                                {schedule.name}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    );
                  }
                  
                  // Regular schedule card for non-completed schedules
                  return (
                  <motion.article
                    key={schedule.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    {/* Card Header */}
                    <div className="w-full h-32 relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-500/20"></div>
                                             <div className="absolute inset-0 flex items-center justify-center">
                         <div className="text-center">
                                                       <img 
                              src={account === 'eliteequilibrium' ? '/elite-logo.png' : 
                                   account === 'eternalelite' ? '/eternal-logo.png' : '/logo-load.webp'} 
                              alt="Portal Logo" 
                              className="w-28 h-28 object-contain mx-auto opacity-80" 
                            />
                         </div>
                       </div>
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          schedule.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : schedule.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusDisplayName(schedule.status)}
                        </span>
                      </div>

                      {/* Platform Badge */}
                      <div className="absolute top-4 right-16">
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          <span>{getPlatformDisplayName(schedule.platform)}</span>
                        </div>
                      </div>

                      {/* Action Menu */}
                      <div className="absolute top-4 right-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {schedule.status !== 'success' && schedule.status !== 'completed' && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleSchedule(schedule.id, schedule.status === 'active' ? 'active' : 'stopped');
                                }}
                              >
                                {schedule.status === 'active' ? (
                                  <Pause className="mr-2 h-4 w-4" />
                                ) : (
                                  <Play className="mr-2 h-4 w-4" />
                                )}
                                {schedule.status === 'active' ? 'Pause schedule' : 'Resume schedule'}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSchedule(schedule.id);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete schedule
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {schedule.nextRunTime ? formatDisplayDate(schedule.nextRunTime) : 'Not scheduled'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatFrequencyDisplay(schedule.frequency, schedule.cronExpression)}
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-base leading-tight group-hover:text-blue-600 transition-colors">
                        {schedule.name}
                      </h3>
                      
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Platform:</span>
                          <span className="font-medium text-gray-900 capitalize">
                            {schedule.platforms?.join(', ') || getPlatformDisplayName(schedule.platform)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Account:</span>
                          <span className="font-medium text-gray-900">
                            @{schedule.account}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Executions:</span>
                          <span className="font-medium text-gray-900">
                            {schedule.executionCount || 0}
                          </span>
                        </div>
                      </div>

                                             {/* Platform Icon and Toggle */}
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <img 
                             src={account === 'eliteequilibrium' ? '/elite-logo.png' : 
                                  account === 'eternalelite' ? '/eternal-logo.png' : '/logo-load.webp'} 
                             alt="Portal Logo" 
                             className="w-12 h-12 object-contain" 
                           />
                         </div>
                        
                        <div className="flex items-center gap-2">
                          {schedule.status !== 'success' && schedule.status !== 'completed' ? (
                            <button
                              onClick={() => handleToggleSchedule(schedule.id, schedule.status === 'active' ? 'active' : 'stopped')}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                schedule.status === 'active'
                                  ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 hover:shadow-md'
                                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:shadow-md'
                              }`}
                              title={schedule.status === 'active' ? 'Pause schedule' : 'Resume schedule'}
                            >
                              {schedule.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </button>
                          ) : (
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Create Schedule Form Modal */}
        {showCreateForm && (
          <CreateScheduleForm
            platform={platform}
            account={account}
            onClose={() => setShowCreateForm(false)}
            onSuccess={() => {
              console.log('Schedule created successfully, triggering refresh...'); // Debug log
              setShowCreateForm(false);
              setSuccessMessage('Schedule created successfully! Your content will be posted automatically.');
              
              // Auto-hide success message after 5 seconds
              setTimeout(() => {
                setSuccessMessage(null);
              }, 5000);
              
              setRefreshTrigger(prev => {
                console.log('Updating refreshTrigger from', prev, 'to', prev + 1); // Debug log
                return prev + 1;
              });
            }}
          />
        )}
      </div>
    </div>
  );
}

// Create Schedule Form Component
interface CreateScheduleFormProps {
  platform: string;
  account: string;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateScheduleForm({ platform, account, onClose, onSuccess }: CreateScheduleFormProps) {
  const [blogTemplates, setBlogTemplates] = useState<CompBlogArticle[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [formData, setFormData] = useState({
    selectedBlogTemplate: '',
    contentType: (platform.toLowerCase() === 'instagram' ? 'image' : 'text') as 'text' | 'image',
    startDate: new Date().toISOString().split('T')[0], // Set to current date
    startTime: new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    }), // Set to current UTC time
    timezone: 'UTC', // Force UTC only
    frequency: 'once' as 'once' | 'daily' | 'weekly',
    dayOfWeek: undefined as number | undefined
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // AI Keyword Generation States
  const [aiMode, setAiMode] = useState<'templates' | 'ai-generate' | 'manual'>('templates');
  const [aiTopic, setAiTopic] = useState<string>('');
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualKeyword, setManualKeyword] = useState<string>('');
  const [manualOutline, setManualOutline] = useState<string>('');
  const [aiGeneratedData, setAiGeneratedData] = useState<AIKeywordData | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

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

  // Helper function to convert platform to backend format
  const convertPlatformToBackendFormat = (platform: string): string => {
    const platformMap: { [key: string]: string } = {
      'x': 'X',
      'twitter': 'X',
      'tiktok': 'TikTok',
      'instagram': 'Instagram',
      'linkedin': 'LinkedIn',
      'youtube': 'YouTube',
      'facebook': 'Facebook',
      'pinterest': 'Pinterest',
      'threads': 'Threads'
    };
    return platformMap[platform.toLowerCase()] || platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
  };

  // Fetch blog templates from compBlogContent collection
  const fetchCompBlogContent = async (): Promise<CompBlogArticle[]> => {
    try {
      console.log('🔍 Fetching blog templates from compBlogContent collection...');

      const q = query(collection(db, 'compBlogContent'));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.error('No documents found in compBlogContent collection');
        return [];
      }

      const articles: CompBlogArticle[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data() as CompBlogContent;
        const documentId = doc.id;

        // Check if articles exist
        if (data.articles) {
          Object.entries(data.articles).forEach(([articleId, article]) => {
            // Filter by website for both newpeople and cv-maker
            if (article.website === 'https://newpeople.com' || article.website === 'https://cv-maker.com') {
              articles.push({
                ...article,
                documentId,
                articleId
              });
            }
          });
        }
      });

      console.log(`✅ Found ${articles.length} articles for newpeople and cv-maker websites`);
      return articles;

    } catch (error) {
      console.error('❌ Error fetching compBlogContent:', error);
      return [];
    }
  };

  // Function to get current UTC time
  const getCurrentUTCTime = () => {
    try {
      const now = new Date();
      return now.toLocaleTimeString('en-US', {
        timeZone: 'UTC',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Could not get UTC time, using default:', error);
      return '12:00';
    }
  };

  // Function to get current UTC time with seconds
  const getCurrentUTCTimeWithSeconds = () => {
    try {
      return new Date().toLocaleString('en-US', { 
        timeZone: 'UTC',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return 'Unable to get UTC time';
    }
  };

  // UTC Only - No timezone options needed
  const timezoneOptions = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: '+00:00' },
  ];

  // AI Keyword Generation Functions
  const handleAIGenerate = async () => {
    if (aiMode === 'ai-generate') {
      const validation = validateTopic(aiTopic);
      if (!validation.isValid) {
        setAiError(validation.error || 'Invalid topic');
        return;
      }

      setAiLoading(true);
      setAiError(null);

      try {
        const result = await generateKeywordsFromTopic(aiTopic, account);
        if (result.success && result.data) {
          setAiGeneratedData(result.data);
          console.log('✅ AI generated keywords and title:', result.data);
        } else {
          setAiError(result.message || 'Failed to generate keywords');
        }
      } catch (error) {
        console.error('Error generating AI keywords:', error);
        setAiError('Failed to generate keywords');
      } finally {
        setAiLoading(false);
      }
    } else if (aiMode === 'manual') {
      const validation = validateManualInputs(manualTitle, manualKeyword);
      if (!validation.isValid) {
        setAiError(validation.error || 'Invalid inputs');
        return;
      }

      setAiLoading(true);
      setAiError(null);

      try {
        const result = await generateKeywordsFromInputs(manualTitle, manualKeyword, account);
        if (result.success && result.data) {
          // Preserve the manual outline if it exists, otherwise use AI generated outline
          const enhancedData = {
            ...result.data,
            outline: manualOutline.trim() || result.data.outline
          };
          setAiGeneratedData(enhancedData);
          console.log('✅ AI generated additional keywords:', enhancedData);
        } else {
          setAiError(result.message || 'Failed to generate keywords');
        }
      } catch (error) {
        console.error('Error generating AI keywords:', error);
        setAiError('Failed to generate keywords');
      } finally {
        setAiLoading(false);
      }
    }
  };

  const resetAIMode = () => {
    setAiMode('templates');
    setAiTopic('');
    setManualTitle('');
    setManualKeyword('');
    setManualOutline('');
    setAiGeneratedData(null);
    setAiError(null);
  };

  // Fetch blog templates on component mount and detect timezone
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setTemplatesLoading(true);
        // Fetch blog content from compBlogContent collection
        const blogContentData = await fetchCompBlogContent();

        console.log('Fetched blog templates for account:', account, blogContentData);

        // Filter out any templates without titles
        const validTemplates = blogContentData.filter(template =>
          template.title && template.title.trim() !== ''
        );

        setBlogTemplates(validTemplates);

        // Auto-select first template if available
        if (validTemplates.length > 0) {
          const template = validTemplates[0];
          const templateId = template.articleId
            ? `${template.documentId}_${template.articleId}`
            : template.documentId || template.title;
          setFormData(prev => ({ ...prev, selectedBlogTemplate: templateId })); // Use proper document ID
        }
      } catch (error) {
        console.error('Error fetching blog templates:', error);
        setError('Failed to load blog templates');
      } finally {
        setTemplatesLoading(false);
      }
    };

    // Set current UTC time
    const currentUTCTime = getCurrentUTCTime();
    console.log('Setting UTC time:', currentUTCTime);
    setFormData(prev => ({
      ...prev,
      timezone: 'UTC',
      startTime: currentUTCTime
    }));

    fetchTemplates();
  }, [account]);

  // Validate date and time when form data changes
  useEffect(() => {
    if (formData.startDate && formData.startTime) {
      const validation = validateDateTime(formData.startDate, formData.startTime, formData.timezone);
      if (!validation.isValid) {
        setValidationError(validation.error || 'Please select a future date and time');
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError(null);
    }
  }, [formData.startDate, formData.startTime]);

  // Import the validation function from timeUtils
  const validateDateTime = (date: string, time: string, timezone: string = 'UTC'): { isValid: boolean; error?: string } => {
    try {
      // Create UTC date string directly
      const dateTimeString = `${date}T${time}:00.000Z`;
      const utcDate = new Date(dateTimeString);
      
      if (isNaN(utcDate.getTime())) {
        return { isValid: false, error: 'Invalid date or time format' };
      }
      
      const now = new Date();
      if (utcDate <= now) {
        return { isValid: false, error: 'Please select a future date and time' };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'Failed to validate date and time' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let templateId;
    let topicToUse;

    // Handle different modes
    if (aiMode === 'templates') {
    if (!formData.selectedBlogTemplate) {
      setError('Please select a blog template');
        return;
      }

      // Get the topic from the selected template
      const selectedTemplate = blogTemplates.find(t => {
        const templateId = t.articleId
          ? `${t.documentId}_${t.articleId}`
          : t.documentId || t.title;
        return templateId === formData.selectedBlogTemplate;
      });
      if (!selectedTemplate) {
        throw new Error('Selected blog template not found');
      }

      topicToUse = selectedTemplate.title;
      templateId = formData.selectedBlogTemplate;
    } else if (aiMode === 'ai-generate') {
      // Validate AI generated data
      if (!aiGeneratedData) {
        setError('Please generate AI keywords and title first');
        return;
      }

      topicToUse = aiGeneratedData.title;
      templateId = 'ai-generated-content';
    } else if (aiMode === 'manual') {
      // For manual mode, validate required fields
      if (!manualTitle.trim()) {
        setError('Please enter a title');
        return;
      }
      
      if (!manualKeyword.trim()) {
        setError('Please enter at least one keyword');
        return;
      }

      // Parse manual keywords (comma-separated)
      const manualKeywords = manualKeyword.split(',').map(k => k.trim()).filter(k => k.length > 0);
      
      if (manualKeywords.length === 0) {
        setError('Please enter at least one valid keyword');
        return;
      }

      topicToUse = manualTitle;
      templateId = 'ai-generated-content';
    } else {
      setError('Invalid mode selected');
      return;
    }
    
    if (!formData.startDate) {
      setError('Please select a start date');
      return;
    }

    // Validate platform
    const validPlatforms = ['x', 'twitter', 'tiktok', 'instagram', 'linkedin', 'youtube', 'facebook', 'pinterest', 'threads'];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      setError(`Invalid platform: ${platform}. Supported platforms: ${validPlatforms.join(', ')}`);
      return;
    }

    // Validate date and time before submission (UTC only)
    const validation = validateDateTime(formData.startDate, formData.startTime, 'UTC');
    if (!validation.isValid) {
      setError(validation.error || 'Please select a future date and time');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert date and time to cron expression with proper timezone handling
      // Create UTC date by appending 'Z' to force UTC interpretation
      const startDate = new Date(`${formData.startDate}T${formData.startTime}:00.000Z`);
      const cronExpression = convertToCronExpression(startDate);

      // Convert platform to backend format
      const backendPlatform = convertPlatformToBackendFormat(platform);

      console.log('Creating schedule with platform:', backendPlatform); // Debug log

      // Determine maxPosts based on frequency
      const maxPosts = formData.frequency === 'once' ? 1 : 100; // Unlimited for recurring schedules
      
      // Use the actual backend endpoint for creating social media schedules
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/socialagent/scheduler/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: topicToUse,
          description: `Automated ${formData.contentType} content for ${getPlatformDisplayName(platform)} (${formData.frequency})`,
          cronExpression,
          timezone: 'UTC', // Force UTC only
          frequency: formData.frequency,
          dayOfWeek: formData.dayOfWeek,
          account,
          generateImage: formData.contentType === 'image',
          imageStyle: 'professional',
          maxPosts,
          platforms: [backendPlatform],
          contentType: formData.contentType,
          targetAudience: 'General audience',
          tone: 'professional',
          autoPublish: true,
          isActive: true,
          templateId: templateId, // ✅ Use the correct templateId based on mode
          keyword: topicToUse, // ✅ Add keyword for consistent keyword usage
          articleTitle: topicToUse, // ✅ Add articleTitle for specific article targeting
          // Include AI-generated content data for backend processing
          ...(aiMode === 'ai-generate' || aiMode === 'manual' ? {
            title: aiMode === 'manual' ? manualTitle : aiGeneratedData?.title,
            description: aiMode === 'manual' ? `Social media content about ${manualKeyword}` : aiGeneratedData?.description,
            primary_keywords: aiMode === 'manual' ? manualKeyword.split(',').map(k => k.trim()).filter(k => k.length > 0) : aiGeneratedData?.primary_keywords,
            secondary_keywords: aiGeneratedData?.secondary_keywords || [],
            long_tail_keywords: aiGeneratedData?.long_tail_keywords || [],
            outline: manualOutline.trim() || (aiGeneratedData?.outline || `Introduction, Key points, Call to action`),
            visual: 'AI Generated',
            website: account === 'newpeople' ? 'https://newpeople.com' : 'https://cv-maker.com'
          } : {})
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error response:', errorData); // Debug log
        throw new Error(errorData.message || 'Failed to create schedule');
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating schedule:', error);
      setError(error instanceof Error ? error.message : 'Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert frequency and start time to cron expression - UTC ONLY
  const convertToCronExpression = (startDate: Date): string => {
    const minute = startDate.getUTCMinutes();
    const hour = startDate.getUTCHours();
    const day = startDate.getUTCDate();
    const month = startDate.getUTCMonth() + 1; // getUTCMonth() returns 0-11
    
    switch (formData.frequency) {
      case 'once':
        return `${minute} ${hour} ${day} ${month} *`; // One-time schedule
      case 'daily':
        return `${minute} ${hour} * * *`; // Daily at specified time
      case 'weekly':
        const dayOfWeek = formData.dayOfWeek !== undefined ? formData.dayOfWeek : startDate.getUTCDay();
        return `${minute} ${hour} * * ${dayOfWeek}`; // Weekly on specified day
      default:
        return `${minute} ${hour} ${day} ${month} *`; // Default to one-time
    }
  };

  return (
    <>
      {/* Full screen blur overlay */}
      <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40"></div>
      
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-w-[95vw] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] mx-auto h-auto max-h-[95vh] overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-black text-white px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center rounded-t-xl">
          <h3 className="text-lg sm:text-xl font-semibold">Create Schedule</h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors p-1"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-h-[calc(95vh-80px)]">
          {/* UTC Notice */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
              <svg className="h-3 w-3 mr-1.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-blue-800">UTC Time Zone</span>
            </div>
            <div className="inline-flex items-center px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
              <Clock className="h-3 w-3 mr-1.5 text-green-600" />
              <span className="text-xs font-medium text-green-800">Current UTC: {getCurrentUTCTimeWithSeconds()}</span>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Content Generation Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setAiMode('templates');
                  setAiGeneratedData(null);
                  setAiTopic('');
                  setManualTitle('');
                  setManualKeyword('');
                  setManualOutline('');
                }}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                  aiMode === 'templates'
                    ? 'bg-gray-800 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Templates</span>
                <span className="sm:hidden">Templates</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAiMode('ai-generate');
                  setAiGeneratedData(null);
                  setAiTopic('');
                  setManualTitle('');
                  setManualKeyword('');
                  setManualOutline('');
                }}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                  aiMode === 'ai-generate'
                    ? 'bg-gray-800 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">AI Generate</span>
                <span className="sm:hidden">AI Generate</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAiMode('manual');
                  setAiGeneratedData(null);
                  setAiTopic('');
                  setManualTitle('');
                  setManualKeyword('');
                  setManualOutline('');
                }}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                  aiMode === 'manual'
                    ? 'bg-gray-800 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Manual</span>
                <span className="sm:hidden">Manual</span>
              </button>
            </div>
          </div>

          {/* Templates Mode */}
          {aiMode === 'templates' && (
            <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-2" />
                Select Blog Template
              </label>
              <select
                value={formData.selectedBlogTemplate}
                onChange={(e) => setFormData(prev => ({ ...prev, selectedBlogTemplate: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-black focus:bg-gray-200 transition ease-in-out duration-150"
                disabled={templatesLoading || blogTemplates.length === 0}
                required
              >
                {templatesLoading && <option>Loading templates...</option>}
                {!templatesLoading && blogTemplates.length === 0 && <option>No templates available</option>}
                {!templatesLoading && <option value="">-- Select a blog template --</option>}
                {!templatesLoading && blogTemplates.map((template) => {
                  const templateId = template.articleId
                    ? `${template.documentId}_${template.articleId}`
                    : template.documentId || template.title;
                  return (
                    <option key={templateId} value={templateId}>
                      {template.title}
                    </option>
                  );
                })}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose a blog template to generate social media content from
              </p>
            </div>

            {/* Content Type Selection - Hidden for Instagram */}
            {platform.toLowerCase() !== 'instagram' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                <select
                  value={formData.contentType}
                  onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-black focus:bg-gray-200 transition ease-in-out duration-150"
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                </select>
              </div>
            )}
            
            {/* Instagram notice */}
            {platform.toLowerCase() === 'instagram' && (
              <div className="p-3 bg-black/10 border border-black/20 rounded-lg">
                <div className="flex items-center gap-2 text-black">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Instagram posts will include images automatically</span>
                </div>
              </div>
            )}
          </div>
          )}

          {/* AI Generate Mode */}
          {aiMode === 'ai-generate' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Sparkles className="inline h-4 w-4 mr-2" />
                  Describe your topic
                </label>
                <textarea
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g., 'How to improve productivity in remote work', 'Best practices for digital marketing', 'Career development tips'"
                  className="w-full bg-gray-100 text-gray-800 border-0 rounded-lg p-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800 transition ease-in-out duration-150 text-sm resize-none"
                  rows={4}
                  disabled={aiLoading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Describe what you want to write about and AI will generate keywords and title
                </p>
              </div>

              {aiError && (
                <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm">
                  {aiError}
                </div>
              )}

              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={aiLoading || !aiTopic.trim()}
                className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition ease-in-out duration-150 ${
                  aiLoading || !aiTopic.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-700 hover:to-blue-700 shadow-lg'
                }`}
              >
                {aiLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Wand2 className="mr-2 h-5 w-5" />
                    AI Generate Keywords & Title
                  </span>
                )}
              </button>

              {aiGeneratedData && (
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="font-semibold text-emerald-800 text-lg">Generated Content</h4>
                    </div>
                    <button
                      onClick={() => setAiGeneratedData(null)}
                      className="flex items-center gap-2 px-3 py-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 rounded-lg transition-all duration-200 text-sm font-medium"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Regenerate
                    </button>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="font-medium text-emerald-700 mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Title
                      </label>
                      <input
                        type="text"
                        value={aiGeneratedData.title}
                        onChange={(e) => setAiGeneratedData(prev => prev ? {...prev, title: e.target.value} : null)}
                        className="w-full bg-white border border-emerald-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition-all duration-200 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-emerald-700 mb-2 flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Primary Keywords
                      </label>
                      <input
                        type="text"
                        value={aiGeneratedData.primary_keywords.join(', ')}
                        onChange={(e) => setAiGeneratedData(prev => prev ? {...prev, primary_keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k.length > 0)} : null)}
                        className="w-full bg-white border border-emerald-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition-all duration-200 shadow-sm"
                        placeholder="Enter keywords separated by commas"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-emerald-700 mb-2 flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        Description
                      </label>
                      <textarea
                        value={aiGeneratedData.description}
                        onChange={(e) => setAiGeneratedData(prev => prev ? {...prev, description: e.target.value} : null)}
                        className="w-full bg-white border border-emerald-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition-all duration-200 shadow-sm resize-none"
                        rows={3}
                        placeholder="Enter description"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-emerald-700 mb-2 flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Secondary Keywords
                      </label>
                      <input
                        type="text"
                        value={aiGeneratedData.secondary_keywords.join(', ')}
                        onChange={(e) => setAiGeneratedData(prev => prev ? {...prev, secondary_keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k.length > 0)} : null)}
                        className="w-full bg-white border border-emerald-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition-all duration-200 shadow-sm"
                        placeholder="Enter keywords separated by commas"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-emerald-700 mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Outline
                      </label>
                      <textarea
                        value={aiGeneratedData.outline}
                        onChange={(e) => setAiGeneratedData(prev => prev ? {...prev, outline: e.target.value} : null)}
                        className="w-full bg-white border border-emerald-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition-all duration-200 shadow-sm resize-none max-h-48 overflow-y-auto"
                        rows={6}
                        placeholder="Enter outline"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Content Type Selection for AI Mode */}
              {platform.toLowerCase() !== 'instagram' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                  <select
                    value={formData.contentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-black focus:bg-gray-200 transition ease-in-out duration-150"
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Manual Mode */}
          {aiMode === 'manual' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Edit3 className="inline h-4 w-4 mr-2" />
                  Content Title
                </label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Enter your content title"
                  className="w-full bg-gray-100 text-gray-800 border-0 rounded-lg p-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800 transition ease-in-out duration-150 text-sm"
                  disabled={aiLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={manualKeyword}
                  onChange={(e) => setManualKeyword(e.target.value)}
                  placeholder="Enter keywords separated by commas (e.g., career, job search, professional development)"
                  className="w-full bg-gray-100 text-gray-800 border-0 rounded-lg p-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800 transition ease-in-out duration-150 text-sm"
                  disabled={aiLoading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter multiple keywords separated by commas. These will be used for content generation.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <FileText className="inline h-4 w-4 mr-2" />
                  Outline
                </label>
                <textarea
                  value={manualOutline}
                  onChange={(e) => setManualOutline(e.target.value)}
                  placeholder="Enter your content outline (e.g., Introduction to career development, Key strategies for job search, Best practices for resume writing, Conclusion and next steps)"
                  className="w-full bg-gray-100 text-gray-800 border-0 rounded-lg p-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800 transition ease-in-out duration-150 text-sm resize-none"
                  rows={4}
                  disabled={aiLoading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Provide a structured outline for your content. This helps create better organized posts.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Optional: AI Enhancement</h4>
                <p className="text-xs text-gray-500 mb-4">
                  Generate additional keywords and content suggestions using AI (optional)
                </p>

                {aiError && (
                  <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm mb-4">
                    {aiError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={aiLoading || !manualTitle.trim() || !manualKeyword.trim()}
                  className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition ease-in-out duration-150 ${
                    aiLoading || !manualTitle.trim() || !manualKeyword.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-700 hover:to-blue-700 shadow-lg'
                  }`}
                >
                  {aiLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Wand2 className="mr-2 h-5 w-5" />
                      Generate Additional Keywords (Optional)
                    </span>
                  )}
                </button>

                {aiGeneratedData && (
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 mt-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="font-semibold text-emerald-800 text-lg">AI Enhanced Content</h4>
                      </div>
                      <button
                        onClick={() => setAiGeneratedData(null)}
                        className="flex items-center gap-2 px-3 py-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 rounded-lg transition-all duration-200 text-sm font-medium"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Regenerate
                      </button>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className="font-medium text-emerald-700 mb-2 flex items-center gap-2">
                          <Edit3 className="h-4 w-4" />
                          Enhanced Title
                        </label>
                        <input
                          type="text"
                          value={aiGeneratedData.title}
                          onChange={(e) => setAiGeneratedData(prev => prev ? {...prev, title: e.target.value} : null)}
                          className="w-full bg-white border border-emerald-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition-all duration-200 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-emerald-700 mb-2 flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          Additional Keywords
                        </label>
                        <input
                          type="text"
                          value={aiGeneratedData.primary_keywords.join(', ')}
                          onChange={(e) => setAiGeneratedData(prev => prev ? {...prev, primary_keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k.length > 0)} : null)}
                          className="w-full bg-white border border-emerald-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition-all duration-200 shadow-sm"
                          placeholder="Enter keywords separated by commas"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-emerald-700 mb-2 flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          Secondary Keywords
                        </label>
                        <input
                          type="text"
                          value={aiGeneratedData.secondary_keywords.join(', ')}
                          onChange={(e) => setAiGeneratedData(prev => prev ? {...prev, secondary_keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k.length > 0)} : null)}
                          className="w-full bg-white border border-emerald-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition-all duration-200 shadow-sm"
                          placeholder="Enter keywords separated by commas"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-emerald-700 mb-2 flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          Description
                        </label>
                        <textarea
                          value={aiGeneratedData.description}
                          onChange={(e) => setAiGeneratedData(prev => prev ? {...prev, description: e.target.value} : null)}
                          className="w-full bg-white border border-emerald-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition-all duration-200 shadow-sm resize-none"
                          rows={3}
                          placeholder="Enter description"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-emerald-700 mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Outline
                        </label>
                        <textarea
                          value={aiGeneratedData.outline}
                          onChange={(e) => setAiGeneratedData(prev => prev ? {...prev, outline: e.target.value} : null)}
                          className="w-full bg-white border border-emerald-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition-all duration-200 shadow-sm resize-none max-h-48 overflow-y-auto"
                          rows={6}
                          placeholder="Enter outline"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Content Type Selection for Manual Mode */}
              {platform.toLowerCase() !== 'instagram' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                  <select
                    value={formData.contentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-black focus:bg-gray-200 transition ease-in-out duration-150"
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  frequency: e.target.value as 'once' | 'daily' | 'weekly',
                  dayOfWeek: undefined
                }))}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-black focus:bg-gray-200 transition ease-in-out duration-150"
              >
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          {/* Frequency-specific options */}
          {formData.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
              <select
                value={formData.dayOfWeek || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  dayOfWeek: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-black focus:bg-gray-200 transition ease-in-out duration-150"
              >
                <option value="">Select day</option>
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
              </select>
              {formData.frequency.startsWith('weekly-') && (
                <div className="text-xs text-blue-600 mt-1">
                  ✓ Day automatically set based on frequency selection
                </div>
              )}
            </div>
          )}


          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-black focus:bg-gray-200 transition ease-in-out duration-150"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-black focus:bg-gray-200 transition ease-in-out duration-150"
              />
              <div className="text-xs text-gray-500 mt-1">
                Time in UTC (Coordinated Universal Time)
              </div>
            </div>
          </div>

          {/* Real-time validation feedback */}
          {formData.startDate && formData.startTime && (
            <div className="text-sm">
              {validationError ? (
                <div className="text-red-600 flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validationError}
                </div>
              ) : (
                <div className="text-green-600 flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Valid schedule time
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!validationError || (aiMode === 'templates' && !formData.selectedBlogTemplate) || (aiMode === 'ai-generate' && !aiGeneratedData) || (aiMode === 'manual' && (!manualTitle.trim() || !manualKeyword.trim()))}
              className="w-full sm:flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              <span className="truncate">Create Schedule</span>
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  );
}

export default SocialSchedulerTab;