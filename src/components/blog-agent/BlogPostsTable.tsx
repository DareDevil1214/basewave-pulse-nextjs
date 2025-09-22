'use client';

import { useState, useEffect } from 'react';
import { Loader2, Trash2, Eye, Clock, Calendar, MoreVertical, Search, Image as ImageIcon } from 'lucide-react';
import { fetchBlogPosts, updateBlogPost, deleteBlogPost, BlogPost } from '@/lib/blog-posts';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from 'framer-motion'

interface BlogPostsTableProps {
  portal: 'newpeople';
  refreshTrigger?: number; // Used to trigger a refresh when a new blog is added
}

// Skeleton loader component for blog cards
const BlogCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
    {/* Image skeleton */}
    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
      <div className="absolute top-4 left-4">
        <div className="w-16 h-6 bg-gray-300 rounded-full animate-pulse"></div>
      </div>
      <div className="absolute top-4 right-4">
        <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
      </div>
    </div>
    
    {/* Content skeleton */}
    <div className="p-6">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="w-full h-5 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-3/4 h-5 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse"></div>
        <div className="w-11 h-6 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Enhanced image component with loading state
const BlogImage = ({ 
  src, 
  alt, 
  portal, 
  className = "w-full h-full object-cover" 
}: { 
  src?: string; 
  alt: string; 
  portal: string; 
  className?: string;
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (imageError || !src) {
    // Fallback to portal logo
    const logoPath = '/logo-load.webp';
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-500/20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <img 
              src={logoPath} 
              alt="Portal Logo" 
              className="w-16 h-16 object-contain mx-auto mb-2 opacity-80" 
            />
            <p className="text-sm text-blue-600 font-medium">Blog Post</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>
      )}
      <img 
        src={src} 
        alt={alt}
        className={`${className} ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageLoading(false);
          setImageError(true);
        }}
      />
    </div>
  );
};

export function BlogPostsTable({ portal, refreshTrigger = 0 }: BlogPostsTableProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingPosts, setUpdatingPosts] = useState<Set<string>>(new Set());
  const [deletingPosts, setDeletingPosts] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  
  // Fetch blog posts when component mounts or refreshTrigger changes
  useEffect(() => {
    const loadBlogPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch blog posts
        const posts = await fetchBlogPosts(portal);
        
        // Set the posts immediately
        setBlogPosts(posts);
        
        // Keep loading state for minimum time to prevent flickering
        // This ensures skeleton loaders stay visible until content is ready
        setTimeout(() => {
          setLoading(false);
        }, 1500); // Minimum 1.5 seconds loading time
        
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        setError('Failed to load blog posts');
        setLoading(false);
      }
    };
    
    loadBlogPosts();
  }, [portal, refreshTrigger]);

  // Filter posts based on search term and sort by creation date (latest first)
  useEffect(() => {
    let posts = [...blogPosts];
    
    // Sort posts by creation date (latest first)
    posts.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Latest first (descending order)
    });
    
    if (!searchTerm.trim()) {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPosts(filtered);
    }
  }, [blogPosts, searchTerm]);

  // Modern Toggle Switch Component
  const ToggleSwitch = ({ checked, onChange, disabled = false }: { 
    checked: boolean; 
    onChange: () => void; 
    disabled?: boolean;
  }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
        ${checked ? 'bg-green-500 shadow-lg shadow-green-200' : 'bg-gray-200'}
        ${disabled ? 'opacity-60' : ''}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition-all duration-300 ease-out
          ${checked ? 'translate-x-6' : 'translate-x-1'}
          ${disabled ? 'animate-pulse' : ''}
        `}
      />
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );

  const handleStatusToggle = async (postId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    // Optimistic update - immediately update the local state
    setBlogPosts(prev => 
      prev.map(post => 
        post.id === postId 
          ? { ...post, status: newStatus as 'published' | 'draft' }
          : post
      )
    );
    
    // Update filtered posts as well
    setFilteredPosts(prev => 
      prev.map(post => 
        post.id === postId 
          ? { ...post, status: newStatus as 'published' | 'draft' }
          : post
      )
    );
    
    setUpdatingPosts(prev => new Set(prev).add(postId));
    
    try {
      await updateBlogPost(postId, { status: newStatus });
    } catch (error) {
      console.error('Error updating post status:', error);
      // Revert optimistic update on error
      setBlogPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { ...post, status: currentStatus as 'published' | 'draft' }
            : post
        )
      );
      setFilteredPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { ...post, status: currentStatus as 'published' | 'draft' }
            : post
        )
      );
    } finally {
      setUpdatingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    setDeletingPosts(prev => new Set(prev).add(postId));
    
    try {
      await deleteBlogPost(postId);
      // Remove from both arrays
      setBlogPosts(prev => prev.filter(post => post.id !== postId));
      setFilteredPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setDeletingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = timestamp.seconds 
        ? new Date(timestamp.seconds * 1000) 
        : new Date(timestamp);
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Get reading time estimate
  const getReadingTime = (content: string): string => {
    if (!content) return '5 min read';
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Truncate content for preview
  const truncateContent = (content: string, maxLength: number = 150): string => {
    if (!content) return 'No content available...';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };
  
  // Generate slug from title for URL routing
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // This removes the colon (:)
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-+|-+$/g, '');
  };

  // Get the actual portal URL for published posts
  const getPortalUrl = (portal: string, title: string, status: string, postId: string): string => {
    if (status !== 'published') {
      // For drafts, still use the preview route with post ID
      return `/blog-preview/${postId}`;
    }

    const slug = generateSlug(title);
    
    switch (portal) {
      case 'eliteequilibrium':
        return `https://www.eliteequilibrium.com/recoveryinsights/${slug}`;
      case 'eternalelite':
        return `https://www.eternal-elite.com/insights/${slug}`;
      case 'neovibemag':
        return `https://www.neovibemag.com/articles/${slug}`;
      default:
        return `/blog-preview/${postId}`;
    }
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
        {/* Header with Search */}
        <div className="bg-white/70 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-200/50 shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center">
              <div className="w-2 h-2 bg-black rounded-full mr-3 sm:mr-4"></div>
              Recent Blog Posts
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-80 bg-white/50 border-gray-200/50 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-6">
            {/* Loading header */}
            <div className="text-center py-8">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-3" />
                <p className="text-lg text-slate-600 font-medium">Loading blog posts...</p>
                <p className="text-sm text-slate-400 mt-1">Please wait while we fetch your content</p>
              </div>
            </div>
            
            {/* Skeleton grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <BlogCardSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              {error}
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white/50 rounded-xl border-2 border-dashed border-slate-200">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium text-base">
              {searchTerm ? 'No posts found matching your search' : 'No blog posts found'}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {searchTerm ? 'Try searching with different keywords' : 'Generate your first blog post to get started!'}
            </p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Card Header Image */}
                  <div className="w-full h-48 relative overflow-hidden">
                    <BlogImage 
                      src={post.imageUrl} 
                      alt={post.title}
                      portal={portal}
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                     <DropdownMenuItem
                             onClick={(e) => {
                               e.stopPropagation();
                               const url = getPortalUrl(portal, post.title, post.status, post.id);
                               window.open(url, '_blank');
                             }}
                           >
                            <Eye className="mr-2 h-4 w-4" />
                            {post.status === 'published' ? 'View on Portal' : 'Preview post'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePost(post.id);
                            }}
                            disabled={deletingPosts.has(post.id)}
                            className="text-red-600"
                          >
                            {deletingPosts.has(post.id) ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Delete post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(post.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {getReadingTime(post.content || '')}
                      </div>
                    </div>
                    
                                         <div 
                       className="cursor-pointer"
                       onClick={() => {
                         const url = getPortalUrl(portal, post.title, post.status, post.id);
                         window.open(url, '_blank');
                       }}
                     >
                      <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4">
                        {truncateContent(post.content || '')}
                      </p>
                    </div>

                    {/* Portal Logo */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src='/logo-load.webp' 
                          alt="Portal Logo" 
                          className="w-20 h-20 object-contain" 
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <ToggleSwitch
                          checked={post.status === 'published'}
                          onChange={() => handleStatusToggle(post.id, post.status)}
                          disabled={updatingPosts.has(post.id)}
                        />
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
    </div>
  );
}
