import { collection, getDocs, addDoc, query, where, serverTimestamp, DocumentData, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

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
