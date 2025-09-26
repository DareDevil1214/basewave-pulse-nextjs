// Backend API utilities for fetching business data
// This replaces direct Firestore access with backend API calls

export interface BackendKeyword {
  id: string;
  keyword: string;
  portal?: string;
  type?: string;
  cpc?: number;
  difficulty?: number;
  searchVolume?: number;
  competition?: string;
  extractedAt?: string;
  [key: string]: any;
}

export interface BackendBlogContent {
  id: string;
  title: string;
  content?: string;
  description?: string;
  outline?: string;
  website?: string;
  documentId: string;
  articleId: string;
  [key: string]: any;
}

/**
 * Fetch keywords from backend API
 */
export const fetchKeywordsFromBackend = async (type: string = 'all'): Promise<BackendKeyword[]> => {
  try {
    console.log(`🔍 Fetching keywords via backend API (type: ${type})...`);

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.error('❌ No authentication token found');
      return [];
    }

    const response = await fetch(`/api/business/keywords?type=${type}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ Keywords API failed:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Keywords API returned error:', data.message);
      return [];
    }

    const keywords: BackendKeyword[] = data.data || [];
    console.log(`✅ Found ${keywords.length} keywords via backend API`);
    return keywords;

  } catch (error) {
    console.error('❌ Error fetching keywords via backend API:', error);
    return [];
  }
};

/**
 * Fetch portal keywords from backend API
 */
export const fetchPortalKeywordsFromBackend = async (portal?: string): Promise<BackendKeyword[]> => {
  try {
    console.log('🔍 Fetching portal keywords via backend API...');

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.error('❌ No authentication token found');
      return [];
    }

    const url = portal 
      ? `/api/business/portal-keywords?portal=${encodeURIComponent(portal)}`
      : '/api/business/portal-keywords';

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ Portal keywords API failed:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Portal keywords API returned error:', data.message);
      return [];
    }

    const keywords: BackendKeyword[] = data.data || [];
    console.log(`✅ Found ${keywords.length} portal keywords via backend API`);
    return keywords;

  } catch (error) {
    console.error('❌ Error fetching portal keywords via backend API:', error);
    return [];
  }
};

/**
 * Fetch blog content from backend API
 */
export const fetchBlogContentFromBackend = async (): Promise<BackendBlogContent[]> => {
  try {
    console.log('🔍 Fetching blog content via backend API...');

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
      console.error('❌ Blog content API failed:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Blog content API returned error:', data.message);
      return [];
    }

    const articles: BackendBlogContent[] = [];
    
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((doc: any) => {
        if (doc.articles) {
          Object.entries(doc.articles).forEach(([articleId, article]: [string, any]) => {
            if (article && article.title) {
              articles.push({
                id: `${doc.id}_${articleId}`,
                title: article.title,
                content: article.content || article.description || '',
                description: article.description || '',
                outline: article.outline || '',
                website: article.website || '',
                documentId: doc.id,
                articleId,
                ...article
              });
            }
          });
        }
      });
    }

    console.log(`✅ Found ${articles.length} blog content items via backend API`);
    return articles;

  } catch (error) {
    console.error('❌ Error fetching blog content via backend API:', error);
    return [];
  }
};

/**
 * Helper function to convert backend keywords to legacy format for compatibility
 */
export const convertBackendKeywordsToLegacy = (keywords: BackendKeyword[]): any[] => {
  return keywords.map(keyword => ({
    id: keyword.id,
    keyword: keyword.keyword,
    portal: keyword.portal,
    cpc: keyword.cpc,
    difficulty: keyword.difficulty,
    searchVolume: keyword.searchVolume,
    competition: keyword.competition,
    extractedAt: keyword.extractedAt,
    // Add other fields as needed for compatibility
    ...keyword
  }));
};

/**
 * Helper function to convert backend blog content to legacy format for compatibility
 */
export const convertBackendBlogContentToLegacy = (content: BackendBlogContent[]): any[] => {
  return content.map(item => ({
    id: item.id,
    title: item.title,
    content: item.content || item.description || '',
    author: '',
    category: '',
    tags: [],
    createdAt: '',
    documentId: item.documentId,
    articleId: item.articleId,
    ...item
  }));
};

/**
 * Add a new keyword via backend API
 */
export const addKeywordToBackend = async (keywordData: any): Promise<any> => {
  try {
    console.log('🔍 Adding keyword via backend API...');

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.error('❌ No authentication token found');
      throw new Error('No authentication token found');
    }

    const response = await fetch('/api/business/keywords', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(keywordData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add keyword');
    }

    const result = await response.json();
    console.log('✅ Keyword added successfully');
    return result.data;
  } catch (error) {
    console.error('❌ Error adding keyword:', error);
    throw error;
  }
};

/**
 * Update a keyword via backend API
 */
export const updateKeywordInBackend = async (keywordId: string, updateData: any): Promise<any> => {
  try {
    console.log('🔍 Updating keyword via backend API...');

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.error('❌ No authentication token found');
      throw new Error('No authentication token found');
    }

    const response = await fetch(`/api/business/keywords/${keywordId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update keyword');
    }

    const result = await response.json();
    console.log('✅ Keyword updated successfully');
    return result.data;
  } catch (error) {
    console.error('❌ Error updating keyword:', error);
    throw error;
  }
};

/**
 * Delete a keyword via backend API
 */
export const deleteKeywordFromBackend = async (keywordId: string): Promise<any> => {
  try {
    console.log('🔍 Deleting keyword via backend API...');

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.error('❌ No authentication token found');
      throw new Error('No authentication token found');
    }

    const response = await fetch(`/api/business/keywords/${keywordId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete keyword');
    }

    const result = await response.json();
    console.log('✅ Keyword deleted successfully');
    return result.data;
  } catch (error) {
    console.error('❌ Error deleting keyword:', error);
    throw error;
  }
};

// ===== BUSINESS OPPORTUNITIES API =====

// Fetch opportunities from backend
export const fetchOpportunitiesFromBackend = async () => {
  try {
    const token = localStorage.getItem('jwt_token');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch('/api/business/opportunities', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching opportunities from backend:', error);
    throw error;
  }
};

// Add opportunity to backend
export const addOpportunityToBackend = async (opportunityData: any) => {
  try {
    const token = localStorage.getItem('jwt_token');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch('/api/business/opportunities', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(opportunityData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error adding opportunity to backend:', error);
    throw error;
  }
};

// ===== BUSINESS PORTAL KEYWORDS API =====
// Note: fetchPortalKeywordsFromBackend is already defined above (line 74)

// ===== BUSINESS BLOG POSTS API =====

// Fetch blog posts from backend
export const fetchBlogPostsFromBackend = async () => {
  try {
    const token = localStorage.getItem('jwt_token');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch('/api/business/blog-posts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching blog posts from backend:', error);
    throw error;
  }
};

// ===== BUSINESS SOCIAL POSTS API =====

// Fetch social posts from backend
export const fetchSocialPostsFromBackend = async (type: 'generated' | 'scheduled' | 'published' | 'all' = 'all') => {
  try {
    const token = localStorage.getItem('jwt_token');
    if (!token) throw new Error('No authentication token found');

    const url = type === 'all' 
      ? '/api/business/social-posts'
      : `/api/business/social-posts?type=${type}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching social posts from backend:', error);
    throw error;
  }
};

// ===== TEST DATA API =====

// Create test data for keywords
export const createTestData = async () => {
  try {
    const token = localStorage.getItem('jwt_token');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch('/api/business/keywords/test-data', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating test data:', error);
    throw error;
  }
};
