'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Loader2,
  X,
  Users,
  Music,
  Instagram,
  Youtube,
  MessageSquare,
  Linkedin,
  Image,
  CheckCircle2,
  RefreshCw,
  Eye,
  Copy,
  Target,
  ExternalLink,
  Hash,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PublishButton from '../ui/publish-button';
import DeleteButton from '../ui/delete-button';
import { motion } from 'framer-motion';
import { extractSocialMediaUrl } from '@/lib/firebase';
// Note: Firebase db dependency removed - using backend API instead
// import { db } from '@/lib/firebase';
// import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { createPortal } from 'react-dom';
import React from 'react'; // Added missing import for React

interface SocialMediaContent {
  id: string;
  platform: string;
  account: string;
  content: string;
  originalTitle: string;
  imageUrl?: string;
  keywords: string[];
  status: 'draft' | 'published' | 'success';
  wordCount: number;
  characterCount: number;
  createdAt: string;
  publishedAt?: string;
  tone: string;
  targetAudience: string;
  sourceDocumentId?: string;
  sourceArticleId?: string;
  sourceUrl?: string;
  sourceWebsite?: string;
  generateImage?: boolean;
  imageFileName?: string;
  imageStyle?: string;
  duplicatePreventionLog?: {
    success?: boolean;
    [key: string]: unknown;
  };
  uploadPostResponse?: {
    success?: boolean;
    url?: string;
    post_id?: string;
    timestamp?: string;
    usage_count?: number;
    usage_limit?: number;
    results?: string | {
      [platform: string]: {
        post_id?: string;
        success?: boolean;
        url?: string;
        [key: string]: any;
      };
    };
    [key: string]: any;
  };
  usage?: {
    [key: string]: unknown;
  };
}

interface SocialContentLibraryProps {
  platform: string;
  account: string;
  refreshTrigger?: number;
  searchTerm?: string;
}

