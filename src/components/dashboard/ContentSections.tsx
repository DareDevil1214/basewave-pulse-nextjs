import { Badge } from '@/components/ui/badge';
import { Hash } from 'lucide-react';
import { ContentSection } from './ContentSection';
import { formatDate, getPlatformIcon, getContentTypeIcon } from './DashboardUtils';

interface RecentBlog {
  id: string;
  title: string;
  portal: string;
  createdAt: string;
  status: string;
  wordCount?: number;
}

interface RecentSocialPost {
  id: string;
  title: string;
  platform: string;
  createdAt: string;
  status: string;
  account: string;
}

interface ScheduledItem {
  id: string;
  title: string;
  type: 'blog' | 'social';
  scheduledDate: string;
  platform?: string;
  status: string;
  portal?: string;
  keywords?: string[];
}

interface BestKeyword {
  id?: string;
  keyword: string;
  volume?: number;
  difficulty?: number;
}

interface ContentSectionsProps {
  recentBlogs: RecentBlog[];
  recentSocialPosts: RecentSocialPost[];
  scheduledItems: ScheduledItem[];
  topKeywords: BestKeyword[];
  loading: boolean;
}

export function ContentSections({ 
  recentBlogs, 
  recentSocialPosts, 
  scheduledItems, 
  topKeywords, 
  loading 
}: ContentSectionsProps) {
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Blog Posts */}
        <ContentSection
          title="Recent Blog Posts"
          loading={loading}
          skeletonCount={4}
        >
          <div className="space-y-4">
            {recentBlogs.length > 0 ? (
              recentBlogs.map((blog) => (
                <div key={blog.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="space-y-3">
                    <h4 className="font-normal text-black line-clamp-2 text-base">
                      {blog.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-600 flex-shrink-0">
                          {getContentTypeIcon(blog.portal)}
                        </div>
                        <span className="text-sm text-gray-500 flex-shrink-0">
                          {formatDate(blog.createdAt)}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs bg-gray-50 whitespace-nowrap">
                        {blog.portal}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="font-medium">No blog posts yet</p>
                <p className="text-sm">Create your first blog to see it here</p>
              </div>
            )}
          </div>
        </ContentSection>

        {/* Recent Social Posts */}
        <ContentSection
          title="Recent Social Posts"
          loading={loading}
          skeletonCount={4}
        >
          <div className="space-y-4">
            {recentSocialPosts.length > 0 ? (
              recentSocialPosts.map((post) => (
                <div key={post.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="space-y-3">
                    <h4 className="font-normal text-black line-clamp-2 text-base">
                      {post.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-600 flex-shrink-0">
                          {getPlatformIcon(post.platform)}
                        </div>
                        <span className="text-sm text-gray-500 flex-shrink-0">
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs bg-gray-50 whitespace-nowrap">
                        {post.account}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="font-medium">No social posts yet</p>
                <p className="text-sm">Create your first post to see it here</p>
              </div>
            )}
          </div>
        </ContentSection>

        {/* Scheduled Content */}
        <ContentSection
          title="Scheduled Content"
          loading={loading}
          skeletonCount={3}
        >
          <div className="space-y-4">
            {scheduledItems.length > 0 ? (
              scheduledItems.map((item) => (
                <div key={item.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="space-y-3">
                    <h4 className="font-normal text-black line-clamp-2 text-base">
                      {item.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-600 flex-shrink-0">
                          {getContentTypeIcon(item.type)}
                        </div>
                        <span className="text-sm text-gray-500 flex-shrink-0">
                          {formatDate(item.scheduledDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.platform && item.type === 'social' && (
                          <div className="text-gray-600">
                            {getPlatformIcon(item.platform)}
                          </div>
                        )}
                        {item.portal && (
                          <Badge variant="outline" className="text-xs bg-gray-50 whitespace-nowrap">
                            {item.portal}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="font-medium">No scheduled content</p>
                <p className="text-sm">Schedule content to see it here</p>
              </div>
            )}
          </div>
        </ContentSection>

        {/* Top Keywords & Rankings */}
        <ContentSection
          title="Top Keywords & Rankings"
          loading={loading}
          skeletonCount={5}
        >
          <div className="space-y-4">
            {topKeywords.length > 0 ? (
              topKeywords.map((keyword, index) => (
                <div key={keyword.id || index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center text-sm font-normal text-black">
                          <Hash className="w-4 h-4 mr-1" />
                          <span>{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-normal text-black text-base">{keyword.keyword}</h4>
                          <p className="text-sm text-gray-500">
                            Volume: {keyword.volume?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-normal text-black">
                          Difficulty: {keyword.difficulty || 'N/A'}
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs mt-1 rounded-full whitespace-nowrap ${(keyword.difficulty || 0) < 30 ? 'border-gray-400 text-gray-700' :
                              (keyword.difficulty || 0) < 60 ? 'border-gray-600 text-gray-800' :
                                'border-black text-black'
                            }`}
                        >
                          {(keyword.difficulty || 0) < 30 ? 'Easy' :
                            (keyword.difficulty || 0) < 60 ? 'Medium' : 'Hard'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="font-medium">No keywords tracked</p>
                <p className="text-sm">Add keywords to see rankings here</p>
              </div>
            )}
          </div>
        </ContentSection>
      </div>
    </div>
  );
}
