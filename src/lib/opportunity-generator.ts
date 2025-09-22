import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

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
        website: request.portal === 'newpeople' ? 'https://newpeople.com' : 'https://cv-maker.com'
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

// Save generated opportunity to Firebase
export const saveOpportunityToFirebase = async (
  opportunity: GeneratedOpportunity,
  portal: string
): Promise<{ success: boolean; message: string; docId?: string }> => {
  try {
    console.log(`💾 Saving opportunity to Firebase for portal: ${portal}`);

    // Determine the document ID based on portal
    const documentId = portal === 'newpeople' ? 'new-people-doc-id' : 'cv-maker-doc-id';
    
    // Get a reference to the compBlogContent collection
    const compBlogContentRef = collection(db, 'compBlogContent');
    
    // Create a new document with the opportunity
    const docRef = await addDoc(compBlogContentRef, {
      articles: {
        [`opportunity-${Date.now()}`]: opportunity
      }
    });

    console.log('✅ Opportunity saved to Firebase with ID:', docRef.id);
    
    return {
      success: true,
      message: 'Opportunity generated and saved successfully!',
      docId: docRef.id
    };
  } catch (error) {
    console.error('❌ Error saving opportunity to Firebase:', error);
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

    // Step 2: Save to Firebase
    const saveResult = await saveOpportunityToFirebase(generationResult.data, portal);

    return saveResult;
  } catch (error) {
    console.error('❌ Error in generateAndSaveOpportunity:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
