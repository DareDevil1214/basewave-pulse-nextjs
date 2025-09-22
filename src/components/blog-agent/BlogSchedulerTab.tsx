'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, RefreshCw, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScheduleForm } from './ScheduleForm';
import { ScheduleList } from './ScheduleList';
import { getPortalLink } from '@/lib/social-links';

interface BlogSchedulerTabProps {
  portal: 'newpeople';
  onBack?: () => void;
}

export function BlogSchedulerTab({ portal, onBack }: BlogSchedulerTabProps) {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editScheduleId, setEditScheduleId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreateSchedule = () => {
    setEditScheduleId(null);
    setShowScheduleForm(true);
  };

  const handleEditSchedule = (scheduleId: string) => {
    setEditScheduleId(scheduleId);
    setShowScheduleForm(true);
  };

  const handleScheduleSuccess = () => {
    setShowScheduleForm(false);
    setEditScheduleId(null);
    
    // Show success message
    setSuccessMessage(editScheduleId ? 'Schedule updated successfully!' : 'Schedule created successfully! Your blog will be posted automatically.');
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
    
    // Trigger a refresh of the schedules table
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    }
  };

  // Format portal name for display
  const formatPortalName = (portal: string): string => {
    switch (portal) {
      case 'eliteequilibrium':
        return 'Elite Equilibrium';
      case 'neovibemag':
        return 'Neo Vibe Mag';
      case 'eternalelite':
        return 'Eternal Elite';
      case 'newpeople':
        return 'New People';
      default:
        return portal.charAt(0).toUpperCase() + portal.slice(1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6">

        {/* Clean Header - Matching Dashboard/SEO Style */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Blog Scheduler</h1>
          <p className="text-gray-600 text-lg">Schedule and manage content for your {formatPortalName(portal)} portal</p>
          <div className="mt-2 inline-flex items-center px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
            <svg className="h-3 w-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium text-blue-800">UTC:</span>
            <span className="ml-1 text-xs font-mono text-blue-700">
              {new Date().toLocaleString('en-US', { 
                timeZone: 'UTC',
                hour12: true,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleGoBack}
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
          
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh schedules"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            
            {/* Portal Link Button */}
            <button
              onClick={() => {
                const portalLink = getPortalLink(portal);
                if (portalLink) {
                  window.open(portalLink, '_blank');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              disabled={!getPortalLink(portal)}
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open Portal</span>
            </button>
            
            <button
              onClick={handleCreateSchedule}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Schedule</span>
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
        <ScheduleList
          portal={portal}
          refreshTrigger={refreshTrigger}
          onEdit={handleEditSchedule}
        />
      </div>

              {/* Schedule Form Modal */}
        {showScheduleForm && (
          <ScheduleForm
            portal={portal}
            scheduleId={editScheduleId}
            onClose={() => setShowScheduleForm(false)}
            onSuccess={handleScheduleSuccess}
          />
        )}
      </div>
    </div>
  );
}