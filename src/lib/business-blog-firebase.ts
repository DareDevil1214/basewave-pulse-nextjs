// Business-specific blog data fetching
// This fetches blog templates from the business's own subcollections instead of global collections

import { getCurrentBranding } from './branding';

export interface BusinessBlogContent {
  id: string;
  title: string;
  description: string;
  outline: string;
  website: string;
  documentId: string;
  articleId: string;
}

/**
 * Fetch blog templates from business-specific API endpoint
 * This will get data from the business's own subcollections
 */
export const fetchBusinessBlogContent = async (): Promise<BusinessBlogContent[]> => {
  try {
    console.log('🔍 Fetching business blog templates via API...');
    
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
      console.error('❌ Failed to fetch business blog content:', response.status);
      return [];
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ API returned error:', data.message);
      return [];
    }

    const articles: BusinessBlogContent[] = [];
    
    // Process the response data
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((doc: any) => {
        if (doc.articles && typeof doc.articles === 'object') {
          Object.entries(doc.articles).forEach(([articleId, article]: [string, any]) => {
            if (article && article.title) {
              articles.push({
                id: `${doc.id}_${articleId}`,
                title: article.title,
                description: article.description || article.outline || '',
                outline: article.outline || '',
                website: article.website || '',
                documentId: doc.id,
                articleId: articleId
              });
            }
          });
        }
      });
    }

    console.log(`✅ Found ${articles.length} business blog templates`);
    return articles;

  } catch (error) {
    console.error('❌ Error fetching business blog content:', error);
    return [];
  }
};

/**
 * Fallback to direct Firestore access if API is not available
 * This shows all data without filtering
 */
export const fetchAllBlogContent = async (): Promise<BusinessBlogContent[]> => {
  try {
    console.log('🔍 Fetching all blog content (fallback method)...');
    
    // Import Firebase here to avoid dependency issues
    const { db } = await import('./firebase');
    const { collection, getDocs } = await import('firebase/firestore');

    const snapshot = await getDocs(collection(db, 'compBlogContent'));
    
    if (snapshot.empty) {
      console.log('⚠️ No documents found in compBlogContent collection');
      return [];
    }

    const articles: BusinessBlogContent[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      
      if (data.articles && typeof data.articles === 'object') {
        Object.entries(data.articles).forEach(([articleId, article]: [string, any]) => {
          if (article && article.title) {
            articles.push({
              id: `${doc.id}_${articleId}`,
              title: article.title,
              description: article.description || article.outline || '',
              outline: article.outline || '',
              website: article.website || '',
              documentId: doc.id,
              articleId: articleId
            });
          }
        });
      }
    });

    console.log(`✅ Found ${articles.length} total blog templates (fallback)`);
    return articles;

  } catch (error) {
    console.error('❌ Error in fallback blog content fetch:', error);
    return [];
  }
};
