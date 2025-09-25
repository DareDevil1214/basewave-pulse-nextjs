// Removed direct Firestore imports - now using backend API only
// import { db } from './firebase';
// import { collection, getDocs, addDoc, query, where, serverTimestamp, DocumentData, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getCurrentBranding } from './branding';

// Interface for blog content from compBlogContent collection
export interface BlogContent {
  id: string;
  title: string;
  content?: string;
  author?: string;
  category?: string;
  tags?: string[];
  createdAt?: string;
}

// Interface for keywords from best_keywords collection
export interface Keyword {
  id: string;
  keyword: string;
  volume?: number;
  difficulty?: number;
  rank?: string;
  opportunity?: string;
  intent?: string;
  cpc?: number;
}

// Interface for generated blog posts
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  portal: 'eliteequilibrium' | 'neovibemag' | 'eternalelite';
  status: 'published' | 'draft' | 'scheduled';
  url?: string;
  keywords?: string[];
  createdAt?: any;
  scheduledFor?: any;
  imageGenerated?: boolean;
  imageUrl?: string;
}

// Fetch blog content templates from backend API only
export const fetchBlogContent = async (portal?: string): Promise<BlogContent[]> => {
  try {
    console.log(`🔍 Fetching blog content via backend API${portal ? ` for portal: ${portal}` : ''}...`);
    
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

    const blogContent: BlogContent[] = [];
    
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((doc: any) => {
        if (doc.articles) {
          Object.entries(doc.articles).forEach(([articleId, article]: [string, any]) => {
            if (article && article.title) {
              blogContent.push({
                id: `${doc.id}_${articleId}`,
                title: article.title,
                content: article.description || article.outline || '',
                author: doc.author || '',
                category: doc.category || '',
                tags: doc.tags || [],
                createdAt: doc.createdAt || '',
              });
            }
          });
        }
      });
    }
    
    console.log(`✅ Fetched ${blogContent.length} blog content templates via backend API`);
    return blogContent;
  } catch (error) {
    console.error('❌ Error fetching blog content via backend API:', error);
    return [];
  }
};

// Fetch keywords from portalKeywords collection with portal filter
export const fetchKeywords = async (portal?: string): Promise<Keyword[]> => {
  try {
    console.log(`🔍 Fetching keywords via backend API${portal ? ` for portal: ${portal}` : ''}...`);
    
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.error('❌ No authentication token found');
      return [];
    }

    // Use portal-specific endpoint if portal is specified, otherwise get all
    const endpoint = portal ? '/api/business/keywords/portal' : '/api/business/keywords?type=all';

    const response = await fetch(endpoint, {
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

    const keywords: Keyword[] = [];
    
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((item: any, index: number) => {
        // Handle different keyword data structures
        if (item.keyword) {
          keywords.push({
            id: item.id || `keyword_${index}`,
            keyword: item.keyword,
            volume: item.volume || item.searchVolume || 0,
            difficulty: item.difficulty || 0,
            rank: item.rank || '',
            opportunity: item.opportunity || '',
            intent: item.intent || '',
            cpc: item.cpc || 0,
          });
        } else if (item.keywords && Array.isArray(item.keywords)) {
          // Handle nested keywords structure
          item.keywords.forEach((keyword: any, keywordIndex: number) => {
            keywords.push({
              id: `${item.id || index}_${keywordIndex}`,
              keyword: typeof keyword === 'string' ? keyword : keyword.keyword,
              volume: keyword.volume || keyword.searchVolume || 0,
              difficulty: keyword.difficulty || 0,
              rank: keyword.rank || '',
              opportunity: keyword.opportunity || '',
              intent: keyword.intent || '',
              cpc: keyword.cpc || 0,
            });
          });
        }
      });
    }
    
    console.log(`✅ Fetched ${keywords.length} keywords via backend API`);
    return keywords;
  } catch (error) {
    console.error('❌ Error fetching keywords via backend API:', error);
    return [];
  }
};

// Fetch blog posts from blog_posts collection
export const fetchBlogPosts = async (portal?: string): Promise<BlogPost[]> => {
  try {
    console.log(`🔍 Fetching blog posts${portal ? ` for ${portal}` : ''}...`);
    
    let querySnapshot;
    if (portal) {
      const q = query(collection(db, 'blog_posts'), where('portal', '==', portal));
      querySnapshot = await getDocs(q);
    } else {
      querySnapshot = await getDocs(collection(db, 'blog_posts'));
    }
    
    console.log('📄 Blog posts snapshot size:', querySnapshot.size);
    
    if (querySnapshot.size === 0) {
      console.log(`❌ No blog posts found${portal ? ` for ${portal}` : ''}`);
      return [];
    }
    
    const blogPosts: BlogPost[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      blogPosts.push({
        id: doc.id,
        title: data.title || 'Untitled Post',
        content: data.content || '',
        portal: data.portal,
        status: data.status || 'published',
        url: data.url,
        keywords: data.keywords || [],
        createdAt: data.createdAt,
        scheduledFor: data.scheduledFor,
        imageGenerated: data.imageGenerated || false,
        imageUrl: data.imageUrl,
      });
    });
    
    // Sort by creation date (newest first)
    blogPosts.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log('✅ Fetched blog posts:', blogPosts.length, 'documents');
    return blogPosts;
  } catch (error) {
    console.error('❌ Error fetching blog posts:', error);
    return [];
  }
};

