'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Globe, Plus, Sparkles, Loader2 } from 'lucide-react';
import { SuccessToast } from '@/components/ui/SuccessToast';

interface CompetitorKeywordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (keywords: string[]) => void;
  portal: 'newpeople' | 'cv-maker';
}

export function CompetitorKeywordModal({ isOpen, onClose, onSuccess, portal }: CompetitorKeywordModalProps) {
  const [competitorUrls, setCompetitorUrls] = useState<string[]>(['']);
  const [maxKeywordsPerCompetitor, setMaxKeywordsPerCompetitor] = useState<number>(15);
  const [targetKeywords, setTargetKeywords] = useState<number>(25);
  const [extractingKeywords, setExtractingKeywords] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Handle competitor URL input changes
  const handleCompetitorUrlChange = (index: number, value: string) => {
    const newUrls = [...competitorUrls];
    newUrls[index] = value;
    setCompetitorUrls(newUrls);
  };

  // Add new competitor URL field
  const addCompetitorUrl = () => {
    setCompetitorUrls([...competitorUrls, '']);
  };

  // Remove competitor URL field
  const removeCompetitorUrl = (index: number) => {
    if (competitorUrls.length > 1) {
      const newUrls = competitorUrls.filter((_, i) => i !== index);
      setCompetitorUrls(newUrls);
    }
  };

  // Extract keywords from competitors
  const handleExtractCompetitorKeywords = async () => {
    // Validate URLs
    const validUrls = competitorUrls.filter(url => url.trim() !== '');
    if (validUrls.length === 0) {
      setError('Please enter at least one competitor URL');
      return;
    }

    // Validate URL format
    const urlRegex = /^https?:\/\/.+/;
    const invalidUrls = validUrls.filter(url => !urlRegex.test(url));
    if (invalidUrls.length > 0) {
      setError('Please enter valid URLs starting with http:// or https://');
      return;
    }

    setExtractingKeywords(true);
    setError(null);

    try {
      const payload = {
        competitorUrls: validUrls,
        maxKeywordsPerCompetitor: maxKeywordsPerCompetitor,
        targetKeywords: targetKeywords
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/keywords/extract-best-keywords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to extract keywords');
      }

      const result = await response.json();
      
      if (result.success && result.keywords && result.keywords.length > 0) {
        setToastMessage(`Successfully extracted ${result.keywords.length} keywords from competitors!`);
        setShowSuccessToast(true);
        
        // Notify parent component with extracted keywords
        onSuccess(result.keywords);
        
        // Reset form
        handleClose();
      } else {
        setError('No keywords were extracted from the competitors');
      }
    } catch (error) {
      console.error('Error extracting competitor keywords:', error);
      setError(`Failed to extract keywords: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setExtractingKeywords(false);
    }
  };

  const handleClose = () => {
    setCompetitorUrls(['']);
    setMaxKeywordsPerCompetitor(15);
    setTargetKeywords(25);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Full screen blur overlay */}
      <div className="modal-overlay-full bg-white/30 backdrop-blur-sm"></div>
      
      {/* Modal container */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-w-[95vw] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] mx-auto h-auto max-h-[95vh] overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800 to-black text-white px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center rounded-t-xl">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6" />
              <h3 className="text-lg sm:text-xl font-semibold">Extract Keywords from Competitors</h3>
            </div>
            <button 
              onClick={handleClose}
              className="text-white hover:text-gray-300 transition-colors p-1"
              disabled={extractingKeywords}
            >
              <X size={20} className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-8 max-h-[calc(95vh-80px)] overflow-y-auto">
            <div className="space-y-6">

              {error && (
                <div className="bg-red-50 text-red-600 px-3 sm:px-4 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Competitor URLs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Competitor URLs
                </label>
                <div className="space-y-3">
                  {competitorUrls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleCompetitorUrlChange(index, e.target.value)}
                        placeholder="https://example.com"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent text-sm"
                        disabled={extractingKeywords}
                      />
                      {competitorUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCompetitorUrl(index)}
                          disabled={extractingKeywords}
                          className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addCompetitorUrl}
                  disabled={extractingKeywords}
                  className="mt-3 flex items-center gap-2 text-gray-800 hover:text-gray-900 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Another URL
                </button>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Keywords per Competitor
                  </label>
                  <input
                    type="number"
                    value={maxKeywordsPerCompetitor}
                    onChange={(e) => setMaxKeywordsPerCompetitor(parseInt(e.target.value) || 15)}
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent text-sm"
                    disabled={extractingKeywords}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Total Keywords
                  </label>
                  <input
                    type="number"
                    value={targetKeywords}
                    onChange={(e) => setTargetKeywords(parseInt(e.target.value) || 25)}
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent text-sm"
                    disabled={extractingKeywords}
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center mt-0.5">
                    <Globe className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 mb-1">How it works</h4>
                    <p className="text-xs text-gray-700">
                      Enter competitor website URLs and we'll analyze their content to extract relevant keywords. 
                      These keywords will be added to your keyword collection for content generation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExtractCompetitorKeywords}
                  disabled={extractingKeywords}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                >
                  {extractingKeywords ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {extractingKeywords ? 'Extracting Keywords...' : 'Extract Keywords'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  disabled={extractingKeywords}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-all duration-200 text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </motion.button>
              </div>

              {/* Estimated time */}
              <p className="text-xs text-gray-500 text-center">
                Estimated time: 30-60 seconds depending on number of competitors
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      <SuccessToast
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        title="Success!"
        message={toastMessage}
        duration={4000}
      />
    </>
  );
}
