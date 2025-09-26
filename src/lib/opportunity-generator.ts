// Note: Firebase dependencies removed - using backend API instead
// import { db } from './firebase';
import { getCurrentBranding } from './branding';
// import { collection, addDoc } from 'firebase/firestore';

export interface GeneratedOpportunity {
  title: string;
  description: string;
  primary_keywords: string[];
  secondary_keywords: string[];
  long_tail_keywords: string[];
  outline: string;
  visual: string;
  website: string;
}

export interface OpportunityGenerationRequest {
  keyword: string;
  portal: string;
}

export interface OpportunityGenerationResponse {
  success: boolean;
  data?: GeneratedOpportunity;
  message?: string;
}

// Generate opportunity using AI based on keyword
export const generateOpportunityFromKeyword = async (
  request: OpportunityGenerationRequest
): Promise<OpportunityGenerationResponse> => {
  try {
    console.log(`🤖 Generating opportunity for keyword: "${request.keyword}" in portal: ${request.portal}`);

    // Call the backend API to generate opportunity
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/generate-opportunity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword: request.keyword,
        portal: request.portal,
        website: getCurrentBranding().website || 'https://basewave.com'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      console.log('✅ Opportunity generated successfully:', result.data);
      return {
        success: true,
        data: result.data
      };
    } else {
      console.error('❌ Failed to generate opportunity:', result.message);
      return {
        success: false,
        message: result.message || 'Failed to generate opportunity'
      };
    }
  } catch (error) {
    console.error('❌ Error generating opportunity:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Save generated opportunity via backend API
export const saveOpportunityToBackend = async (
  opportunity: GeneratedOpportunity,
  portal: string
): Promise<{ success: boolean; message: string; docId?: string }> => {
  try {
    console.log(`💾 Saving opportunity via backend API for portal: ${portal}`);

    // Prepare opportunity data for backend API
    const opportunityData = {
      articles: {
        [`opportunity-${Date.now()}`]: opportunity
      },
      portal: portal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Call backend API to save opportunity
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('/api/opportunities/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(opportunityData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save opportunity');
    }

    const result = await response.json();
    console.log('✅ Opportunity saved via backend API with ID:', result.data?.id);
    
    return {
      success: true,
      message: 'Opportunity generated and saved successfully!',
      docId: result.data?.id
    };
  } catch (error) {
    console.error('❌ Error saving opportunity via backend API:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to save opportunity'
    };
  }
};

// Complete flow: generate and save opportunity
export const generateAndSaveOpportunity = async (
  keyword: string,
  portal: string
): Promise<{ success: boolean; message: string; docId?: string }> => {
  try {
    // Step 1: Generate opportunity using AI
    const generationResult = await generateOpportunityFromKeyword({
      keyword,
      portal
    });

    if (!generationResult.success || !generationResult.data) {
      return {
        success: false,
        message: generationResult.message || 'Failed to generate opportunity'
      };
    }

    // Step 2: Save via backend API
    const saveResult = await saveOpportunityToBackend(generationResult.data, portal);

    return saveResult;
  } catch (error) {
    console.error('❌ Error in generateAndSaveOpportunity:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
