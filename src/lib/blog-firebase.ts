import { db } from './firebase';
import { collection, getDocs, addDoc, query, where, serverTimestamp, DocumentData, updateDoc, deleteDoc, doc } from 'firebase/firestore';

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

// Fetch blog content templates from compBlogContent collection with portal filter
export const fetchBlogContent = async (portal?: string): Promise<BlogContent[]> => {
  try {
    console.log(`🔍 Fetching blog content from compBlogContent collection${portal ? ` for portal: ${portal}` : ''}...`);
    
    // Get all documents from compBlogContent collection (no filtering at query level since website is nested)
    const querySnapshot = await getDocs(collection(db, 'compBlogContent'));
    
    console.log('📄 Blog content snapshot size:', querySnapshot.size);
    
    if (querySnapshot.size === 0) {
      console.log(`❌ No documents found in compBlogContent collection${portal ? ` for portal: ${portal}` : ''}`);
      return [];
    }
    
    const blogContent: BlogContent[] = [];
    
    // Process each document in the collection
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`Processing document ${doc.id}:`, data);
      
      // If the document has articles field
      if (data.articles) {
        // Loop through all articles to create separate blog templates
        Object.keys(data.articles).forEach(articleKey => {
          const article = data.articles[articleKey];
          if (article && article.title) {
            // Filter by website field within each article if portal is specified
            if (portal && article.website !== portal) {
              return; // Skip this article if it doesn't match the portal
            }
            
            blogContent.push({
              id: `${doc.id}_${articleKey}`,
              title: article.title,
              content: article.description || '',
              author: data.author || '',
              category: data.category || '',
              tags: data.tags || [],
              createdAt: data.createdAt || '',
            });
          }
        });
      } else if (data.title) {
        // If the document has a direct title field (and no portal filtering needed)
        if (!portal) {
          blogContent.push({
            id: doc.id,
            title: data.title,
            content: data.content || '',
            author: data.author || '',
            category: data.category || '',
            tags: data.tags || [],
            createdAt: data.createdAt || '',
          });
        }
      }
    });
    
    console.log(`✅ Fetched blog content for ${portal || 'all portals'}:`, blogContent.length, 'templates');
    console.log('Blog content titles:', blogContent.map(item => item.title));
    return blogContent;
  } catch (error) {
    console.error('❌ Error fetching blog content:', error);
    return [];
  }
};

// Fetch keywords from portalKeywords collection with portal filter
export const fetchKeywords = async (portal?: string): Promise<Keyword[]> => {
  try {
    console.log(`🔍 Fetching keywords from portalKeywords collection${portal ? ` for portal: ${portal}` : ''}...`);
    
    let querySnapshot;
    if (portal) {
      // Filter by portal field matching the portal
      const q = query(collection(db, 'portalKeywords'), where('portal', '==', portal));
      querySnapshot = await getDocs(q);
    } else {
      // Get all documents if no portal specified
      querySnapshot = await getDocs(collection(db, 'portalKeywords'));
    }
    
    console.log('📄 Keywords snapshot size:', querySnapshot.size);
    
    if (querySnapshot.size === 0) {
      console.log(`❌ No documents found in portalKeywords collection${portal ? ` for portal: ${portal}` : ''}`);
      return [];
    }
    
    const keywords: Keyword[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Handle the keywords array from portalKeywords collection
      if (data.keywords && Array.isArray(data.keywords)) {
        data.keywords.forEach((keywordText: string, index: number) => {
          keywords.push({
            id: `${doc.id}_${index}`,
            keyword: keywordText,
            volume: data.volume || data.searchVolume || 0,
            difficulty: data.difficulty || 0,
            rank: data.rank || '',
            opportunity: data.opportunity || '',
            intent: data.intent || '',
            cpc: data.cpc || 0,
          });
        });
      } else if (data.keyword) {
        // Fallback for single keyword documents
        keywords.push({
          id: doc.id,
          keyword: data.keyword || '',
          volume: data.volume || data.searchVolume || 0,
          difficulty: data.difficulty || 0,
          rank: data.rank || '',
          opportunity: data.opportunity || '',
          intent: data.intent || '',
          cpc: data.cpc || 0,
        });
      }
    });
    
    console.log(`✅ Fetched keywords for ${portal || 'all portals'}:`, keywords.length, 'documents');
    return keywords;
  } catch (error) {
    console.error('❌ Error fetching keywords:', error);
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
        website: blogTemplate.website || 'https://newpeople.com'
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