'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Calendar, Clock, AlertCircle, Share, Instagram, Facebook, Twitter, Linkedin, MessageCircle, Sparkles, Edit3, Wand2, FileText, Hash, RefreshCw, Bot } from 'lucide-react';
import { ScheduleFormData, ScheduleFrequency, CreateScheduleRequest } from '@/types/scheduler';
import { schedulerAPI } from '@/api/scheduler';
// Removed direct Firestore imports - now using backend API only
import { fetchKeywords, Keyword } from '@/lib/blog-firebase';
import { formatDisplayDate, getTimezoneOptions, createTimezoneAwareUTCDateTime, validateDateTime, getCurrentUTCTimeString, getCurrentUTCTimeStringWithSeconds } from '@/utils/timeUtils';
import { 
  generateKeywordsFromTopic, 
  generateKeywordsFromInputs, 
  convertAIDataToFormFormat,
  validateTopic,
  validateManualInputs,
  AIKeywordData 
} from '@/lib/ai-keyword-generator';

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresImage: boolean;
  account: string;
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

interface ScheduleFormProps {
  portal: 'newpeople' | 'cv-maker';
  scheduleId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ScheduleForm({ portal, scheduleId, onClose, onSuccess }: ScheduleFormProps) {
  const [formData, setFormData] = useState<ScheduleFormData>({
    name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC' // Force UTC timezone
    }),
    frequency: 'once',
    portal: portal,
    generateImage: true,
    imageStyle: 'professional',
    timezone: 'UTC', // Force UTC only
    generateSocial: false, // Default to blog only, user can toggle
  });

  const [blogTemplates, setBlogTemplates] = useState<CompBlogArticle[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingData, setFetchingData] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [cronPreview, setCronPreview] = useState<string>('');
  const [nextRunTime, setNextRunTime] = useState<string | null>(null);
  const [currentUTCTime, setCurrentUTCTime] = useState<string>('');
  
  // AI Keyword Generation States
  const [aiMode, setAiMode] = useState<'templates' | 'ai-generate' | 'manual'>('templates');
  const [aiTopic, setAiTopic] = useState<string>('');
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualKeyword, setManualKeyword] = useState<string>('');
  const [manualOutline, setManualOutline] = useState<string>('');
  const [aiGeneratedData, setAiGeneratedData] = useState<AIKeywordData | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // UTC Only - No timezone options needed
  const timezoneOptions = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: '+00:00' },
  ];

  const imageStyleOptions = [
    'professional',
    'creative',
    'minimalist',
    'tech',
    'lifestyle',
  ];

  // Map portal to social media accounts - using same logic as CombinedGenerationForm
  const getPortalAccount = (portal: string): string => {
    const portalMapping: { [key: string]: string } = {
      'elite-equilibrium': 'eliteequilibrium',
      'eliteequilibrium': 'eliteequilibrium',      // ✅ Added missing mapping
      'eternal-elite': 'eternalelite',
      'eternalelite': 'eternalelite',              // ✅ Added missing mapping
      'neo-vibe-mag': 'neovibemag',
      'neovibemag': 'neovibemag'
    };
    return portalMapping[portal.toLowerCase()] || portal;
  };

  // Define social media platforms with conditional logic
  const getSocialPlatforms = (hasImage: boolean): SocialPlatform[] => {
    const account = getPortalAccount(portal);

    const allPlatforms: SocialPlatform[] = [
      { id: 'facebook', name: 'Facebook', icon: Facebook, requiresImage: false, account },
      { id: 'instagram', name: 'Instagram', icon: Instagram, requiresImage: true, account },
      { id: 'threads', name: 'Threads', icon: MessageCircle, requiresImage: false, account },
      { id: 'x', name: 'X (Twitter)', icon: Twitter, requiresImage: false, account },
      { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, requiresImage: false, account },
    ];

    // Filter out Instagram if no image is being generated
    return hasImage ? allPlatforms : allPlatforms.filter(p => p.id !== 'instagram');
  };

  const [socialPlatforms, setSocialPlatforms] = useState<SocialPlatform[]>([]);

  // Update social platforms when generateImage changes
  useEffect(() => {
    setSocialPlatforms(getSocialPlatforms(formData.generateImage));
  }, [formData.generateImage, portal]);

  // Fetch blog templates ONLY from backend API
  const fetchCompBlogContent = async (): Promise<CompBlogArticle[]> => {
    try {
      console.log('🔍 Fetching blog templates via backend API...');

      const token = localStorage.getItem('jwt_token');
      if (!token) {
        console.error('❌ No authentication token found');
        return [];
      }

      const response = await fetch('/api/business/blog-content', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('❌ Backend API failed:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      
      if (!data.success) {
        console.error('❌ API returned error:', data.message);
        return [];
      }

      const articles: CompBlogArticle[] = [];
      
      if (data.data && Array.isArray(data.data)) {
        data.data.forEach((doc: any) => {
          if (doc.articles) {
            Object.entries(doc.articles).forEach(([articleId, article]: [string, any]) => {
              if (article && article.title) {
                articles.push({
                  ...article,
                  documentId: doc.id,
                  articleId
                });
              }
            });
          }
        });
      }

      console.log(`✅ Found ${articles.length} blog templates via backend API`);
      return articles;

    } catch (error) {
      console.error('❌ Error fetching blog content via backend API:', error);
      return [];
    }
  };

  // Auto-set current UTC time when form opens
  useEffect(() => {
    const now = new Date();
    const currentUTCTime = getCurrentUTCTimeString();

    setFormData(prev => ({
      ...prev,
      date: now.toISOString().split('T')[0],
      time: currentUTCTime,
      timezone: 'UTC' // Force UTC only
    }));
  }, []);

  // Update current UTC time every second
  useEffect(() => {
    const updateTime = () => {
      setCurrentUTCTime(getCurrentUTCTimeStringWithSeconds());
    };
    
    // Set initial time
    updateTime();
    
    // Update every second
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isClosing) {
      // Remove auto-scroll behavior - form will open in place
    } else {
      const timer = setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isClosing]);

  useEffect(() => {
    if (formData.date && formData.time && formData.frequency) {
      generateCronPreview();
    }
  }, [formData.date, formData.time, formData.frequency, formData.dayOfWeek]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);

        const [blogContentData, keywordsData] = await Promise.all([
          fetchCompBlogContent(),
          fetchKeywords(portal)
        ]);

        const validTemplates = blogContentData.filter(template =>
          template.title && template.title.trim() !== ''
        );

        setBlogTemplates(validTemplates);
        setKeywords(keywordsData);

        if (validTemplates.length > 0) {
          const template = validTemplates[0];
          const templateId = template.articleId
            ? `${template.documentId}_${template.articleId}`
            : template.documentId || template.title;

          setFormData(prev => ({
            ...prev,
            templateId: templateId
          }));
        }

        if (keywordsData.length > 0) {
          setFormData(prev => ({
            ...prev,
            keyword: keywordsData[0].keyword
          }));
        }

        if (scheduleId) {
          const response = await schedulerAPI.getSchedule(scheduleId);

          if (response.success && response.data) {
            const scheduleData = response.data;

            // Add debugging to see what's actually coming from Firebase
            console.log('🔍 Loading schedule data:', scheduleData);
            console.log('�� generateImage from Firebase:', scheduleData.generateImage);
            console.log('�� generateImage type:', typeof scheduleData.generateImage);

            const date = scheduleData.nextRunTime
              ? new Date(scheduleData.nextRunTime).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0];

            const time = scheduleData.nextRunTime
              ? new Date(scheduleData.nextRunTime).toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'UTC' // Force UTC timezone
              })
              : new Date().toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'UTC' // Force UTC timezone
              });

            // Determine frequency and dayOfWeek from cron expression if needed
            let frequency = scheduleData.frequency || 'once';
            let dayOfWeek = undefined;
            
            if (scheduleData.cronExpression && scheduleData.cronExpression.split(' ').length === 5) {
              const cronParts = scheduleData.cronExpression.split(' ');
              const [minute, hour, day, month, dayOfWeekCron] = cronParts;
              
              // Determine frequency from cron expression
              if (day === '*' && month === '*' && dayOfWeekCron === '*') {
                frequency = 'daily';
              } else if (day === '*' && month === '*' && dayOfWeekCron !== '*') {
                frequency = 'weekly';
                dayOfWeek = parseInt(dayOfWeekCron);
              } else if (day !== '*' && month !== '*' && dayOfWeekCron === '*') {
                frequency = 'once';
              }
            }

            setFormData({
              name: scheduleData.name || '',
              description: scheduleData.description || '',
              date,
              time,
              frequency,
              dayOfWeek,
              portal: scheduleData.portal || portal,
              generateImage: scheduleData.generateImage === true,  // Explicit boolean comparison
              imageStyle: scheduleData.imageStyle || 'professional',
              templateId: scheduleData.templateId,
              keyword: scheduleData.keyword,
              generateSocial: scheduleData.generateSocial === true,  // Also fix this one
            });

            // Add debugging to see what was set
            console.log('🔍 Final form data generateImage:', scheduleData.generateImage === true);
          } else {
            setError('Failed to load schedule data');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load required data');
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [scheduleId, portal]);

  const generateCronPreview = async () => {
    try {
      const utcTime = createTimezoneAwareUTCDateTime(formData.date, formData.time, 'UTC');

      const response = await schedulerAPI.convertTimeToCron({
        utcTime,
        frequency: formData.frequency,
        dayOfWeek: formData.dayOfWeek,
        timezone: 'UTC', // Force UTC only
      });

      if (response.success && response.data) {
        setCronPreview(response.data.cronExpression);
        setNextRunTime(response.data.nextRunTime);
      }
    } catch (error) {
      console.error('Failed to generate cron preview:', error);
    }
  };

  const handleInputChange = (field: keyof ScheduleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('date', e.target.value);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('time', e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let templateId;
      let keyword;

      // Handle different modes for template/keyword selection
      if (aiMode === 'templates') {
      if (!formData.name || !formData.templateId) {
        setError('Please fill in all required fields');
          return;
        }
        templateId = formData.templateId;
        keyword = formData.keyword;
      } else if (aiMode === 'ai-generate') {
        if (!formData.name || !aiGeneratedData) {
          setError('Please generate AI keywords and title first');
          return;
        }
        // Use special templateId for AI-generated content
        templateId = 'ai-generated-content';
        keyword = aiGeneratedData.primary_keywords[0] || aiGeneratedData.title;
      } else if (aiMode === 'manual') {
        if (!formData.name || !manualTitle.trim()) {
          setError('Please enter a schedule name and blog title');
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

        // Use special templateId for manual content
        templateId = 'ai-generated-content';
        keyword = manualKeywords.join(', ');
      } else {
        setError('Invalid mode selected');
        return;
      }

      const validation = validateDateTime(formData.date, formData.time, 'UTC');
      if (!validation.isValid) {
        setError(validation.error || 'Please select a future date and time');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      const utcTime = createTimezoneAwareUTCDateTime(formData.date, formData.time, 'UTC');

      const request: CreateScheduleRequest = {
        name: formData.name,
        description: formData.description,
        utcTime,
        frequency: formData.frequency,
        portal: formData.portal,
        generateImage: formData.generateImage,
        imageStyle: formData.imageStyle,
        isActive: true,
        templateId: templateId,
        keyword: keyword,
        generateSocial: formData.generateSocial,
      };

      if (formData.frequency === 'weekly' && formData.dayOfWeek !== undefined) {
        request.dayOfWeek = formData.dayOfWeek;
      }

      let response;

      if (scheduleId) {
        response = await schedulerAPI.updateSchedule(scheduleId, {
          name: formData.name,
          description: formData.description,
          frequency: formData.frequency,
          dayOfWeek: formData.dayOfWeek,
          cronExpression: cronPreview,
          generateImage: formData.generateImage,
          imageStyle: formData.imageStyle,
          isActive: true,
          templateId: templateId,
          keyword: keyword,
          generateSocial: formData.generateSocial,
        });
      } else {
        response = await schedulerAPI.createScheduleFromTime(request);
      }

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to save schedule');
      }
    } catch (error) {
      console.error('Error saving blog schedule:', error);
      setError(`Failed to save blog schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

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
        const result = await generateKeywordsFromTopic(aiTopic, portal);
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
        const result = await generateKeywordsFromInputs(manualTitle, manualKeyword, portal);
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

  // Get current UTC time
  const getCurrentUTCTime = () => {
    try {
      return getCurrentUTCTimeStringWithSeconds();
    } catch (error) {
      return 'Unable to get UTC time';
    }
  };

  return (
    <div className={`fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 p-4 ${isClosing ? 'animate-out fade-out' : 'animate-in fade-in'
      }`}>
      <div
        data-form="blog-schedule"
        className={`bg-white rounded-xl shadow-2xl w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-w-[95vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] mx-auto h-auto max-h-[95vh] overflow-hidden border border-gray-100 transition-all duration-300 ${isClosing ? 'animate-out slide-out-to-bottom zoom-out-95' : 'animate-in slide-in-from-bottom zoom-in-95'
          }`}
      >
        <div className="bg-gradient-to-r from-gray-800 to-black text-white px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center rounded-t-xl">
          <div className="flex flex-col">
            <h3 className="text-lg sm:text-xl font-semibold flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              {scheduleId
                ? `Edit ${formData.generateSocial ? 'Blog + Social' : 'Blog'} Schedule`
                : `Create ${formData.generateSocial ? 'Blog + Social' : 'Blog'} Schedule`
              }
            </h3>
            <div className="text-xs text-gray-300 mt-1 flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              Current UTC: {getCurrentUTCTime()}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-300 transition-colors p-1"
          >
            <X size={20} className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(95vh-80px)]">
          {step === 1 && (
            <form onSubmit={handleSubmit} className="flex flex-col">
              {/* UTC Notice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <svg className="h-4 w-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-blue-800">UTC Time Zone</span>
                </div>
                <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <Clock className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Current UTC: {currentUTCTime}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-3 sm:px-4 py-2 rounded-md text-sm flex items-center mb-3 sm:mb-4">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Schedule Name *
                </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-gray-100 text-gray-800 border-0 rounded-lg p-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800 transition ease-in-out duration-150 text-sm"
                  placeholder="Enter schedule name"
                disabled={fetchingData || isSubmitting}
                required
              />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Schedule Description (Optional)
                </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full bg-gray-100 text-gray-800 border-0 rounded-lg p-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800 transition ease-in-out duration-150 text-sm resize-none"
                  placeholder="Enter schedule description"
                  rows={3}
                disabled={fetchingData || isSubmitting}
              />
              </div>

              {/* Mode Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Content Generation Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <button
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
                    Templates
                  </button>
                  <button
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
                    AI Generate
                  </button>
                  <button
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
                    Manual
                  </button>
                </div>
              </div>

              {/* Templates Mode */}
              {aiMode === 'templates' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <FileText className="inline h-4 w-4 mr-2" />
                      Select Blog Template
                    </label>
              <select
                value={formData.templateId || ''}
                onChange={(e) => handleInputChange('templateId', e.target.value)}
                      className="w-full bg-gray-100 text-gray-800 border-0 rounded-lg p-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800 transition ease-in-out duration-150 text-sm"
                disabled={fetchingData || isSubmitting || blogTemplates.length === 0}
                required
              >
                {fetchingData && <option>Loading templates...</option>}
                {!fetchingData && blogTemplates.length === 0 && <option>No templates available</option>}
                {!fetchingData && blogTemplates.map((template) => {
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
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Target Keyword (Optional)
                    </label>
              <select
                value={formData.keyword || ''}
                onChange={(e) => handleInputChange('keyword', e.target.value)}
                      className="w-full bg-gray-100 text-gray-800 border-0 rounded-lg p-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800 transition ease-in-out duration-150 text-sm"
                disabled={fetchingData || isSubmitting || keywords.length === 0}
              >
                {fetchingData && <option>Loading keywords...</option>}
                {!fetchingData && keywords.length === 0 && <option>No keywords available</option>}
                {!fetchingData && keywords.map((keyword) => (
                  <option key={keyword.id} value={keyword.keyword}>
                    {keyword.keyword} {keyword.volume ? `(${keyword.volume})` : ''}
                  </option>
                ))}
              </select>
                  </div>
                </>
              )}

              {/* AI Generate Mode */}
              {aiMode === 'ai-generate' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Sparkles className="inline h-4 w-4 mr-2" />
                      Describe your topic
                    </label>
                    <textarea
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="e.g., 'How to improve productivity in remote work', 'Best practices for digital marketing', 'Career development tips'"
                      className="w-full bg-gray-100 text-gray-800 border-0 rounded-md p-2.5 sm:p-3 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-black transition ease-in-out duration-150 text-sm"
                      rows={3}
                      disabled={aiLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Describe what you want to write about and AI will generate keywords and title
                    </p>
                  </div>

                  {aiError && (
                    <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm">
                      {aiError}
                    </div>
                  )}

                  <button
                    onClick={handleAIGenerate}
                    disabled={aiLoading || !aiTopic.trim()}
                    className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-2.5 px-4 rounded-md transition ease-in-out duration-150 ${
                      aiLoading || !aiTopic.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-700 hover:to-blue-700'
                    }`}
                  >
                    {aiLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Generating...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Wand2 className="mr-2 h-4 w-4" />
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
                </div>
              )}

              {/* Manual Mode */}
              {aiMode === 'manual' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Edit3 className="inline h-4 w-4 mr-2" />
                      Blog Title
                    </label>
                    <input
                      type="text"
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      placeholder="Enter your blog title"
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
                      placeholder="Enter your blog outline (e.g., Introduction to career development, Key strategies for job search, Best practices for resume writing, Conclusion and next steps)"
                      className="w-full bg-gray-100 text-gray-800 border-0 rounded-lg p-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800 transition ease-in-out duration-150 text-sm resize-none"
                      rows={4}
                      disabled={aiLoading}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Provide a structured outline for your blog post. This helps create better organized content.
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
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => handleInputChange('frequency', e.target.value as ScheduleFrequency)}
                    className="w-full bg-gray-100 text-gray-800 border-0 rounded-lg p-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800 transition ease-in-out duration-150 text-sm"
                    disabled={fetchingData || isSubmitting}
                  >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                {formData.frequency === 'weekly' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Day of Week
                    </label>
                    <select
                      value={formData.dayOfWeek || ''}
                      onChange={(e) => handleInputChange('dayOfWeek', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full bg-gray-100 text-gray-800 border-0 rounded-lg p-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800 transition ease-in-out duration-150 text-sm"
                      disabled={fetchingData || isSubmitting}
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
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={handleDateChange}
                    className="w-full bg-gray-100 text-gray-800 border-0 rounded-lg p-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800 transition ease-in-out duration-150 text-sm"
                        disabled={fetchingData || isSubmitting}
                      />
                    </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Time (UTC)
                  </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={handleTimeChange}
                    className="w-full bg-gray-100 text-gray-800 border-0 rounded-lg p-4 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800 transition ease-in-out duration-150 text-sm"
                        disabled={fetchingData || isSubmitting}
                      />
                    </div>
                  </div>

                  {formData.date && formData.time && (
                <div className="text-xs mb-4">
                      {(() => {
                        const validation = validateDateTime(formData.date, formData.time, 'UTC');
                        if (validation.isValid) {
                          return (
                            <div className="text-green-600 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Valid schedule time
                            </div>
                          );
                        } else {
                          return (
                            <div className="text-red-600 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {validation.error}
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}

                  {nextRunTime && (
                <div className="space-y-2 bg-gray-50 p-3 rounded-md mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm gap-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="font-medium">Scheduled for:</span>
                        </div>
                        <div className="text-sm font-medium text-gray-600">
                          {formatDisplayDate(nextRunTime)}
                        </div>
                      </div>
                    </div>
                  )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                    Generate Featured Image
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Creates a custom image for your blog post
                    </p>
                  </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange('generateImage', !formData.generateImage)}
                      className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2
                      ${formData.generateImage ? 'bg-gray-800 shadow-lg' : 'bg-gray-200'}
                      `}
                      disabled={fetchingData || isSubmitting}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition-all duration-300 ease-out
                          ${formData.generateImage ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                    Include Social Media
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Generate social media posts alongside blog
                    </p>
                  </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange('generateSocial', !formData.generateSocial)}
                      className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2
                      ${formData.generateSocial ? 'bg-gray-800 shadow-lg' : 'bg-gray-200'}
                      `}
                      disabled={fetchingData || isSubmitting}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition-all duration-300 ease-out
                          ${formData.generateSocial ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                </div>
              </div>

              {formData.generateImage && (
                <div className="space-y-2 mb-2 sm:mb-3 md:mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Image Style
                  </label>
                  <select
                    value={formData.imageStyle}
                    onChange={(e) => handleInputChange('imageStyle', e.target.value as any)}
                    className="w-full bg-gray-100 text-gray-800 border-0 rounded-md p-2.5 sm:p-2 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-black transition ease-in-out duration-150 text-sm"
                    disabled={fetchingData || isSubmitting}
                  >
                    {imageStyleOptions.map((style) => (
                      <option key={style} value={style}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Social Platforms Preview */}
              {formData.generateSocial && (
                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 mb-2 sm:mb-3 md:mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Social Media Platforms ({socialPlatforms.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {socialPlatforms.map((platform) => (
                      <div key={platform.id} className="flex items-center gap-2 text-sm text-gray-800 bg-white/60 p-2 rounded">
                        <platform.icon className="h-4 w-4" />
                        <span>{platform.name}</span>
                      </div>
                    ))}
                  </div>
                  {!formData.generateImage && (
                    <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                      <Instagram className="h-3 w-3" />
                      Instagram excluded (requires image)
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={fetchingData || isSubmitting || (aiMode === 'ai-generate' && !aiGeneratedData) || (aiMode === 'manual' && (!manualTitle.trim() || !manualKeyword.trim()))}
                className={`w-full bg-gradient-to-r from-gray-800 to-black text-white font-semibold py-4 px-6 rounded-lg hover:from-gray-700 hover:to-gray-900 transition ease-in-out duration-150 shadow-lg ${fetchingData || isSubmitting || (aiMode === 'ai-generate' && !aiGeneratedData) || (aiMode === 'manual' && (!manualTitle.trim() || !manualKeyword.trim())) ? 'opacity-50 cursor-not-allowed' : ''
                  } ${isSubmitting ? 'animate-pulse' : ''
                  }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    {scheduleId ? 'Updating Schedule...' : 'Creating Schedule...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    {scheduleId
                      ? `Update ${formData.generateSocial ? 'Blog + Social' : 'Blog'} Schedule`
                      : aiMode === 'templates'
                        ? `Create ${formData.generateSocial ? 'Blog + Social' : 'Blog'} Schedule`
                        : aiMode === 'ai-generate'
                          ? `Create ${formData.generateSocial ? 'Blog + Social' : 'Blog'} Schedule (AI Generated)`
                          : `Create ${formData.generateSocial ? 'Blog + Social' : 'Blog'} Schedule (Manual Input)`
                    }
                  </span>
                )}
              </button>
              
              {/* Estimated time */}
              <p className="text-xs text-gray-500 text-center mt-3">
                Schedule will be created and ready to run at the specified time
              </p>
            </form>
          )}

          {step === 2 && (
            <div className="py-6 sm:py-8 flex flex-col items-center justify-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                {scheduleId ? 'Schedule Updated!' : 'Schedule Created!'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 text-center">
                {scheduleId
                  ? `Your ${formData.generateSocial ? 'blog and social media' : 'blog'} schedule has been successfully updated.`
                  : `Your ${formData.generateSocial ? 'blog and social media' : 'blog'} schedule has been successfully created and will run according to the specified schedule.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
