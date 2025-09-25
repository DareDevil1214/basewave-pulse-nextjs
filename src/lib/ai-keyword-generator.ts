/**
 * AI Keyword and Title Generation Utility
 * Handles communication with the backend AI API for generating custom keywords and titles
 */

import { getCurrentBranding } from './branding';

export interface AIKeywordData {
  title: string;
  primary_keywords: string[];
  secondary_keywords: string[];
  long_tail_keywords: string[];
  description: string;
  outline: string;
}

export interface AIKeywordResponse {
  success: boolean;
  data?: AIKeywordData;
  message?: string;
}

/**
 * Generate keywords and title from a topic/summary using AI
 */
export async function generateKeywordsFromTopic(
  topic: string, 
  portal: string = 'basewave'
): Promise<AIKeywordResponse> {
  try {
    console.log(`🤖 Generating keywords from topic: "${topic}"`);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/generate-keywords-title`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: topic.trim(),
        portal
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate keywords from topic');
    }

    const result = await response.json();
    console.log('✅ Keywords generated successfully:', result.data);
    
    return result;
  } catch (error) {
    console.error('❌ Error generating keywords from topic:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Generate additional keywords from manual title and keyword inputs using AI
 */
export async function generateKeywordsFromInputs(
  title: string,
  keyword: string,
  portal: string = 'basewave'
): Promise<AIKeywordResponse> {
  try {
    console.log(`🤖 Generating keywords from inputs - Title: "${title}", Keyword: "${keyword}"`);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/generate-from-inputs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title.trim(),
        keyword: keyword.trim(),
        portal
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate keywords from inputs');
    }

    const result = await response.json();
    console.log('✅ Keywords generated successfully:', result.data);
    
    return result;
  } catch (error) {
    console.error('❌ Error generating keywords from inputs:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Convert AI generated data to the format expected by content generation forms
 */
export function convertAIDataToFormFormat(aiData: AIKeywordData) {
  return {
    // Create a template-like structure for content generation
    title: aiData.title,
    description: aiData.description,
    primary_keywords: aiData.primary_keywords,
    secondary_keywords: aiData.secondary_keywords,
    long_tail_keywords: aiData.long_tail_keywords,
    outline: aiData.outline,
    visual: 'AI Generated', // Placeholder for visual
    website: getCurrentBranding().website, // Dynamic website
    // Generate a unique ID for this AI-generated content
    documentId: `ai-generated-${Date.now()}`,
    articleId: `ai-${Date.now()}`
  };
}

/**
 * Validate topic input
 */
export function validateTopic(topic: string): { isValid: boolean; error?: string } {
  if (!topic || topic.trim() === '') {
    return { isValid: false, error: 'Topic is required' };
  }
  
  if (topic.trim().length < 3) {
    return { isValid: false, error: 'Topic must be at least 3 characters long' };
  }
  
  if (topic.trim().length > 200) {
    return { isValid: false, error: 'Topic must be less than 200 characters' };
  }
  
  return { isValid: true };
}

/**
 * Validate manual inputs
 */
export function validateManualInputs(title: string, keyword: string): { isValid: boolean; error?: string } {
  if (!title || title.trim() === '') {
    return { isValid: false, error: 'Title is required' };
  }
  
  if (!keyword || keyword.trim() === '') {
    return { isValid: false, error: 'At least one keyword is required' };
  }
  
  if (title.trim().length < 3) {
    return { isValid: false, error: 'Title must be at least 3 characters long' };
  }
  
  // Parse keywords (comma-separated)
  const keywords = keyword.split(',').map(k => k.trim()).filter(k => k.length > 0);
  
  if (keywords.length === 0) {
    return { isValid: false, error: 'At least one valid keyword is required' };
  }
  
  // Check each keyword length
  for (const kw of keywords) {
    if (kw.length < 2) {
      return { isValid: false, error: 'Each keyword must be at least 2 characters long' };
    }
    if (kw.length > 50) {
      return { isValid: false, error: 'Each keyword must be less than 50 characters' };
    }
  }
  
  if (title.trim().length > 100) {
    return { isValid: false, error: 'Title must be less than 100 characters' };
  }
  
  if (keyword.trim().length > 500) {
    return { isValid: false, error: 'Total keywords text must be less than 500 characters' };
  }
  
  return { isValid: true };
}
