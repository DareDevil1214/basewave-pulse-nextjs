'use client';

import { useState, useEffect } from 'react';
import { Bot, X, Loader2, Sparkles, Edit3, Wand2, FileText, Hash, RefreshCw } from 'lucide-react';
import { getCurrentBranding } from '@/lib/branding';
import { fetchKeywords, generateBlogPost, Keyword } from '@/lib/blog-firebase';
import { 
  generateKeywordsFromTopic, 
  generateKeywordsFromInputs, 
  convertAIDataToFormFormat,
  validateTopic,
  validateManualInputs,
  AIKeywordData 
} from '@/lib/ai-keyword-generator';

interface BlogGenerationFormProps {
  portal: 'newpeople' | 'cv-maker';
  onClose: () => void;
  onSuccess: () => void;
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

export function BlogGenerationForm({ portal, onClose, onSuccess }: BlogGenerationFormProps) {
  const [blogTemplates, setBlogTemplates] = useState<CompBlogArticle[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [generateImage, setGenerateImage] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  
  // AI Keyword Generation States
  const [aiMode, setAiMode] = useState<'templates' | 'ai-generate' | 'manual'>('templates');
  const [aiTopic, setAiTopic] = useState<string>('');
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualKeyword, setManualKeyword] = useState<string>('');
  const [manualOutline, setManualOutline] = useState<string>('');
  const [aiGeneratedData, setAiGeneratedData] = useState<AIKeywordData | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Enhanced loading animation state
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [apiCompleted, setApiCompleted] = useState(false);
  
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

  // Fetch blog templates and keywords on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [blogContentData, keywordsData] = await Promise.all([
          fetchCompBlogContent(),
          fetchKeywords(portal)
        ]);

        console.log('Fetched blog templates:', blogContentData);
        console.log('Blog template titles:', blogContentData.map(template => template.title));

        // Make sure we have valid blog templates
        if (blogContentData.length > 0) {
          // Filter out any templates without titles
          const validTemplates = blogContentData.filter(template =>
            template.title && template.title.trim() !== ''
          );

          console.log('Valid templates count:', validTemplates.length);
          setBlogTemplates(validTemplates);

          // Auto-select first item if available
          if (validTemplates.length > 0) {
            setSelectedTemplate(validTemplates[0].title); // Keep title for display/selection
          }
        } else {
          setBlogTemplates([]);
        }

        setKeywords(keywordsData);
        if (keywordsData.length > 0) {
          setSelectedKeyword(keywordsData[0].keyword);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load blog templates and keywords');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [portal]);
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match the animation duration
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

  // Enhanced loading animation effect
  useEffect(() => {
    if (loading && step === 2) {
      // Adjust timing based on whether image generation is enabled
      const baseStages = [
        { message: "Initializing blog generation...", duration: 2000, progress: 8 },
        { message: "Analyzing selected template...", duration: 3000, progress: 18 },
        { message: "Processing keywords and content...", duration: 4000, progress: 35 },
        { message: "Generating blog structure...", duration: 5000, progress: 55 },
        { message: "Creating compelling content...", duration: 6000, progress: 75 },
        { message: "Optimizing for SEO...", duration: 3000, progress: 85 }
      ];
      
      const imageStages = [
        { message: "Generating featured image...", duration: 8000, progress: 95 },
        { message: "Finalizing blog post...", duration: 2000, progress: 100 }
      ];
      
      const textOnlyStages = [
        { message: "Finalizing blog post...", duration: 4000, progress: 100 }
      ];
      
      const stages = [...baseStages, ...(generateImage ? imageStages : textOnlyStages)];

      let stageIndex = 0;
      setCurrentStage(0);
      setLoadingProgress(0);
      setLoadingMessage(stages[0].message);

      const runStage = () => {
        if (stageIndex >= stages.length) return;
        
        const stage = stages[stageIndex];
        setLoadingMessage(stage.message);
        
        // Animate progress bar
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
            
            // Move to next stage after a short delay
            setTimeout(() => {
              if (stageIndex < stages.length && loading && step === 2) {
                runStage();
              }
            }, 300);
            return;
          }
          
          // Slow down progress if we're near completion but API hasn't finished
          let actualIncrement = progressIncrement;
          if (currentProgress > 80 && !apiCompleted) {
            actualIncrement = progressIncrement * 0.3; // Slow down significantly
          } else if (currentProgress > 90 && !apiCompleted) {
            actualIncrement = progressIncrement * 0.1; // Almost stop
          }
          
          currentProgress += actualIncrement;
          setLoadingProgress(Math.min(currentProgress, endProgress));
          stepCount++;
        }, progressDuration / progressSteps);
      };

      // Start the animation sequence
      runStage();
    } else {
      // Reset when loading stops
      setLoadingProgress(0);
      setCurrentStage(0);
      setLoadingMessage('');
      setApiCompleted(false);
    }
  }, [loading, step]);

  const handleGenerate = async () => {
    try {
      let template;
      let templateId;
      let keywordToUse;

      // Handle different modes
      if (aiMode === 'templates') {
        // Validate required fields for template mode
        if (!selectedTemplate) {
          setError('Please select a blog template');
          return;
        }
        
        // Find the selected template
        template = blogTemplates.find(t => t.title === selectedTemplate);
        if (!template) {
          throw new Error('Selected template not found');
        }

        // Create templateId in the format expected by backend
        templateId = template.articleId
          ? `${template.documentId}_${template.articleId}`
          : template.documentId || template.title;

        // Use selected keyword or empty string if none selected
        keywordToUse = selectedKeyword ? [selectedKeyword] : [''];
      } else if (aiMode === 'ai-generate') {
        // Validate AI generated data
        if (!aiGeneratedData) {
          setError('Please generate AI keywords and title first');
          return;
        }

        // For AI-generated content, we'll create a custom template structure
        const website = portal === 'newpeople' ? 'https://newpeople.com' : 'https://cv-maker.com';
        template = {
          title: aiGeneratedData.title,
          description: aiGeneratedData.description,
          primary_keywords: aiGeneratedData.primary_keywords,
          secondary_keywords: aiGeneratedData.secondary_keywords,
          long_tail_keywords: aiGeneratedData.long_tail_keywords,
          outline: aiGeneratedData.outline,
          visual: 'AI Generated',
          website: website,
          documentId: `ai-custom-${Date.now()}`,
          articleId: `ai-${Date.now()}`
        };
        
        templateId = 'ai-generated-content';
        keywordToUse = aiGeneratedData.primary_keywords.slice(0, 1);
      } else if (aiMode === 'manual') {
        // For manual mode, validate required fields
        if (!manualTitle.trim()) {
          setError('Please enter a blog title');
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

        // Create template structure with manual data
        const website = portal === 'newpeople' ? 'https://newpeople.com' : 'https://cv-maker.com';
        template = {
          title: manualTitle,
          description: `Blog post about ${manualKeywords.join(', ')}`,
          primary_keywords: manualKeywords,
          secondary_keywords: aiGeneratedData ? aiGeneratedData.secondary_keywords : [],
          long_tail_keywords: aiGeneratedData ? aiGeneratedData.long_tail_keywords : [],
                          outline: manualOutline.trim() || (aiGeneratedData ? aiGeneratedData.outline : `Introduction to ${manualKeywords[0]}, Key concepts, Implementation strategies, Best practices, Conclusion`),
          visual: 'Manual Input',
          website: website,
          documentId: `manual-${Date.now()}`,
          articleId: `manual-${Date.now()}`
        };
        
        templateId = 'ai-generated-content';
        keywordToUse = manualKeywords;
      } else {
        setError('Invalid mode selected');
        return;
      }

      console.log('Using template:', template);
      console.log('Template ID:', templateId);
      console.log('Keywords to use:', keywordToUse);
      
      setLoading(true);
      setStep(2); // Move to generation animation
      setApiCompleted(false); // Reset API completion flag

      // Convert to BlogContent format expected by generateBlogPost
      const blogContentTemplate = {
        id: template.documentId || template.title,
        title: template.title,
        content: template.description,
        author: 'NewPeople',
        category: 'Blog',
        tags: [...template.primary_keywords, ...template.secondary_keywords],
        createdAt: new Date().toISOString(),
        articleId: template.articleId,
        templateId: templateId,
        // Include AI-generated content data for backend processing
        ...(aiMode === 'ai-generate' || aiMode === 'manual' ? {
          title: template.title,
          description: template.description,
          primary_keywords: template.primary_keywords,
          secondary_keywords: template.secondary_keywords,
          long_tail_keywords: template.long_tail_keywords,
          outline: template.outline,
          visual: template.visual,
          website: template.website
        } : {})
      };

      // Generate the blog post using the backend API
      const generatedPost = await generateBlogPost(
        blogContentTemplate,
        keywordToUse,
        portal as 'eliteequilibrium' | 'neovibemag' | 'eternalelite',
        generateImage
      );
      
      console.log('✅ Blog post generated and saved by backend API');
      
      // Mark API as completed and ensure progress reaches 100%
      setApiCompleted(true);
      setLoadingProgress(100);
      setLoadingMessage('Blog post generated successfully!');
      
      // Wait a moment to show completion, then move to success step
      setTimeout(() => {
        setStep(3);
        
        // Notify parent of success after a short delay to show success animation
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating blog post:', error);
      setError(`Failed to generate blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStep(1); // Go back to form
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      {/* Full screen blur overlay */}
      <div className="modal-overlay-full bg-white/30 backdrop-blur-sm"></div>
      
      {/* Modal container */}
      <div className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 p-4 ${
        isClosing ? 'animate-out fade-out' : 'animate-in fade-in'
      }`}>
        <div className={`bg-white rounded-xl shadow-2xl w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-w-[95vw] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] mx-auto h-auto max-h-[95vh] overflow-hidden border border-gray-100 transition-all duration-300 ${
          isClosing ? 'animate-out slide-out-to-bottom zoom-out-95' : 'animate-in slide-in-from-bottom zoom-in-95'
        }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-black text-white px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center rounded-t-xl">
          <h3 className="text-lg sm:text-xl font-semibold">Generate Blog Post</h3>
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
            <div className="flex flex-col">
              {error && (
                <div className="bg-red-50 text-red-600 px-3 sm:px-4 py-2 rounded-md text-sm mb-3 sm:mb-4">
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
                  {/* Blog Template Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="inline h-4 w-4 mr-2" />
                      Select Blog Template
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full bg-gray-100 text-gray-800 border-0 rounded-lg p-3 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800 transition ease-in-out duration-150 text-sm"
                      disabled={loading || blogTemplates.length === 0}
                      required
                    >
                      {loading && <option>Loading templates...</option>}
                      {!loading && blogTemplates.length === 0 && <option>No templates available</option>}
                      {!loading && blogTemplates.map((template) => (
                        <option key={template.title} value={template.title}>
                          {template.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Keyword Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Keyword (Optional)
                    </label>
                    <select
                      value={selectedKeyword}
                      onChange={(e) => setSelectedKeyword(e.target.value)}
                      className="w-full bg-gray-100 text-gray-800 border-0 rounded-lg p-3 focus:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800 transition ease-in-out duration-150 text-sm"
                      disabled={loading || keywords.length === 0}
                    >
                      {loading && <option>Loading keywords...</option>}
                      {!loading && keywords.length === 0 && <option>No keywords available</option>}
                      {!loading && keywords.map((keyword) => (
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
              
              {/* Generate Image Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Generate Featured Image
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Creates a custom image for your blog post
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
              
              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || (aiMode === 'ai-generate' && !aiGeneratedData) || (aiMode === 'manual' && (!manualTitle.trim() || !manualKeyword.trim()))}
                className={`w-full bg-gradient-to-r from-gray-800 to-black text-white font-semibold py-4 px-6 rounded-lg hover:from-gray-700 hover:to-gray-900 transition ease-in-out duration-150 shadow-lg ${
                  loading || (aiMode === 'ai-generate' && !aiGeneratedData) || (aiMode === 'manual' && (!manualTitle.trim() || !manualKeyword.trim())) ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  loading ? 'animate-pulse' : ''
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Generating Blog Post...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Bot className="mr-2 h-5 w-5" />
                    {aiMode === 'templates' 
                      ? 'Generate Blog Post' 
                      : aiMode === 'ai-generate' 
                        ? 'Generate Blog Post from AI Content'
                        : 'Generate Blog Post from Manual Input'
                    }
                  </span>
                )}
              </button>
              
              {/* Estimated time */}
              <p className="text-xs text-gray-500 text-center mt-3">
                Estimated time: {generateImage ? '30-60 seconds' : '15-30 seconds'}
              </p>
            </div>
          )}
          
          {step === 2 && (
            <div className="py-6 sm:py-8 flex flex-col items-center justify-center">
              {/* Clean spinner with black theme */}
              <div className="relative mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full shadow-sm"></div>
                </div>
                <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-gray-600 rounded-full animate-spin"></div>
                <div className="absolute -inset-1 w-14 h-14 sm:w-18 sm:h-18 border-2 border-gray-400 rounded-full animate-spin-slow"></div>
              </div>
              
              {/* Clean content */}
              <div className="space-y-2 sm:space-y-3 text-center">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Generating Blog Post
                </h3>
                <div className="min-h-[40px] sm:min-h-[50px] flex flex-col justify-center">
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Creating compelling content for your blog...
                  </p>
                  {loadingMessage && (
                    <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1 animate-slide-up">
                      {loadingMessage}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Clean progress bar */}
              <div className="w-full space-y-2 mt-4 sm:mt-6">
                <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500">
                  <span>Progress</span>
                  <span className="font-mono font-semibold text-gray-700">
                    {Math.round(loadingProgress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-gray-300 to-gray-400 h-2 rounded-full relative transition-all duration-300 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30"></div>
                    <div className="absolute right-0 top-0 w-1 h-full bg-white/50 animate-shine-subtle"></div>
                  </div>
                </div>
                
                {/* Clean stage indicators */}
                <div className="flex justify-between items-center pt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((stage, index) => (
                    <div 
                      key={stage}
                      className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-all duration-300 ${
                        currentStage > index 
                          ? 'bg-gray-400 scale-110' 
                          : currentStage === index
                          ? 'bg-gray-600 animate-pulse scale-125'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Clean estimated time */}
              <p className="text-xs text-gray-400 mt-3 sm:mt-4">
                Estimated completion: {generateImage ? '30-60 seconds' : '15-30 seconds'}
              </p>
            </div>
          )}
          
          {step === 3 && (
            <div className="py-6 sm:py-8 flex flex-col items-center justify-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">Blog Post Generated!</h3>
              <p className="text-xs sm:text-sm text-gray-500 text-center">Your blog post has been successfully created and published.</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
