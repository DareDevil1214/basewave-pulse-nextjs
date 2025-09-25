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
export const fetchPortalKeywordsFromBackend = async (): Promise<BackendKeyword[]> => {
  try {
    console.log('🔍 Fetching portal keywords via backend API...');

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.error('❌ No authentication token found');
      return [];
    }

    const response = await fetch('/api/business/keywords/portal', {
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
