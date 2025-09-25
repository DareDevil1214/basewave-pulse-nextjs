'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { getCurrentBranding } from '@/lib/branding';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  RefreshCw,
  BarChart3,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Database,
  CheckCircle,
  Zap,
  Eye,
  ArrowUpRight,
  Search,
  Award,
  Sparkles
} from 'lucide-react';

interface RankingsTabProps {
  rankingLoading: boolean;
  rankingError: string | null;
  rankingData: any;
  topKeywords: any[];
  fetchRankingData: () => void;
  fetchCurrentRankings: () => void;
}

export function RankingsTab({
  rankingLoading,
  rankingError,
  rankingData,
  topKeywords,
  fetchRankingData,
  fetchCurrentRankings
}: RankingsTabProps) {

  if (rankingError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div>
          <div className="bg-white border border-red-200 rounded-xl p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Error Loading Rankings</h3>
                <p className="text-red-600">{rankingError}</p>
              </div>
              <Button 
                onClick={fetchRankingData} 
                className="mt-4 bg-black text-white hover:bg-gray-800 rounded-xl"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!rankingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div>
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Database className="h-8 w-8 text-gray-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">No Ranking Data Available</h3>
                <p className="text-gray-600">Start tracking your keyword rankings to see analytics here.</p>
              </div>
              <Button 
                onClick={fetchCurrentRankings} 
                className="mt-4 bg-black text-white hover:bg-gray-800 rounded-xl"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Fetch Current Rankings
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if we have any actual rankings (found = true)
  const hasActiveRankings = topKeywords.length > 0 && topKeywords.some(k => k.found && k.currentPosition);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full space-y-8">
        {/* Header */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Keyword Rankings</h1>
              <p className="text-gray-600 mt-1 sm:mt-1 mt-4">Track your search engine performance</p>
            </div>
            <Button 
              onClick={fetchCurrentRankings}
              disabled={rankingLoading}
              className="bg-black text-white hover:bg-gray-800 rounded-xl px-6 py-2 self-start sm:self-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${rankingLoading ? 'animate-spin' : ''}`} />
              {rankingLoading ? 'Fetching...' : 'Update Rankings'}
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-black rounded-xl p-6 hover:bg-gray-50 transition-colors">
              <div className="space-y-2">
                <h3 className="text-sm font-normal text-black">Keywords Tracked</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-normal text-black">{rankingData.totalKeywords}</span>
                </div>
                <p className="text-sm text-gray-600">Total monitoring targets</p>
              </div>
            </div>
            
            <div className="bg-white border border-black rounded-xl p-6 hover:bg-gray-50 transition-colors">
              <div className="space-y-2">
                <h3 className="text-sm font-normal text-black">Top 100 Rankings</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-normal text-black">{rankingData.top100Keywords || 0}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {hasActiveRankings ? 'Keywords ranking in top 100' : 'Keywords to target'}
                </p>
              </div>
            </div>
            
            <div className="bg-white border border-black rounded-xl p-6 hover:bg-gray-50 transition-colors">
              <div className="space-y-2">
                <h3 className="text-sm font-normal text-black">
                  {hasActiveRankings ? 'Avg Position' : 'SEO Potential'}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-normal text-black">
                    {hasActiveRankings ? `#${rankingData.averagePosition || 0}` : 'High'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {hasActiveRankings ? 'Average ranking position' : 'Opportunity for growth'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div>
          {!hasActiveRankings ? (
            <div className="bg-white border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-full">
                  <Sparkles className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">SEO Opportunity Detected</h3>
                  <p className="text-gray-600 mb-4">
                    Your domain (<span className="font-semibold">{getCurrentBranding().website}</span>) is not currently ranking in the top 100 results for most target keywords. 
                    This represents a significant SEO opportunity!
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Next Steps:</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Optimize existing pages for target keywords</li>
                        <li>• Create new content targeting these terms</li>
                        <li>• Build domain authority through backlinks</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Tracking Status:</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• {rankingData.totalKeywords} keywords being monitored</li>
                        <li>• Rankings checked against top 100 results</li>
                        <li>• Data updates available on-demand</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-emerald-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 rounded-full">
                  <Award className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Rankings Detected! 🎉</h3>
                  <p className="text-gray-600 mb-4">
                    Great progress! Your domain (<span className="font-semibold">{getCurrentBranding().website}</span>) is ranking for {rankingData.top100Keywords || 0} keywords in the top 100 results.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Current Performance:</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• {rankingData.top100Keywords || 0} keywords ranking in top 100</li>
                        <li>• {rankingData.top10Keywords || 0} keywords in top 10 positions</li>
                        <li>• Average position: {rankingData.averagePosition || 'N/A'}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Optimization Tips:</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Focus on improving page 2+ rankings to page 1</li>
                        <li>• Create more content for non-ranking keywords</li>
                        <li>• Build internal links to boost ranking pages</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Keywords List */}
        <div>
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 text-center">Keyword Rankings</h3>
          </div>
          {topKeywords.length > 0 ? (
              <div className="p-6">
                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            #
                          </th>
                          <th scope="col" className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Keyword
                          </th>
                          <th scope="col" className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Volume
                          </th>
                          <th scope="col" className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Position
                          </th>
                          <th scope="col" className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Change
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {topKeywords.slice(0, 20).map((keyword, index) => (
                          <tr key={index} className={`transition-all duration-300 ${
                            index % 2 === 0
                              ? 'bg-white hover:bg-gray-50'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}>
                            <td className="px-3 lg:px-4 xl:px-6 py-4 whitespace-nowrap">
                              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xs">{index + 1}</span>
                              </div>
                            </td>
                            <td className="px-3 lg:px-4 xl:px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {keyword.keyword}
                              </div>
                            </td>
                            <td className="px-3 lg:px-4 xl:px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {keyword.searchVolume?.toLocaleString() || 'N/A'}
                              </div>
                            </td>
                            <td className="px-3 lg:px-4 xl:px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {keyword.found && keyword.currentPosition ? `#${keyword.currentPosition}` : 'Not Ranking'}
                              </div>
                            </td>
                            <td className="px-3 lg:px-4 xl:px-6 py-4 whitespace-nowrap">
                              {keyword.found && keyword.currentPosition ? (
                                <Badge
                                  variant="outline"
                                  className={`text-xs rounded-full ${
                                    keyword.change.startsWith('+') ? 'border-green-400 text-green-700' :
                                    keyword.change.startsWith('-') ? 'border-red-400 text-red-700' : 'border-gray-400 text-gray-700'
                                  }`}
                                >
                                  {keyword.change}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs rounded-full border-gray-400 text-gray-700">
                                  N/A
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tablet View */}
                <div className="hidden md:block lg:hidden bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            #
                          </th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Keyword
                          </th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Position
                          </th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Change
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {topKeywords.slice(0, 20).map((keyword, index) => (
                          <tr key={index} className={`transition-all duration-300 ${
                            index % 2 === 0
                              ? 'bg-white hover:bg-gray-50'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xs">{index + 1}</span>
                              </div>
                            </td>
                            <td className="px-3 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {keyword.keyword.length > 50
                                  ? `${keyword.keyword.substring(0, 50)}...`
                                  : keyword.keyword
                                }
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {keyword.found && keyword.currentPosition ? `#${keyword.currentPosition}` : 'Not Ranking'}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              {keyword.found && keyword.currentPosition ? (
                                <Badge
                                  variant="outline"
                                  className={`text-xs rounded-full ${
                                    keyword.change.startsWith('+') ? 'border-green-400 text-green-700' :
                                    keyword.change.startsWith('-') ? 'border-red-400 text-red-700' : 'border-gray-400 text-gray-700'
                                  }`}
                                >
                                  {keyword.change}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs rounded-full border-gray-400 text-gray-700">
                                  N/A
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {topKeywords.slice(0, 10).map((keyword, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {keyword.keyword}
                          </h4>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Volume:</span>
                          <span className="ml-2 text-gray-900">{keyword.searchVolume?.toLocaleString() || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Position:</span>
                          <span className="ml-2 text-gray-900">
                            {keyword.found && keyword.currentPosition ? `#${keyword.currentPosition}` : 'Not Ranking'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 justify-start">
                        {keyword.found && keyword.currentPosition ? (
                          <Badge
                            variant="outline"
                            className={`text-xs rounded-full ${
                              keyword.change.startsWith('+') ? 'border-green-400 text-green-700' :
                              keyword.change.startsWith('-') ? 'border-red-400 text-red-700' : 'border-gray-400 text-gray-700'
                            }`}
                          >
                            {keyword.change}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs rounded-full border-gray-400 text-gray-700">
                            N/A
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Target className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">No keywords found</h3>
                    <p className="text-gray-600">Add keywords to your monitoring list to start tracking rankings.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}