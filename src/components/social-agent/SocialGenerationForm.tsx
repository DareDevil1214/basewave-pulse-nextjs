'use client';

import { useState, useEffect } from 'react';
import { Bot, X, Loader2, Image as ImageIcon, Hash, Calendar, FileText, Sparkles, Edit3, Wand2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Removed direct Firestore imports - now using backend API only
import { getCurrentBranding } from '@/lib/branding';
import { 
  generateKeywordsFromTopic, 
  generateKeywordsFromInputs, 
  convertAIDataToFormFormat,
  validateTopic,
  validateManualInputs,
  AIKeywordData 
} from '@/lib/ai-keyword-generator';

interface SocialGenerationFormProps {
  platform: string;
  account: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface GenerationOptions {
  contentType: 'text' | 'image';
  selectedBlogTemplate: string;
  includeHashtags: boolean;
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

export function SocialGenerationForm({ platform, account, onClose, onSuccess }: SocialGenerationFormProps) {
  const [blogTemplates, setBlogTemplates] = useState<CompBlogArticle[]>([]);
  const [options, setOptions] = useState<GenerationOptions>({
    contentType: platform.toLowerCase() === 'instagram' ? 'image' : 'text',
    selectedBlogTemplate: '',
    includeHashtags: true
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [templatesLoading, setTemplatesLoading] = useState(true);
  
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

  // Fetch blog templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setTemplatesLoading(true);
        // Fetch blog content from compBlogContent collection
        const blogContentData = await fetchCompBlogContent();

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
          setOptions(prev => ({ ...prev, selectedBlogTemplate: templateId })); // Use proper document ID
        }
      } catch (error) {
        console.error('Error fetching blog templates:', error);
        setError('Failed to load blog templates');
      } finally {
        setTemplatesLoading(false);
      }
    };

    fetchTemplates();
  }, [account]);

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

  // Enhanced loading animation effect
  useEffect(() => {
    if (loading && step === 2) {
      const stages = [
        { message: "Initializing content generation...", duration: 800, progress: 10 },
        { message: "Analyzing platform requirements...", duration: 1000, progress: 25 },
        { message: "Processing topic and tone...", duration: 1200, progress: 40 },
        { message: "Generating engaging content...", duration: 1500, progress: 65 },
        { message: "Optimizing for platform...", duration: 1000, progress: 80 },
        { message: "Adding hashtags and formatting...", duration: 800, progress: 95 },
        { message: "Finalizing post...", duration: 500, progress: 100 }
      ];

      let stageIndex = 0;
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
            
            setTimeout(() => {
              if (stageIndex < stages.length && loading && step === 2) {
                runStage();
              }
            }, 300);
            return;
          }
          
          currentProgress += progressIncrement;
          setLoadingProgress(Math.min(currentProgress, endProgress));
          stepCount++;
        }, progressDuration / progressSteps);
      };

      runStage();
    } else {
      setLoadingProgress(0);
      setLoadingMessage('');
    }
  }, [loading, step]);

  // Map portal/account names to the correct format
  const getPortalAccount = (account: string): string => {
    const portalMapping: { [key: string]: string } = {
      'elite-equilibrium': 'eliteequilibrium',
      'eternal-elite': 'eternalelite',
      'neo-vibe-mag': 'neovibemag',
      'neovibemag': 'neovibemag'
    };
    return portalMapping[account.toLowerCase()] || account;
  };

  const handleGenerate = async () => {
    try {
      let topicToUse;
      let templateId;

      // Handle different modes
      if (aiMode === 'templates') {
        // Validate required fields for template mode
        if (!options.selectedBlogTemplate) {
          setError('Please select a blog template for your content');
          return;
        }

        // Get the topic from the selected template
        const selectedTemplate = blogTemplates.find(t => {
          const templateId = t.articleId
            ? `${t.documentId}_${t.articleId}`
            : t.documentId || t.title;
          return templateId === options.selectedBlogTemplate;
        });
        if (!selectedTemplate) {
          throw new Error('Selected blog template not found');
        }

        topicToUse = selectedTemplate.title;
        templateId = options.selectedBlogTemplate;
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

      setLoading(true);
      setStep(2);
      setError(null);

      // Map frontend platform names to backend expected format
      const platformMapping: { [key: string]: string } = {
        'tiktok': 'TikTok',
        'instagram': 'Instagram',
        'linkedin': 'LinkedIn',
        'youtube': 'YouTube',
        'facebook': 'Facebook',
        'twitter': 'X',
        'x': 'X',
        'threads': 'Threads', // Fixed: Threads should map to Threads, not X
        'pinterest': 'Pinterest'
      };

      const mappedPlatform = platformMapping[platform.toLowerCase()] || platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();

      // Use the auto-generation endpoint that saves to socialAgent_generatedPosts collection
      const website = account === 'basewave' ? getCurrentBranding().website : 'https://cv-maker.com';
      const payload = {
        platforms: [mappedPlatform], // Use mapped platform name as expected by backend
        generateImage: options.contentType === 'image',
        maxPosts: 1,
        targetAudience: 'General audience', // This will be handled by the backend
        tone: 'professional', // This will be handled by the backend
        account: account,
        // Use the topic as a specific article title to generate from
        articleTitle: topicToUse,
        // Include templateId for backend processing
        templateId: templateId,
        // Include AI-generated content data for backend processing
        ...(aiMode === 'ai-generate' || aiMode === 'manual' ? {
          title: aiMode === 'manual' ? manualTitle : aiGeneratedData?.title,
          description: aiMode === 'manual' ? `Social media content about ${manualKeyword}` : aiGeneratedData?.description,
          primary_keywords: aiMode === 'manual' ? manualKeyword.split(',').map(k => k.trim()).filter(k => k.length > 0) : aiGeneratedData?.primary_keywords,
          secondary_keywords: aiGeneratedData?.secondary_keywords || [],
          long_tail_keywords: aiGeneratedData?.long_tail_keywords || [],
          outline: manualOutline.trim() || (aiGeneratedData?.outline || `Introduction, Key points, Call to action`),
          visual: 'AI Generated',
          website: website
        } : {
          // For template mode, include documentID for proper article selection
          documentID: templateId && templateId !== 'ai-generated-content' ? 
            (templateId.includes('_') ? templateId.split('_')[0] : templateId) : undefined
        })
      };



      // Use the auto-generation endpoint that saves to socialAgent_generatedPosts
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/socialagent/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to generate content: ${response.statusText}`);
      }

      const result = await response.json();

      // Move to success step
      setStep(3);

      // Notify parent of success after showing success animation
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (error) {
      console.error('Error generating social media content:', error);
      setError(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
      setStep(1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm mb-4">
                {error}
              </div>
            )}

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
                  <span className="hidden sm:inline">Templates</span>
                  <span className="sm:hidden">Templates</span>
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
                  <span className="hidden sm:inline">AI Generate</span>
                  <span className="sm:hidden">AI Generate</span>
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
                  <span className="hidden sm:inline">Manual</span>
                  <span className="sm:hidden">Manual</span>
                </button>
              </div>
            </div>

            {/* Templates Mode */}
            {aiMode === 'templates' && (
              <>
                {/* Content Type Selection - Hidden for Instagram */}
                {platform.toLowerCase() !== 'instagram' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Content Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['text', 'image'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setOptions(prev => ({ ...prev, contentType: type as any }))}
                          className={`p-3 rounded-lg border transition-all ${
                            options.contentType === type
                              ? 'bg-black/10 border-black text-black'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            {type === 'text' && <Hash className="h-5 w-5" />}
                            {type === 'image' && <ImageIcon className="h-5 w-5" />}
                            <span className="text-sm capitalize">{type}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Instagram notice */}
                {platform.toLowerCase() === 'instagram' && (
                  <div className="mb-4 p-3 bg-black/10 border border-black/20 rounded-lg">
                    <div className="flex items-center gap-2 text-black">
                      <ImageIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">Instagram posts will include images automatically</span>
                    </div>
                  </div>
                )}

                {/* Blog Template Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="inline h-4 w-4 mr-2" />
                    Select Blog Template
                  </label>
                  <select
                    value={options.selectedBlogTemplate}
                    onChange={(e) => setOptions(prev => ({ ...prev, selectedBlogTemplate: e.target.value }))}
                    className="w-full bg-gray-100 text-gray-800 border-0 rounded-lg p-3 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800 transition ease-in-out duration-150 text-sm"
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

                {/* Options */}
                <div className="space-y-3 mb-4">
                  <label className="flex items-center gap-3 text-gray-700">
                    <input
                      type="checkbox"
                      checked={options.includeHashtags}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeHashtags: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 bg-gray-100 text-black focus:ring-black"
                    />
                    <span className="text-sm">Include relevant hashtags</span>
                  </label>
                </div>
              </>
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
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Content Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['text', 'image'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setOptions(prev => ({ ...prev, contentType: type as any }))}
                          className={`p-3 rounded-lg border transition-all ${
                            options.contentType === type
                              ? 'bg-black/10 border-black text-black'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            {type === 'text' && <Hash className="h-5 w-5" />}
                            {type === 'image' && <ImageIcon className="h-5 w-5" />}
                            <span className="text-sm capitalize">{type}</span>
                          </div>
                        </button>
                      ))}
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
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Content Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['text', 'image'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setOptions(prev => ({ ...prev, contentType: type as any }))}
                          className={`p-3 rounded-lg border transition-all ${
                            options.contentType === type
                              ? 'bg-black/10 border-black text-black'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            {type === 'text' && <Hash className="h-5 w-5" />}
                            {type === 'image' && <ImageIcon className="h-5 w-5" />}
                            <span className="text-sm capitalize">{type}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || (aiMode === 'templates' && !options.selectedBlogTemplate) || (aiMode === 'ai-generate' && !aiGeneratedData) || (aiMode === 'manual' && (!manualTitle.trim() || !manualKeyword.trim()))}
              className={`w-full bg-black text-white font-semibold py-3 px-4 rounded-md mt-4 hover:bg-gray-800 transition ease-in-out duration-150 ${
                loading || (aiMode === 'templates' && !options.selectedBlogTemplate) || (aiMode === 'ai-generate' && !aiGeneratedData) || (aiMode === 'manual' && (!manualTitle.trim() || !manualKeyword.trim())) ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                loading ? 'animate-pulse' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Generating Content...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Bot className="mr-2 h-4 w-4" />
                  {aiMode === 'templates' 
                    ? 'Generate Content' 
                    : aiMode === 'ai-generate' 
                      ? 'Generate Content from AI'
                      : 'Generate Content from Manual Input'
                  }
                </span>
              )}
            </button>
          </div>
        );

      case 2:
        return (
          <div className="py-8 flex flex-col items-center justify-center">
            {/* Clean spinner with black theme */}
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 bg-white rounded-full shadow-sm"></div>
              </div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-black rounded-full animate-spin"></div>
              <div className="absolute -inset-1 w-18 h-18 border-2 border-gray-400 rounded-full animate-spin-slow"></div>
            </div>
            
            {/* Clean content */}
            <div className="space-y-3 text-center">
              <h3 className="text-xl font-semibold text-gray-800">
                Generating Content
              </h3>
              <div className="min-h-[50px] flex flex-col justify-center">
                <p className="text-gray-600 text-sm">
                  Creating engaging content for your {getPlatformDisplayName(platform)} account...
                </p>
                {loadingMessage && (
                  <p className="text-sm text-gray-600 font-medium mt-1 animate-slide-up">
                    {loadingMessage}
                  </p>
                )}
              </div>
            </div>
            
            {/* Clean progress bar */}
            <div className="w-full space-y-2 mt-6">
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Progress</span>
                <span className="font-mono font-semibold text-gray-700">
                  {Math.round(loadingProgress)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-black h-2 rounded-full relative transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30"></div>
                  <div className="absolute right-0 top-0 w-1 h-full bg-white/50 animate-shine-subtle"></div>
                </div>
              </div>
              
              {/* Clean stage indicators */}
              <div className="flex justify-between items-center pt-2">
                {[1, 2, 3, 4, 5, 6, 7].map((stage, index) => (
                  <div 
                    key={stage}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      loadingProgress > (index * 14.28) 
                        ? 'bg-black scale-110' 
                        : loadingProgress > ((index - 1) * 14.28)
                        ? 'bg-gray-600 animate-pulse scale-125'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Clean estimated time */}
            <p className="text-xs text-gray-400 mt-4">
              Estimated completion: 6-10 seconds
            </p>
          </div>
        );

      case 3:
        return (
          <div className="py-8 flex flex-col items-center justify-center">
            <div className="w-16 h-16 mb-4 bg-green-100 rounded-full flex items-center justify-center text-green-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Content Generated!</h3>
            <p className="text-sm text-gray-500">
              Your {getPlatformDisplayName(platform)} content has been successfully generated and saved to your content library.
            </p>
          </div>
        );

      default:
        return null;
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
        <div className={`bg-white rounded-xl shadow-2xl w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-w-[95vw] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] mx-auto h-auto max-h-[95vh] overflow-hidden border border-gray-100 transition-all duration-300 ${
          isClosing ? 'animate-out slide-out-to-bottom zoom-out-95' : 'animate-in slide-in-from-bottom zoom-in-95'
        }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-black text-white px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center rounded-t-xl">
          <h3 className="text-lg sm:text-xl font-semibold">Generate {getPlatformDisplayName(platform)} Content</h3>
          <button 
            onClick={handleClose}
            className="text-white hover:text-gray-300 transition-colors p-1"
          >
            <X size={20} className="w-5 h-5" />
          </button>
        </div>
          
          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-8 max-h-[calc(95vh-80px)] overflow-y-auto">
            {renderStep()}
          </div>
        </div>
      </div>
    </>
  );
}

export default SocialGenerationForm;