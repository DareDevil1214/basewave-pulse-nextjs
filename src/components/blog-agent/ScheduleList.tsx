'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Calendar, Play, Pause, Trash2, Edit, Clock, RefreshCw, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlogSchedule } from '@/types/scheduler';
import { schedulerAPI } from '@/api/scheduler';
import { formatDisplayDate } from '@/utils/timeUtils';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

interface ScheduleListProps {
  portal: 'newpeople';
  refreshTrigger?: number; // Used to trigger a refresh when a new schedule is added
  onEdit: (scheduleId: string) => void;
}

export function ScheduleList({ portal, refreshTrigger = 0, onEdit }: ScheduleListProps) {
  const [schedules, setSchedules] = useState<BlogSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingSchedules, setUpdatingSchedules] = useState<Set<string>>(new Set());
  const [deletingSchedules, setDeletingSchedules] = useState<Set<string>>(new Set());
  const [executingSchedules, setExecutingSchedules] = useState<Set<string>>(new Set());
  const [optimisticSchedules, setOptimisticSchedules] = useState<BlogSchedule[]>([]);
  
  // Fetch schedules when component mounts or refreshTrigger changes
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        setLoading(true);
        const response = await schedulerAPI.getSchedules(portal);
        
        if (response.success && response.data) {
          // Filter schedules by portal as an additional safety measure
          const filteredSchedules = response.data.filter(schedule => 
            schedule.portal === portal || schedule.portal === formatPortalName(portal).toLowerCase().replace(/\s+/g, '')
          );
          
          setSchedules(filteredSchedules);
          setOptimisticSchedules(filteredSchedules);
        } else {
          setError(response.message || 'Failed to load schedules');
        }
      } catch (error) {
        console.error('Error fetching blog schedules:', error);
        setError('Failed to load blog schedules');
      } finally {
        setLoading(false);
      }
    };
    
    loadSchedules();
  }, [portal, refreshTrigger]);

  // Auto-refresh schedules every 30 seconds to catch execution updates
  useEffect(() => {
    const interval = setInterval(() => {
      const loadSchedules = async () => {
        try {
          const response = await schedulerAPI.getSchedules(portal);
          
          if (response.success && response.data) {
            // Filter schedules by portal as an additional safety measure
            const filteredSchedules = response.data.filter(schedule => 
              schedule.portal === portal || schedule.portal === formatPortalName(portal).toLowerCase().replace(/\s+/g, '')
            );
            
            setSchedules(filteredSchedules);
            setOptimisticSchedules(filteredSchedules);
          }
        } catch (error) {
          console.error('Error auto-refreshing blog schedules:', error);
        }
      };
      
      loadSchedules();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [portal]);

  // Update optimistic schedules when schedules changes
  useEffect(() => {
    setOptimisticSchedules(schedules);
  }, [schedules]);

  // Toggle schedule status (active/inactive)
  const handleToggleStatus = async (scheduleId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // Optimistic update - immediately update the local state
    setOptimisticSchedules(prev => 
      prev.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, isActive: newStatus }
          : schedule
      )
    );
    setUpdatingSchedules(prev => new Set(prev).add(scheduleId));
    
    try {
      if (newStatus) {
        await schedulerAPI.startSchedule(scheduleId);
      } else {
        await schedulerAPI.stopSchedule(scheduleId);
      }
      // Success - optimistic update was correct
    } catch (error) {
      // Revert on error by refreshing data
      const response = await schedulerAPI.getSchedules(portal);
      if (response.success && response.data) {
        setSchedules(response.data);
        setOptimisticSchedules(response.data);
      }
      console.error('Failed to update schedule status:', error);
    } finally {
      setUpdatingSchedules(prev => {
        const newSet = new Set(prev);
        newSet.delete(scheduleId);
        return newSet;
      });
    }
  };

  // Delete a schedule
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) {
      return;
    }
    
    // Optimistic update - immediately remove from local state
    setOptimisticSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
    setDeletingSchedules(prev => new Set(prev).add(scheduleId));
    
    try {
      await schedulerAPI.deleteSchedule(scheduleId);
      // Success - optimistic update was correct
    } catch (error) {
      // Revert on error by refreshing data
      const response = await schedulerAPI.getSchedules(portal);
      if (response.success && response.data) {
        setSchedules(response.data);
        setOptimisticSchedules(response.data);
      }
      console.error('Failed to delete schedule:', error);
    } finally {
      setDeletingSchedules(prev => {
        const newSet = new Set(prev);
        newSet.delete(scheduleId);
        return newSet;
      });
    }
  };

  // Execute a schedule immediately
  const handleExecuteSchedule = async (scheduleId: string) => {
    setExecutingSchedules(prev => new Set(prev).add(scheduleId));
    
    try {
      await schedulerAPI.executeSchedule(scheduleId);
      
      // Update the optimistic schedule with execution count
      setOptimisticSchedules(prev => {
        return prev.map(s => 
          s.id === scheduleId 
            ? { 
                ...s, 
                executionCount: (s.executionCount || 0) + 1,
                lastExecuted: new Date().toISOString(),
                lastStatus: 'success'
              }
            : s
        );
      });
    } catch (error) {
      console.error('Failed to execute schedule:', error);
    } finally {
      setExecutingSchedules(prev => {
        const newSet = new Set(prev);
        newSet.delete(scheduleId);
        return newSet;
      });
    }
  };
  
  // Modern Toggle Switch Component
  const ToggleSwitch = ({ checked, onChange, disabled = false }: { 
    checked: boolean; 
    onChange: () => void; 
    disabled?: boolean;
  }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
        ${checked ? 'bg-green-500 shadow-lg shadow-green-200' : 'bg-gray-200'}
        ${disabled ? 'opacity-60' : ''}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition-all duration-300 ease-out
          ${checked ? 'translate-x-6' : 'translate-x-1'}
          ${disabled ? 'animate-pulse' : ''}
        `}
      />
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
  
  // Format portal name for display
  const formatPortalName = (portal: string): string => {
    switch (portal) {
      case 'eliteequilibrium':
        return 'Elite Equilibrium';
      case 'neovibemag':
        return 'Neo Vibe Mag';
      case 'eternalelite':
        return 'Eternal Elite';
      default:
        return portal.charAt(0).toUpperCase() + portal.slice(1);
    }
  };

  // Get status badge for a schedule
  const getStatusBadge = (schedule: BlogSchedule) => {
    if (!schedule.isActive) {
      return <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-xs">Inactive</span>;
    }
    
    switch (schedule.lastStatus) {
      case 'success':
        return (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Success</span>
          </div>
        );
      case 'error':
        return <span className="px-2 py-1 bg-red-200 text-red-800 rounded-full text-xs">Error</span>;
      default:
        return <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">Active</span>;
    }
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };
  
  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="h-6 w-6 text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-slate-500">Loading schedules...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
            {error}
          </div>
        </div>
      ) : optimisticSchedules.length === 0 ? (
        <div className="text-center py-12 bg-white/50 rounded-xl border-2 border-dashed border-slate-200">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium text-base">
            No schedules found for {formatPortalName(portal)}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Create your first automated content schedule to get started!
          </p>
        </div>
      ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          <AnimatePresence>
            {optimisticSchedules.map((schedule, index) => {
              // Check if this is a completed "once" schedule - show success card
              const isCompletedOnce = schedule.frequency === 'once' && schedule.status === 'completed';
              
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
                            src='/logo-load.webp' 
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
                           src='/logo-load.webp' 
                           alt="Portal Logo" 
                           className="w-28 h-28 object-contain mx-auto opacity-80" 
                         />
                     </div>
                   </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      schedule.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {schedule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Social Media Badge */}
                  {schedule.generateSocial && (
                    <div className="absolute top-4 right-16">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span>Social</span>
                      </div>
                    </div>
                  )}

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
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(schedule.id);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit schedule
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecuteSchedule(schedule.id);
                          }}
                          disabled={executingSchedules.has(schedule.id)}
                        >
                          {executingSchedules.has(schedule.id) ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="mr-2 h-4 w-4" />
                          )}
                          Execute now
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSchedule(schedule.id);
                          }}
                          disabled={deletingSchedules.has(schedule.id)}
                          className="text-red-600"
                        >
                          {deletingSchedules.has(schedule.id) ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
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
                       <span className="text-gray-600">Portal:</span>
                       <span className="font-medium text-gray-900 capitalize">
                         {schedule.portal ? formatPortalName(schedule.portal) : 'Auto'}
                       </span>
                     </div>
                     <div className="flex items-center justify-between text-xs">
                       <span className="text-gray-600">Type:</span>
                       <span className="font-medium text-gray-900">
                         {schedule.generateSocial ? 'Blog + Social' : 'Blog Only'}
                       </span>
                     </div>
                     <div className="flex items-center justify-between text-xs">
                       <span className="text-gray-600">Executions:</span>
                       <span className="font-medium text-gray-900">
                         {schedule.executionCount || 0}
                       </span>
                     </div>
                  </div>

                                     {/* Portal Logo and Toggle */}
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <img 
                         src='/logo-load.webp' 
                         alt="Portal Logo" 
                         className="w-12 h-12 object-contain" 
                       />
                     </div>
                    
                    <div className="flex items-center gap-2">
                      <ToggleSwitch
                        checked={schedule.isActive}
                        onChange={() => handleToggleStatus(schedule.id, schedule.isActive)}
                        disabled={updatingSchedules.has(schedule.id)}
                      />
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
  );
}