// Save a generated blog post to blog_posts collection
export const saveBlogPost = async (blogPost: Omit<BlogPost, 'id' | 'createdAt'>): Promise<string> => {
  try {
    console.log('💾 Saving blog post to blog_posts collection...');
    
    // Filter out undefined values to prevent Firebase errors
    const cleanBlogPost = Object.fromEntries(
      Object.entries(blogPost).filter(([_, value]) => value !== undefined)
    );
    
    const docRef = await addDoc(collection(db, 'blog_posts'), {
      ...cleanBlogPost,
      createdAt: serverTimestamp(),
      status: blogPost.status || 'published',
    });
    
    console.log('✅ Blog post saved successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving blog post:', error);
    throw error;
  }
};

// Update a blog post status
export const updateBlogPost = async (postId: string, updates: Partial<BlogPost>): Promise<void> => {
  try {
    console.log('🔄 Updating blog post:', postId, updates);
    
    const docRef = doc(db, 'blog_posts', postId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    
    console.log('✅ Blog post updated successfully');
  } catch (error) {
    console.error('❌ Error updating blog post:', error);
    throw error;
  }
};

// Delete a blog post
export const deleteBlogPost = async (postId: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting blog post:', postId);
    
    const docRef = doc(db, 'blog_posts', postId);
    await deleteDoc(docRef);
    
    console.log('✅ Blog post deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting blog post:', error);
    throw error;
  }
};

// Generate a blog post using the backend API
export const generateBlogPost = async (
  blogTemplate: BlogContent | null,
  selectedKeywords: string[],
  portal: 'eliteequilibrium' | 'neovibemag' | 'eternalelite',
  generateImage: boolean
): Promise<BlogPost> => {
  try {
    console.log('🤖 Generating blog post using backend API...');
    console.log('📝 Template ID:', blogTemplate?.id);
    console.log('🔑 Keywords:', selectedKeywords);
    console.log('🌐 Portal:', portal);
    console.log('🖼️ Generate image:', generateImage);
    
    // Prepare the request payload for the auto-blog generator
    const payload = {
      portal: portal,
      templateId: blogTemplate?.templateId || blogTemplate?.id || '',
      keyword: selectedKeywords.length > 0 ? selectedKeywords[0] : '',
      generateImage: generateImage,
      imageStyle: 'professional',
      maxBlogs: 1,
      // Include AI-generated content data if available
      ...(blogTemplate?.title && blogTemplate?.description ? {
        title: blogTemplate.title,
        description: blogTemplate.description,
        primary_keywords: blogTemplate.primary_keywords || [],
        secondary_keywords: blogTemplate.secondary_keywords || [],
        long_tail_keywords: blogTemplate.long_tail_keywords || [],
        outline: blogTemplate.outline || '',
        visual: blogTemplate.visual || 'AI Generated',
        website: blogTemplate.website || getCurrentBranding().website
      } : {})
    };

    console.log('📦 Request payload:', payload);

    // Call the backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/autoblog/auto-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API error: ${response.status} - ${errorData}`);
    }
    
    const result = await response.json();
    console.log('✅ Blog post generated successfully:', result);

    // Extract the blog post data from the auto-generate API response
    if (!result.success || !result.data || result.data.length === 0) {
      throw new Error('Invalid response from auto-generate API');
    }

    const generatedBlog = result.data[0];

    // Extract the blog post data from the API response
    const blogPost: Omit<BlogPost, 'id' | 'createdAt'> = {
      title: generatedBlog.title || payload.title,
      content: generatedBlog.content || '',
      portal: portal,
      status: 'published',
      url: generatedBlog.url || '',
      keywords: selectedKeywords,
      imageGenerated: generateImage,
      imageUrl: generatedBlog.imageUrl,
    };

    return {
      ...blogPost,
      id: generatedBlog.id || 'temp-id', // Use the Firebase document ID from backend
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Error generating blog post:', error);
    throw error; // Re-throw the error to be handled by the calling function
  }
};