export default function SocialContentLibrary({ platform, account, refreshTrigger, searchTerm = '' }: SocialContentLibraryProps) {
  const [content, setContent] = useState<SocialMediaContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postingContent, setPostingContent] = useState<string | null>(null);
  const [postStatus, setPostStatus] = useState<{ [key: string]: { success: boolean; message: string } }>({});
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<SocialMediaContent | null>(null);
  const [copied, setCopied] = useState(false);
  const [socialMediaUrls, setSocialMediaUrls] = useState<{ [key: string]: string }>({});

  // Filter content based on search term
  const filteredContent = React.useMemo(() => {
    if (!searchTerm.trim()) {
      return content;
    }

    return content.filter(post =>
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.originalTitle && post.originalTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      post.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [content, searchTerm]);

  const getPlatformDisplayName = (platform: string): string => {
    const displayNames: { [key: string]: string } = {
      'x': 'Twitter',
      'twitter': 'Twitter',
      'tiktok': 'TikTok',
      'instagram': 'Instagram',
      'linkedin': 'LinkedIn',
      'youtube': 'YouTube',
      'facebook': 'Facebook',
      'pinterest': 'Pinterest',
      'threads': 'Threads'
    };
    return displayNames[platform.toLowerCase()] || platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
  };

  const getSocialMediaUrl = (platform: string, username: string): string => {
    const urls: { [key: string]: string } = {
      'eliteequilibrium': {
        'x': 'https://x.com/equil36247',
        'linkedin': 'https://www.linkedin.com/in/elite-equilibrium-68779b379/',
        'threads': 'https://www.threads.com/@eliteequilibrium',
        'instagram': 'https://www.instagram.com/eliteequilibrium/',
        'facebook': 'https://www.facebook.com/people/Elite-Equilibrium/61579065467492/'
      }[platform.toLowerCase()] || '',
      'neovibemag': {
        'x': 'https://x.com/NeovibeMag',
        'linkedin': 'https://www.linkedin.com/in/neovibe-mag-62a908379/',
        'threads': 'https://www.threads.com/@neovibemag',
        'instagram': 'https://www.instagram.com/neovibemag/',
        'facebook': 'https://www.facebook.com/profile.php?id=61579452839234'
      }[platform.toLowerCase()] || '',
      'eternalelite': {
        'x': 'https://x.com/EternalElite12',
        'linkedin': 'https://www.linkedin.com/in/eternal-elite-a2a7a3379/',
        'threads': 'https://www.threads.com/@eternalelite45',
        'instagram': 'https://www.instagram.com/eternalelite45/',
        'facebook': 'https://www.facebook.com/profile.php?id=61579253498526'
      }[platform.toLowerCase()] || '',
      'eternelite': {
        'x': 'https://x.com/EternalElite12',
        'linkedin': 'https://www.linkedin.com/in/eternal-elite-a2a7a3379/',
        'threads': 'https://www.threads.com/@eternalelite45',
        'instagram': 'https://www.instagram.com/eternalelite45/',
        'facebook': 'https://www.facebook.com/profile.php?id=61579253498526'
      }[platform.toLowerCase()] || ''
    };
    return urls[username] || '';
  };

  const fetchSocialMediaUrls = async (publishedPosts: SocialMediaContent[]) => {
    console.log('🔗 Extracting social media URLs for', publishedPosts.length, 'published posts');
    const urls: { [key: string]: string } = {};

    for (const post of publishedPosts) {
      try {
        console.log(`🔍 Extracting URL for post ${post.id}`);

        const publishedData = {
          id: post.id,
          platform: post.platform,
          postId: post.id,
          status: post.status,
          uploadPostResponse: post.uploadPostResponse
        };

        const url = extractSocialMediaUrl(publishedData);

        if (url) {
          urls[post.id] = url;
          console.log(`✅ Found URL for ${post.id}: ${url}`);
        } else {
          console.log(`❌ No URL found for ${post.id} - will retry later`);
          // Don't add to URLs yet - this will show the loading state
        }
      } catch (error) {
        console.error(`Error extracting URL for post ${post.id}:`, error);
      }
    }

    console.log('🔗 Final URLs object:', urls);
    setSocialMediaUrls(prev => ({ ...prev, ...urls }));
  };

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const postsRef = collection(db, 'socialAgent_generatedPosts');
      const q = query(postsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const posts: SocialMediaContent[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const isPublished = data.status === 'published' ||
          data.status === 'success' ||
          !!data.uploadPostResponse ||
          !!data.publishedAt ||
          (data.duplicatePreventionLog && data.duplicatePreventionLog.success);

        const post = {
          id: doc.id,
          platform: data.platform || '',
          account: data.account || '',
          content: data.content || '',
          originalTitle: data.originalTitle || '',
          imageUrl: data.imageUrl || '',
          keywords: data.keywords || [],
          status: isPublished ? 'published' as const : 'draft' as const,
          wordCount: data.wordCount || 0,
          characterCount: data.characterCount || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          publishedAt: data.publishedAt || (isPublished ? new Date().toISOString() : ''),
          tone: data.tone || '',
          targetAudience: data.targetAudience || '',
          sourceDocumentId: data.sourceDocumentId,
          sourceArticleId: data.sourceArticleId,
          sourceUrl: data.sourceUrl,
          sourceWebsite: data.sourceWebsite,
          generateImage: data.generateImage,
          imageFileName: data.imageFileName,
          imageStyle: data.imageStyle,
          duplicatePreventionLog: data.duplicatePreventionLog,
          uploadPostResponse: data.uploadPostResponse,
          usage: data.usage
        };

        const platformMatch = !platform || post.platform.toLowerCase() === platform.toLowerCase();
        const accountMatch = !account || post.account === account;

        if (platformMatch && accountMatch) {
          posts.push(post);
        }
      });

      setContent(posts);

      const publishedPosts = posts.filter(post => {
        return post.status === 'published' ||
          post.status === 'success' ||
          !!post.uploadPostResponse ||
          !!post.publishedAt ||
          (post.duplicatePreventionLog && post.duplicatePreventionLog.success);
      });

      console.log('📊 Published posts found:', publishedPosts.length);
      console.log('📋 Published posts:', publishedPosts.map(p => ({ id: p.id, status: p.status, platform: p.platform })));

      if (publishedPosts.length > 0) {
        fetchSocialMediaUrls(publishedPosts);
      }
    } catch (error) {
      console.error('Error fetching content from Firebase:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch content from Firebase');
      setContent([]);
    } finally {
      setLoading(false);
    }
  }, [platform, account]);

  const handlePost = async (contentId: string) => {
    setPostingContent(contentId);
    setPostStatus(prev => ({ ...prev, [contentId]: { success: false, message: '' } }));

    try {
      const contentItem = content.find(item => item.id === contentId);
      if (!contentItem) {
        throw new Error('Content not found');
      }

      console.log('🚀 Publishing post to social media:', contentItem);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/socialagent/publish/publish-from-firebase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: contentId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to publish post: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Post published successfully:', result);

      // Update the content item status locally
      setContent(prev => prev.map(item =>
        item.id === contentId
          ? { ...item, status: 'published' as const, publishedAt: new Date().toISOString() }
          : item
      ));

      // Set success status
      setPostStatus(prev => ({ ...prev, [contentId]: { success: true, message: 'Post published to social media!' } }));

      // Wait a moment for the backend to update the post with response data
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Refresh the content to get the latest data from Firebase
      await fetchContent();

      // Retry fetching social media URLs for posts that might not have them yet
      const retryPosts = content.filter(post =>
        post.status === 'published' && !socialMediaUrls[post.id]
      );

      if (retryPosts.length > 0) {
        console.log('🔄 Retrying URL extraction for posts without URLs:', retryPosts.length);
        setTimeout(() => {
          fetchSocialMediaUrls(retryPosts);
        }, 2000); // Wait 2 more seconds before retry
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setPostStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[contentId];
          return newStatus;
        });
      }, 3000);

    } catch (error) {
      console.error('Error publishing post:', error);
      setPostStatus(prev => ({
        ...prev,
        [contentId]: { success: false, message: `Failed to publish: ${error instanceof Error ? error.message : 'Unknown error'}` }
      }));
    } finally {
      setPostingContent(null);
    }
  };

  const deleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const postRef = doc(db, 'socialAgent_generatedPosts', contentId);
      await deleteDoc(postRef);
      setContent(prev => prev.filter(item => item.id !== contentId));
    } catch (error) {
      console.error('Error deleting content from Firebase:', error);
      setError('Failed to delete content from Firebase');
    }
  };

  const handleViewContent = (item: SocialMediaContent) => {
    setSelectedContent(item);
    setShowViewModal(true);
  };

  const handleCopyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const cleanMarkdownFormatting = (content: string): string => {
    return content
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/^---$/gm, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^[\s]*[-*+]\s+/gm, '')
      .replace(/^[\s]*\d+\.\s+/gm, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  };

  useEffect(() => {
    fetchContent();
  }, [platform, account]);

  useEffect(() => {
    if (refreshTrigger) {
      fetchContent();
    }
  }, [refreshTrigger]);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'tiktok': return Music;
      case 'instagram': return Instagram;
      case 'youtube': return Youtube;
      case 'twitter':
      case 'x': return MessageSquare;
      case 'threads': return MessageSquare;
      case 'linkedin': return Linkedin;
      default: return Users;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'tiktok': return 'from-pink-100 to-pink-200';
      case 'instagram': return 'from-purple-100 to-purple-200';
      case 'youtube': return 'from-red-100 to-red-200';
      case 'twitter':
      case 'x': return 'from-blue-100 to-blue-200';
      case 'threads': return 'from-gray-100 to-gray-300';
      case 'linkedin': return 'from-blue-100 to-blue-200';
      default: return 'from-gray-100 to-gray-200';
    }
  };

  // Helper function to get logo paths
  const getLogoPath = (accountId: string) => {
    // Use the new unified logo for all accounts
    return '/logo-load.webp';
  };

  const getPlatformIconSvg = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'tiktok': return '<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>';
      case 'instagram': return '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>';
      case 'youtube': return '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>';
      case 'twitter':
      case 'x': return '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>';
      case 'threads': return '<path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12.006c.03 3.092.723 5.503 2.061 7.17 1.428 1.783 3.627 2.696 6.537 2.717 4.406-.031 7.201-2.055 8.305-6.015l2.04.569c-.652 2.337-1.833 4.177-3.51 5.467-1.783 1.373-4.08 2.078-6.826 2.098z"/>';
      case 'linkedin': return '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>';
      case 'facebook': return '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>';
      case 'pinterest': return '<path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.219.085.339-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-12.013C24.007 5.367 18.641.001.017 0z"/>';
      default: return '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>';
    }
  };

  if (loading) {
    return (
      <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 transition-all duration-500 hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/20 via-transparent to-slate-100/20 opacity-50"></div>

        <div className="relative z-10 flex flex-col items-center gap-6 py-16">
          <div className="relative">
            <div className="p-6 bg-gradient-to-br from-slate-100 to-slate-200/80 rounded-2xl shadow-inner">
              <Loader2 className="h-10 w-10 animate-spin text-slate-600" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200/40 to-transparent rounded-2xl animate-pulse"></div>
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Loading Content
            </h3>
            <p className="text-slate-600 max-w-md leading-relaxed">
              Fetching your {getPlatformDisplayName(platform)} content from Firebase...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 transition-all duration-500 hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/20 via-transparent to-slate-100/20 opacity-50"></div>

        <div className="relative z-10 p-8">
          <div className="group/error relative overflow-hidden bg-gradient-to-r from-red-50/80 to-red-100/60 backdrop-blur-sm border border-red-200/60 rounded-2xl p-6 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-transparent to-red-100/20"></div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="p-3 bg-red-100/80 rounded-xl shadow-inner">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-red-900">Error Loading Content</h3>
                <p className="text-red-700/90 text-sm leading-relaxed">{error}</p>
                <Button
                  onClick={fetchContent}
                  className="mt-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 transition-all duration-500 hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/20 via-transparent to-slate-100/20 opacity-50"></div>

        <div className="relative z-10 p-8 border-b border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-white/50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="group/icon p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/80 shadow-inner transition-all duration-300 hover:shadow-lg hover:scale-105">
              <Hash className="h-7 w-7 text-slate-700 transition-colors duration-300 group-hover/icon:text-slate-800" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                Content Library
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Manage and organize your generated social media content
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-12 text-center">
          <h4 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            No Content Generated Yet
          </h4>
        </div>
      </div>
    );
  }

  if (filteredContent.length === 0 && searchTerm.trim()) {
    return (
      <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 transition-all duration-500 hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/20 via-transparent to-slate-100/20 opacity-50"></div>

        <div className="relative z-10 p-8 border-b border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-white/50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="group/icon p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/80 shadow-inner transition-all duration-300 hover:shadow-lg hover:scale-105">
              <Hash className="h-7 w-7 text-slate-700 transition-colors duration-300 group-hover/icon:text-slate-800" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                Content Library
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Manage and organize your generated social media content
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-12 text-center">
          <div className="relative group/empty">
            <div className="p-6 bg-gradient-to-br from-slate-100 to-slate-200/80 rounded-2xl shadow-inner transition-all duration-300 group-hover/empty:shadow-lg w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <svg className="h-12 w-12 text-slate-400 transition-colors duration-300 group-hover/empty:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200/20 to-transparent rounded-2xl"></div>
          </div>
          <h4 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
            No posts found matching your search
          </h4>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Try searching with different keywords or check your spelling.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredContent.map((item, index) => {
          const Icon = getPlatformIcon(item.platform);
          return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
              onClick={() => handleViewContent(item)}
            >
              {/* Card Header Image */}
              <div className="w-full h-40 sm:h-48 relative overflow-hidden">
                {item.imageUrl ? (
                  <>
                    <img
                      src={item.imageUrl}
                      alt={item.originalTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to platform icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                              <div class="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 relative">
                                <div class="absolute inset-0 bg-gradient-to-br from-slate-400/20 to-slate-500/20"></div>
                                <div class="absolute inset-0 flex items-center justify-center">
                                  <div class="text-center">
                                    <div class="p-4 rounded-2xl bg-gradient-to-br ${getPlatformColor(item.platform)} shadow-lg mb-3">
                                      <svg class="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                                        ${getPlatformIconSvg(item.platform)}
                                      </svg>
                                    </div>
                                    <p class="text-sm text-slate-600 font-medium">Social Post</p>
                                  </div>
                                </div>
                              </div>
                            `;
                        }
                      }}
                    />
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-400/20 to-slate-500/20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-32 h-32">
                          <img
                            src={getLogoPath(item.account)}
                            alt={`${item.account} logo`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${item.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {item.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-2">
                    {item.imageUrl && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Image className="h-3 w-3 mr-1" />
                        IMG
                      </span>
                    )}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {item.characterCount}c
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`p-1 sm:p-1.5 rounded-lg bg-gradient-to-br ${getPlatformColor(item.platform)} shadow-sm`}>
                      <Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-700" />
                    </div>
                    {getPlatformDisplayName(item.platform)}
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 text-sm sm:text-base md:text-lg leading-tight group-hover:text-blue-600 transition-colors">
                  {item.originalTitle}
                </h3>

                <p className="text-gray-600 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-3 sm:mb-4">
                  {cleanMarkdownFormatting(item.content).substring(0, 120)}...
                </p>

                {/* Keywords */}
                {item.keywords && item.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
                    {item.keywords.slice(0, 3).map((keyword, idx) => (
                      <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-slate-200">
                        {keyword}
                      </span>
                    ))}
                    {item.keywords.length > 3 && (
                      <span className="text-xs text-slate-400 px-1.5 sm:px-2 py-0.5 sm:py-1">+{item.keywords.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* View Button */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewContent(item);
                      }}
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-slate-600 hover:text-slate-800 hover:bg-slate-50 border-slate-200 rounded-lg"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>

                    {/* Social Media Link Button - Show when post is published and has a URL */}
                    {item.status === 'published' && (
                      socialMediaUrls[item.id] ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(socialMediaUrls[item.id], '_blank');
                            }}
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200 rounded-lg hover:scale-105 transition-transform"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Post
                          </Button>
                        </motion.div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-gray-400 border-gray-200 cursor-not-allowed"
                          disabled
                        >
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Loading...
                        </Button>
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Publish Button */}
                    {item.status !== 'published' && (
                      <PublishButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePost(item.id);
                        }}
                        disabled={postingContent === item.id || postStatus[item.id]?.success}
                      >
                        {postingContent === item.id ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Publishing...
                          </>
                        ) : postStatus[item.id]?.success ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Published
                          </>
                        ) : (
                          <>
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Publish
                          </>
                        )}
                      </PublishButton>
                    )}

                    {/* Delete Button */}
                    <DeleteButton
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteContent(item.id);
                      }}
                      className="h-8 px-3"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {postStatus[item.id] && !postStatus[item.id].success && postStatus[item.id].message && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-xs text-red-600 font-medium">
                      ❌ {postStatus[item.id].message}
                    </p>
                  </div>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Card-based Modal */}
      {showViewModal && selectedContent && createPortal(
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto max-h-[85vh] overflow-hidden flex flex-col">
            {/* Card Header Image */}
            <div className="w-full h-96 relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
              {selectedContent.imageUrl ? (
                <>
                  <img
                    src={selectedContent.imageUrl}
                    alt={selectedContent.originalTitle}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to logo if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 relative">
                            <div class="absolute inset-0 bg-gradient-to-br from-slate-400/20 to-slate-500/20"></div>
                            <div class="absolute inset-0 flex items-center justify-center">
                              <div class="text-center">
                                                                 <div class="w-48 h-48">
                                   <img 
                                     src="${getLogoPath(selectedContent.account)}" 
                                     alt="${selectedContent.account} logo"
                                     class="w-full h-full object-contain"
                                   />
                                 </div>
                                <p class="text-sm text-slate-600 font-medium mt-2">Social Post</p>
                              </div>
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-400/20 to-slate-500/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-48 h-48">
                        <img
                          src={getLogoPath(selectedContent.account)}
                          alt={`${selectedContent.account} logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-sm text-slate-600 font-medium mt-2">Social Post</p>
                    </div>
                  </div>
                </>
              )}
              <div className="absolute top-4 left-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedContent.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {selectedContent.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(selectedContent.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`p-1 rounded-lg bg-gradient-to-br ${getPlatformColor(selectedContent.platform)} shadow-sm`}>
                      {(() => {
                        const Icon = getPlatformIcon(selectedContent.platform);
                        return <Icon className="h-2.5 w-2.5 text-gray-700" />;
                      })()}
                    </div>
                    {getPlatformDisplayName(selectedContent.platform)}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 text-base leading-tight">
                    {selectedContent.originalTitle}
                  </h3>
                </div>

                {/* Platform and Account Info */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Platform & Account</h4>
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-lg bg-gradient-to-br ${getPlatformColor(selectedContent.platform)} shadow-sm`}>
                      {(() => {
                        const Icon = getPlatformIcon(selectedContent.platform);
                        return <Icon className="h-3 w-3 text-gray-700" />;
                      })()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{getPlatformDisplayName(selectedContent.platform)}</div>
                      <div className="text-xs text-slate-600">
                        {getSocialMediaUrl(selectedContent.platform, selectedContent.account) ? (
                          <a
                            href={getSocialMediaUrl(selectedContent.platform, selectedContent.account)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                          >
                            @{selectedContent.account}
                          </a>
                        ) : (
                          <span>@{selectedContent.account}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keywords */}
                {selectedContent.keywords && selectedContent.keywords.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedContent.keywords.map((keyword, idx) => (
                        <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md border border-blue-200">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Details */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Content Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedContent.tone && (
                      <div className="text-center p-2 bg-slate-50 rounded-lg">
                        <div className="text-sm font-bold text-slate-800">{selectedContent.tone}</div>
                        <div className="text-xs text-slate-600">Tone</div>
                      </div>
                    )}
                    {selectedContent.targetAudience && (
                      <div className="text-center p-2 bg-slate-50 rounded-lg">
                        <div className="text-sm font-bold text-slate-800">{selectedContent.targetAudience}</div>
                        <div className="text-xs text-slate-600">Audience</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Content */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Generated Content</h4>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div
                      className="whitespace-pre-wrap text-slate-800 leading-relaxed text-sm"
                      style={{
                        fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                        lineHeight: '1.5'
                      }}
                    >
                      {cleanMarkdownFormatting(selectedContent.content)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Social Media Link Button for Published Posts */}
                  {selectedContent.status === 'published' && socialMediaUrls[selectedContent.id] && (
                    <button
                      onClick={() => window.open(socialMediaUrls[selectedContent.id], '_blank')}
                      className="h-8 px-3 text-blue-600 hover:text-blue-800 hover:bg-blue-100 border-blue-200 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Post
                    </button>
                  )}

                  <button
                    onClick={() => handleCopyContent(cleanMarkdownFormatting(selectedContent.content))}
                    className="h-8 px-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 border-slate-200 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => setShowViewModal(false)}
                  className="h-8 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors text-xs font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}