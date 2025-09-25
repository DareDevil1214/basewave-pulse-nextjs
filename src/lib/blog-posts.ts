// Removed direct Firestore imports - now using backend API only
// import { collection, getDocs, addDoc, query, where, serverTimestamp, DocumentData, updateDoc, deleteDoc, doc } from 'firebase/firestore';
// import { db } from './firebase';

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

// Fetch blog posts from blog_posts collection
export const fetchBlogPosts = async (portal?: string): Promise<BlogPost[]> => {
  try {
    console.log(`🔍 Fetching blog posts via backend API${portal ? ` for ${portal}` : ''}...`);
    
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.error('❌ No authentication token found');
      return [];
    }

    // Build query parameters
    const params = new URLSearchParams();
    if (portal) params.append('portal', portal);

    const response = await fetch(`/api/business/blog-posts?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ Blog posts API failed:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Blog posts API returned error:', data.message);
      return [];
    }

    const blogPosts: BlogPost[] = data.data.map((post: any) => ({
      id: post.id,
      title: post.title || 'Untitled Post',
      content: post.content || '',
      portal: post.portal,
      status: post.status || 'published',
      url: post.url,
      keywords: post.keywords || [],
      createdAt: post.createdAt,
      scheduledFor: post.scheduledFor,
      imageGenerated: post.imageGenerated || false,
      imageUrl: post.imageUrl,
    }));
    
    console.log(`✅ Fetched ${blogPosts.length} blog posts via backend API`);
    return blogPosts;
  } catch (error) {
    console.error('❌ Error fetching blog posts via backend API:', error);
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
