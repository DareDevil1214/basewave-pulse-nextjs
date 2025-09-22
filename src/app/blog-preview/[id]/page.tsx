'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchBlogPosts, BlogPost } from '@/lib/blog-posts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, Clock, User, Tag, Share2, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function BlogPreviewPage() {
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        // Fetch all blog posts and find the one with matching ID
        const allPosts = await fetchBlogPosts();
        const foundPost = allPosts.find(p => p.id === postId);
        
        if (foundPost) {
          setPost(foundPost);
        } else {
          setError('Blog post not found');
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // Format date from Firestore timestamp
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = timestamp.seconds 
        ? new Date(timestamp.seconds * 1000) 
        : new Date(timestamp);
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Function to remove header content from blog post
  const removeHeaderContent = (content: string): string => {
    if (!content) return '';
    
    // Split content into lines
    const lines = content.split('\n');
    let startIndex = 0;
    
    // Find where the actual content starts (after title and metadata)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and metadata lines
      if (line === '' || 
          line.includes('•') || 
          line.includes('Back to Dashboard') ||
          line.includes('Neovibemag') ||
          line.includes('EliteEquilibrium') ||
          line.includes('EternalElite')) {
        continue;
      }
      
      // If we find a line that looks like content (not metadata), start from there
      if (line.length > 0 && !line.startsWith('|') && !line.includes('---')) {
        startIndex = i;
        break;
      }
    }
    
    // Return content starting from the actual content
    return lines.slice(startIndex).join('\n');
  };

  // Calculate reading time
  const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading blog post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="text-red-600 text-lg font-semibold mb-4">{error || 'Blog post not found'}</div>
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const readingTime = calculateReadingTime(post.content);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Article Header */}
        <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Featured Image */}
          {post.imageUrl && (
            <div className="relative h-96 overflow-hidden">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          )}

          {/* Article Content */}
          <div className="p-8 md:p-12">
            {/* Article Meta */}
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{readingTime} min read</span>
              </div>
            </div>

            {/* Article Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>


            {/* Keywords/Tags */}
            {post.keywords && post.keywords.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.keywords.map((keyword, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 rounded-full text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share Button */}
            <div className="flex items-center justify-between py-6 border-t border-gray-200 mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <BookOpen className="h-4 w-4" />
                <span>Blog Post</span>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => (
                      <h1 {...props} className="text-3xl font-bold text-gray-900 mb-6 mt-8" />
                    ),
                    h2: ({node, ...props}) => (
                      <h2 {...props} className="text-2xl font-bold text-gray-900 mb-4 mt-8" />
                    ),
                    h3: ({node, ...props}) => (
                      <h3 {...props} className="text-xl font-bold text-gray-900 mb-3 mt-6" />
                    ),
                    p: ({node, ...props}) => (
                      <p {...props} className="mb-6 text-gray-700 leading-relaxed" />
                    ),
                    ul: ({node, ...props}) => (
                      <ul {...props} className="mb-6 space-y-2" />
                    ),
                    ol: ({node, ...props}) => (
                      <ol {...props} className="mb-6 space-y-2" />
                    ),
                    li: ({node, ...props}) => (
                      <li {...props} className="text-gray-700" />
                    ),
                    blockquote: ({node, ...props}) => (
                      <blockquote {...props} className="border-l-4 border-blue-500 pl-6 py-2 mb-6 bg-blue-50 rounded-r-lg" />
                    ),
                    code: ({node, ...props}) => (
                      <code {...props} className="bg-gray-100 px-2 py-1 rounded text-sm font-mono" />
                    ),
                    pre: ({node, ...props}) => (
                      <pre {...props} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6" />
                    ),
                    table: ({node, ...props}) => (
                      <div className="table-container mb-6">
                        <table {...props} className="w-full border-collapse border border-gray-300" />
                      </div>
                    ),
                    th: ({node, ...props}) => (
                      <th {...props} className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold" />
                    ),
                    td: ({node, ...props}) => (
                      <td {...props} className="border border-gray-300 px-4 py-2" />
                    ),
                    a: ({node, ...props}) => (
                      <a {...props} className="text-blue-600 hover:text-blue-800 underline" />
                    ),
                    img: ({node, ...props}) => (
                      <img {...props} className="rounded-lg shadow-lg my-6" />
                    ),
                  }}
                >
                  {removeHeaderContent(post.content)}
                </ReactMarkdown>
              </div>
            </div>
          </div>
                 </article>
       </main>
     </div>
   );
 }
