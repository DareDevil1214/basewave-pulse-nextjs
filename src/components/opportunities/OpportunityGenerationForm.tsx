'use client';

import { useState, useEffect } from 'react';
import { Bot, X, Loader2, Calendar, Clock, Share, FileText, Instagram, Facebook, Twitter, Linkedin, MessageCircle, Sparkles, Edit3, Wand2, Hash, RefreshCw, Target, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Article } from '@/lib/opportunities-firebase';
import { fetchKeywords, generateBlogPost, Keyword } from '@/lib/blog-firebase';
import { 
  generateKeywordsFromTopic, 
  generateKeywordsFromInputs, 
  convertAIDataToFormFormat,
  validateTopic,
  validateManualInputs,
  AIKeywordData 
} from '@/lib/ai-keyword-generator';
import { validateDateTime, getCurrentUTCTimeString, getCurrentUTCTimeStringWithSeconds } from '@/utils/timeUtils';

interface OpportunityGenerationFormProps {
  article: Article;
  portalId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresImage: boolean;
  account: string;
}

type GenerationMode = 'blog' | 'social' | 'combined';
type ScheduleFrequency = 'once' | 'daily' | 'weekly';

export function OpportunityGenerationForm({ article, portalId, onClose, onSuccess }: OpportunityGenerationFormProps) {
  const [generationMode, setGenerationMode] = useState<GenerationMode>('blog');
  const [generateImage, setGenerateImage] = useState<boolean>(true);
  const [scheduleForLater, setScheduleForLater] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  
  // Scheduling states
  const [scheduleData, setScheduleData] = useState({
    name: `${article.title} - Generated Content`,
    description: `Automated content generation for: ${article.title}`,
    date: new Date().toISOString().split('T')[0],
    time: getCurrentUTCTimeString(),
    frequency: 'once' as ScheduleFrequency,
    dayOfWeek: undefined as number | undefined,
    timezone: 'UTC'
  });
  
  // Enhanced loading animation state
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [apiCompleted, setApiCompleted] = useState(false);

  // Map portal to social media accounts - using same logic as other forms
  const getPortalAccount = (portalId: string): string => {
    const portalMapping: { [key: string]: string } = {
      'elite-equilibrium': 'eliteequilibrium',
      'eliteequilibrium': 'eliteequilibrium',
      'eternal-elite': 'eternalelite',
      'eternalelite': 'eternalelite',
      'new-people': 'newpeople',
      'newpeople': 'newpeople',
      'cv-maker': 'cvmaker',
      'cvmaker': 'cvmaker',
      'neo-vibe-mag': 'neovibemag',
      'neovibemag': 'neovibemag'
    };
    return portalMapping[portalId.toLowerCase()] || portalId;
  };

  // Map frontend portal IDs to backend portal names
  const getBackendPortalName = (portalId: string): string => {
    const backendPortalMapping: { [key: string]: string } = {
      'new-people': 'newpeople',
      'newpeople': 'newpeople',
      'cv-maker': 'cvmaker',
      'cvmaker': 'cvmaker',
      'all-portals': 'newpeople' // Default to newpeople for all-portals
    };
    return backendPortalMapping[portalId.toLowerCase()] || 'newpeople';
  };

  // Define social media platforms with conditional logic
  const getSocialPlatforms = (hasImage: boolean): SocialPlatform[] => {
    const account = getPortalAccount(portalId);
    
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
    setSocialPlatforms(getSocialPlatforms(generateImage));
  }, [generateImage, portalId]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Helper function to check if schedule is valid
  const isScheduleValid = (): boolean => {
    if (!scheduleForLater) return true;
    if (!scheduleData.date || !scheduleData.time) return false;
    const validation = validateDateTime(scheduleData.date, scheduleData.time, 'UTC');
    return validation.isValid;
  };

  // Enhanced loading animation effect
  useEffect(() => {
    if (loading && step === 2) {
      const baseStages = [
        { message: "Initializing content generation...", duration: 2000, progress: 8 },
        { message: "Processing opportunity data...", duration: 3000, progress: 18 },
        { message: "Analyzing keywords and content...", duration: 4000, progress: 35 },
        { message: "Generating content structure...", duration: 5000, progress: 55 }
      ];
      
      const blogStages = (generationMode === 'blog' || generationMode === 'combined') ? [
        { message: "Creating blog content...", duration: 6000, progress: 70 }
      ] : [];
      
      const imageStages = generateImage ? [
        { message: "Generating featured image...", duration: 8000, progress: 82 }
      ] : [];
      
      const socialStages = (generationMode === 'social' || generationMode === 'combined') ? [
        { message: "Creating social media content...", duration: 7000, progress: 90 },
        { message: "Adapting content for platforms...", duration: 3000, progress: 95 }
      ] : [];

      const finalStages = [
        { message: "Optimizing and saving content...", duration: 2000, progress: 100 }
      ];
      
      const stages = [...baseStages, ...blogStages, ...imageStages, ...socialStages, ...finalStages];

      let stageIndex = 0;
      setCurrentStage(0);
      setLoadingProgress(0);
      setLoadingMessage(stages[0].message);

      const runStage = () => {
        if (stageIndex >= stages.length) return;
        
        const stage = stages[stageIndex];
        setLoadingMessage(stage.message);
        
        const startProgress = stageIndex > 0 ? stages[stageIndex - 1].progress : 0;
        const endProgress = stage.progress;
        const progressDuration = stage.duration;
        const progressSteps = 30;
        const progressIncrement = (endProgress - startProgress) / progressSteps;
        
        let currentProgress = startProgress;
        let stepCount = 0;
        
        const progressInterval = setInterval(() => {
          if (stepCount >= progressSteps) {
            clearInterval(progressInterval);
            setLoadingProgress(endProgress);
            stageIndex++;
            setCurrentStage(stageIndex);
            
            setTimeout(() => {
              if (stageIndex < stages.length && loading && step === 2) {
                runStage();
              }
            }, 300);
            return;
          }
          
          let actualIncrement = progressIncrement;
          if (currentProgress > 80 && !apiCompleted) {
            actualIncrement = progressIncrement * 0.3;
          } else if (currentProgress > 90 && !apiCompleted) {
            actualIncrement = progressIncrement * 0.1;
          }
          
          currentProgress += actualIncrement;
          setLoadingProgress(Math.min(currentProgress, endProgress));
          stepCount++;
        }, progressDuration / progressSteps);
      };

      runStage();
    } else {
      setLoadingProgress(0);
      setCurrentStage(0);
      setLoadingMessage('');
      setApiCompleted(false);
    }
  }, [loading, step, generationMode, generateImage]);

  const generateBlogContent = async () => {
    try {
      // Use the opportunity data directly with the AI-generated-content template ID
      // This tells the backend to use the provided data instead of looking up a template
      const blogContentTemplate = {
        id: `opportunity-${Date.now()}`,
        title: article.title,
        content: article.description,
        author: 'NewPeople',
        category: 'Blog',
        tags: [...(article.primary_keywords || []), ...(article.secondary_keywords || [])],
        createdAt: new Date().toISOString(),
        articleId: `opp-${Date.now()}`,
        templateId: 'ai-generated-content', // Use existing AI template ID
        // Include opportunity data for backend processing
        description: article.description,
        primary_keywords: article.primary_keywords || [],
        secondary_keywords: article.secondary_keywords || [],
        long_tail_keywords: article.long_tail_keywords || [],
        outline: article.outline || `Introduction to ${article.title}, Key concepts, Implementation strategies, Best practices, Conclusion`,
        visual: article.visual || 'Opportunity Generated',
        website: article.website
      };

      // Use primary keywords for generation
      const keywordToUse = article.primary_keywords?.slice(0, 1) || [article.title];
      
      // Generate the blog post using the backend API
      const backendPortal = getBackendPortalName(portalId);
      // Map to valid portal types for generateBlogPost function
      const validPortalMapping: { [key: string]: 'eliteequilibrium' | 'neovibemag' | 'eternalelite' } = {
        'newpeople': 'eliteequilibrium', // Default mapping for newpeople
        'cvmaker': 'eliteequilibrium',   // Default mapping for cvmaker
        'eliteequilibrium': 'eliteequilibrium',
        'neovibemag': 'neovibemag',
        'eternalelite': 'eternalelite'
      };
      const validPortal = validPortalMapping[backendPortal] || 'eliteequilibrium';
      
      await generateBlogPost(
        blogContentTemplate,
        keywordToUse,
        validPortal,
        generateImage
      );
      
      console.log('✅ Blog post generated from opportunity');
    } catch (error) {
      console.error('Error generating blog content:', error);
      throw error;
    }
  };

  const generateSocialContent = async () => {
    try {
      console.log('🚀 Generating social media content for platforms:', socialPlatforms.map(p => p.name));

      // Generate content for each platform
      const socialPromises = socialPlatforms.map(async (platform) => {
        const platformMapping: { [key: string]: string } = {
          'tiktok': 'TikTok',
          'instagram': 'Instagram',
          'linkedin': 'LinkedIn',
          'youtube': 'YouTube',
          'facebook': 'Facebook',
          'twitter': 'X',
          'x': 'X',
          'threads': 'Threads',
          'pinterest': 'Pinterest'
        };

        const mappedPlatform = platformMapping[platform.id.toLowerCase()] || platform.name;

        const payload = {
          platforms: [mappedPlatform],
          generateImage: platform.requiresImage && generateImage,
          maxPosts: 1,
          targetAudience: 'General audience',
          tone: 'professional',
          account: platform.account,
          articleTitle: article.title,
          templateId: 'ai-generated-content', // Use existing template ID
          // Include opportunity data for backend processing
          title: article.title,
          description: article.description,
          primary_keywords: article.primary_keywords || [],
          secondary_keywords: article.secondary_keywords || [],
          long_tail_keywords: article.long_tail_keywords || [],
          outline: article.outline || `Introduction, Key points, Call to action`,
          visual: article.visual || 'Opportunity Generated',
          website: article.website
        };

        console.log(`🎯 Generating ${platform.name} content with payload:`, payload);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/socialagent/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Failed to generate ${platform.name} content:`, errorData);
          return null;
        }

        const result = await response.json();
        console.log(`✅ ${platform.name} content generated:`, result);
        return { platform: platform.name, result };
      });

      const socialResults = await Promise.allSettled(socialPromises);
      console.log('📱 All social media generation results:', socialResults);

    } catch (error) {
      console.error('Error generating social media content:', error);
      throw error;
    }
  };

  const createSchedule = async () => {
    try {
      // Validate date and time
      const validation = validateDateTime(scheduleData.date, scheduleData.time, 'UTC');
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid schedule time');
      }

      // Create schedule based on generation mode
      if (generationMode === 'blog') {
        // Create blog schedule
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/blog-scheduler/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: scheduleData.name,
            description: scheduleData.description,
            utcTime: `${scheduleData.date}T${scheduleData.time}:00.000Z`,
            frequency: scheduleData.frequency,
            dayOfWeek: scheduleData.dayOfWeek,
            portal: getBackendPortalName(portalId),
            generateImage: generateImage,
            imageStyle: 'professional',
            isActive: true,
            templateId: 'ai-generated-content',
            keyword: article.primary_keywords?.[0] || article.title,
            generateSocial: false,
            // Include opportunity data for backend processing
            title: article.title,
            primary_keywords: article.primary_keywords || [],
            secondary_keywords: article.secondary_keywords || [],
            long_tail_keywords: article.long_tail_keywords || [],
            outline: article.outline || `Introduction to ${article.title}, Key concepts, Implementation strategies, Best practices, Conclusion`,
            visual: article.visual || 'Opportunity Generated',
            website: article.website
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create blog schedule');
        }
      } else if (generationMode === 'social') {
        // Create social media schedules for each platform
        for (const platform of socialPlatforms) {
          const mappedPlatform = platform.id === 'x' ? 'X' : platform.name;
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/socialagent/scheduler/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: `${scheduleData.name} - ${platform.name}`,
              description: `${scheduleData.description} for ${platform.name}`,
              cronExpression: convertToCronExpression(new Date(`${scheduleData.date}T${scheduleData.time}:00.000Z`)),
              timezone: 'UTC',
              frequency: scheduleData.frequency,
              dayOfWeek: scheduleData.dayOfWeek,
              account: platform.account,
              generateImage: platform.requiresImage && generateImage,
              imageStyle: 'professional',
              maxPosts: 1,
              platforms: [mappedPlatform],
              contentType: generateImage ? 'image' : 'text',
              targetAudience: 'General audience',
              tone: 'professional',
              autoPublish: true,
              isActive: true,
              templateId: 'ai-generated-content',
              keyword: article.primary_keywords?.[0] || article.title,
              articleTitle: article.title,
              // Include opportunity data for backend processing
              title: article.title,
              primary_keywords: article.primary_keywords || [],
              secondary_keywords: article.secondary_keywords || [],
              long_tail_keywords: article.long_tail_keywords || [],
              outline: article.outline || `Introduction, Key points, Call to action`,
              visual: article.visual || 'Opportunity Generated',
              website: article.website
            })
          });

          if (!response.ok) {
            console.error(`Failed to create ${platform.name} schedule`);
          }
        }
      } else if (generationMode === 'combined') {
        // Create both blog and social schedules
        // Blog schedule first
        const blogResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/blog-scheduler/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `${scheduleData.name} - Blog`,
            description: `${scheduleData.description} (Blog)`,
            utcTime: `${scheduleData.date}T${scheduleData.time}:00.000Z`,
            frequency: scheduleData.frequency,
            dayOfWeek: scheduleData.dayOfWeek,
            portal: getBackendPortalName(portalId),
            generateImage: generateImage,
            imageStyle: 'professional',
            isActive: true,
            templateId: 'ai-generated-content',
            keyword: article.primary_keywords?.[0] || article.title,
            generateSocial: true, // Enable social generation with blog
            // Include opportunity data for backend processing
            title: article.title,
            primary_keywords: article.primary_keywords || [],
            secondary_keywords: article.secondary_keywords || [],
            long_tail_keywords: article.long_tail_keywords || [],
            outline: article.outline || `Introduction to ${article.title}, Key concepts, Implementation strategies, Best practices, Conclusion`,
            visual: article.visual || 'Opportunity Generated',
            website: article.website
          })
        });

        if (!blogResponse.ok) {
          throw new Error('Failed to create combined schedule');
        }
      }

      console.log('✅ Schedule(s) created successfully');
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  };

  // Helper function to convert frequency and start time to cron expression
  const convertToCronExpression = (startDate: Date): string => {
    const minute = startDate.getUTCMinutes();
    const hour = startDate.getUTCHours();
    const day = startDate.getUTCDate();
    const month = startDate.getUTCMonth() + 1;
    
    switch (scheduleData.frequency) {
      case 'once':
        return `${minute} ${hour} ${day} ${month} *`;
      case 'daily':
        return `${minute} ${hour} * * *`;
      case 'weekly':
        const dayOfWeek = scheduleData.dayOfWeek !== undefined ? scheduleData.dayOfWeek : startDate.getUTCDay();
        return `${minute} ${hour} * * ${dayOfWeek}`;
      default:
        return `${minute} ${hour} ${day} ${month} *`;
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setStep(2);
      setApiCompleted(false);
      setError(null);

      if (scheduleForLater) {
        await createSchedule();
        setLoadingMessage('Schedule created successfully!');
      } else {
        // Generate content immediately
        if (generationMode === 'blog') {
          await generateBlogContent();
        } else if (generationMode === 'social') {
          await generateSocialContent();
        } else if (generationMode === 'combined') {
          await generateBlogContent();
          await generateSocialContent();
        }
        setLoadingMessage('Content generated successfully!');
      }
      
      setApiCompleted(true);
      setLoadingProgress(100);
      
      setTimeout(() => {
        setStep(3);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }, 1000);
      
    } catch (error) {
      console.error('Error in generation process:', error);
      setError(`Failed to ${scheduleForLater ? 'create schedule' : 'generate content'}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Full screen blur overlay */}
      <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40"></div>
      
      {/* Modal container */}
      <div className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 p-4 ${
        isClosing ? 'animate-out fade-out' : 'animate-in fade-in'
      }`}>
        <div className={`bg-white rounded-xl shadow-2xl w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-w-[95vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] mx-auto h-auto max-h-[95vh] overflow-hidden border border-gray-100 transition-all duration-300 ${
          isClosing ? 'animate-out slide-out-to-bottom zoom-out-95' : 'animate-in slide-in-from-bottom zoom-in-95'
        }`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-black text-white px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold">Generate Content</h3>
              <p className="text-white/80 text-xs">From Opportunity: {article.title.substring(0, 50)}{article.title.length > 50 ? '...' : ''}</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="text-white hover:text-gray-300 transition-colors p-1"
          >
            <X size={20} className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-h-[calc(95vh-80px)] overflow-y-auto">
          {step === 1 && (
            <div className="flex flex-col space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 px-3 sm:px-4 py-2 rounded-md text-sm mb-3 sm:mb-4">
                  {error}
                </div>
              )}

              {/* Opportunity Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-2">{article.title}</h4>
                    <p className="text-blue-700 text-sm mb-3">{article.description}</p>
                    {article.primary_keywords && article.primary_keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {article.primary_keywords.slice(0, 3).map((keyword, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            {keyword}
                          </span>
                        ))}
                        {article.primary_keywords.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                            +{article.primary_keywords.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Generation Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Content Generation Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'blog', label: 'Blog Only', icon: FileText, description: 'Generate blog post' },
                    { id: 'social', label: 'Social Only', icon: Share, description: 'Generate social media posts' },
                    { id: 'combined', label: 'Blog + Social', icon: Bot, description: 'Generate both blog and social' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setGenerationMode(mode.id as GenerationMode)}
                      className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                        generationMode === mode.id
                          ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <mode.icon className="h-5 w-5" />
                        <span className="font-medium">{mode.label}</span>
                      </div>
                      <p className={`text-xs ${generationMode === mode.id ? 'text-white/80' : 'text-gray-500'}`}>
                        {mode.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Image Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Generate Featured Image
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Creates images for your content
                  </p>
                </div>
                <button
                  onClick={() => setGenerateImage(!generateImage)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2
                    ${generateImage ? 'bg-gray-800 shadow-lg' : 'bg-gray-200'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition-all duration-300 ease-out
                      ${generateImage ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Social Platforms Preview */}
              {(generationMode === 'social' || generationMode === 'combined') && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Social Media Platforms ({socialPlatforms.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {socialPlatforms.map((platform) => (
                      <div key={platform.id} className="flex items-center gap-2 text-sm text-gray-800 bg-white/60 p-3 rounded-lg">
                        <platform.icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{platform.name}</span>
                        <span className="sm:hidden">{platform.name.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                  {!generateImage && (
                    <p className="text-xs text-orange-600 mt-3 flex items-center gap-1">
                      <Instagram className="h-3 w-3" />
                      Instagram excluded (requires image)
                    </p>
                  )}
                </div>
              )}

              {/* Schedule for Later Toggle */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <span className="text-sm font-medium text-blue-900">
                    Schedule for Later
                  </span>
                  <p className="text-xs text-blue-700 mt-1">
                    Create a schedule instead of generating now
                  </p>
                </div>
                <button
                  onClick={() => setScheduleForLater(!scheduleForLater)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                    ${scheduleForLater ? 'bg-blue-600 shadow-lg' : 'bg-gray-200'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition-all duration-300 ease-out
                      ${scheduleForLater ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Scheduling Fields */}
              {scheduleForLater && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Schedule Configuration</span>
                  </div>

                  {/* UTC Notice */}
                  <div className="flex items-center gap-2 p-2 bg-blue-100 rounded-md">
                    <Clock className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium text-blue-800">
                      Current UTC: {getCurrentUTCTimeStringWithSeconds()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        Schedule Name
                      </label>
                      <input
                        type="text"
                        value={scheduleData.name}
                        onChange={(e) => setScheduleData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        placeholder="Enter schedule name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        Frequency
                      </label>
                      <select
                        value={scheduleData.frequency}
                        onChange={(e) => setScheduleData(prev => ({ ...prev, frequency: e.target.value as ScheduleFrequency }))}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                      >
                        <option value="once">Once</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>

                    {scheduleData.frequency === 'weekly' && (
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-2">
                          Day of Week
                        </label>
                        <select
                          value={scheduleData.dayOfWeek || ''}
                          onChange={(e) => setScheduleData(prev => ({ ...prev, dayOfWeek: e.target.value ? parseInt(e.target.value) : undefined }))}
                          className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
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

                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={scheduleData.date}
                        onChange={(e) => setScheduleData(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        Time (UTC)
                      </label>
                      <input
                        type="time"
                        value={scheduleData.time}
                        onChange={(e) => setScheduleData(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={scheduleData.description}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white resize-none"
                      rows={3}
                      placeholder="Enter schedule description"
                    />
                  </div>

                  {/* Schedule validation */}
                  {scheduleData.date && scheduleData.time && (
                    <div className="text-xs">
                      {(() => {
                        const validation = validateDateTime(scheduleData.date, scheduleData.time, 'UTC');
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
                </motion.div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !isScheduleValid()}
                className={`w-full bg-gradient-to-r from-gray-800 to-black text-white font-semibold py-4 px-6 rounded-lg hover:from-gray-700 hover:to-gray-900 transition ease-in-out duration-150 shadow-lg flex items-center justify-center gap-2 ${
                  loading || !isScheduleValid() ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  loading ? 'animate-pulse' : ''
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    {scheduleForLater ? 'Creating Schedule...' : 'Generating Content...'}
                  </>
                ) : (
                  <>
                    <Bot className="h-5 w-5" />
                    {scheduleForLater ? `Create ${generationMode === 'blog' ? 'Blog' : generationMode === 'social' ? 'Social' : 'Combined'} Schedule` : `Generate ${generationMode === 'blog' ? 'Blog' : generationMode === 'social' ? 'Social' : 'Blog + Social'}`}
                  </>
                )}
              </button>

              {/* Estimated time */}
              <p className="text-xs text-gray-500 text-center">
                {scheduleForLater 
                  ? 'Schedule will be created and ready to run at the specified time' 
                  : `Estimated time: ${generationMode === 'combined' ? '60-90 seconds' : generationMode === 'blog' ? '30-45 seconds' : '15-30 seconds'}`
                }
              </p>
            </div>
          )}
          
          {step === 2 && (
            <div className="py-6 sm:py-8 flex flex-col items-center justify-center">
              {/* Enhanced spinner */}
              <div className="relative mb-4 sm:mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center">
                    <Target className="h-4 w-4 text-black" />
                  </div>
                </div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-black rounded-full animate-spin"></div>
                <div className="absolute -inset-1 w-18 h-18 border-2 border-gray-400 rounded-full animate-spin-slow"></div>
              </div>
              
              {/* Content */}
              <div className="space-y-2 sm:space-y-3 text-center">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {scheduleForLater ? 'Creating Schedule' : `Generating ${generationMode === 'blog' ? 'Blog' : generationMode === 'social' ? 'Social' : 'Combined'} Content`}
                </h3>
                <div className="min-h-[40px] sm:min-h-[50px] flex flex-col justify-center">
                  <p className="text-gray-600 text-xs sm:text-sm">
                    {scheduleForLater ? 'Setting up your automated content schedule...' : 'Creating compelling content from your opportunity...'}
                  </p>
                  {loadingMessage && (
                    <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1 animate-slide-up">
                      {loadingMessage}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full space-y-2 mt-4 sm:mt-6">
                <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500">
                  <span>Progress</span>
                  <span className="font-mono font-semibold text-gray-700">
                    {Math.round(loadingProgress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-black to-gray-600 h-2 rounded-full relative transition-all duration-300 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30"></div>
                    <div className="absolute right-0 top-0 w-1 h-full bg-white/50 animate-shine-subtle"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="py-6 sm:py-8 flex flex-col items-center justify-center">
              <div className="w-16 h-16 mb-4 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {scheduleForLater ? 'Schedule Created!' : 'Content Generated!'}
              </h3>
              <p className="text-sm text-gray-500 text-center">
                {scheduleForLater 
                  ? `Your ${generationMode} schedule has been created and will run automatically at the specified time.`
                  : `Your ${generationMode} content has been successfully generated and is now available.`
                }
              </p>
              {generationMode === 'social' && !scheduleForLater && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 text-center">
                    Check the Social Agent section to view and manage your generated social media posts
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
