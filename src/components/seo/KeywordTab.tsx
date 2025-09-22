'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Target,
  RefreshCw,
  X,
  Loader2

} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { formatNumber } from '@/hooks/useKeywordStrategies';

interface KeywordTabProps {
  firebaseLoading?: boolean;
  firebaseError?: string | null;
  firebaseBestKeywords?: any[];
  loadFirebaseData?: () => void;
  lastRefreshTime?: string;
  selectedFilter: string;
  pageGenerationLoading: string | null;
  isAnyPageGenerating: boolean;
  onTabChange?: (tab: string) => void;
}

export function KeywordTab({
  firebaseLoading = false,
  firebaseError = null,
  firebaseBestKeywords = [],
  loadFirebaseData,
  lastRefreshTime,
  selectedFilter,
  onTabChange,
}: KeywordTabProps) {

  // Use Firebase best_keywords data for CV Maker tab
  const keywordsToDisplay: any[] = firebaseBestKeywords;

  // Add state for New People keywords from portalKeywords collection
  const [newpeopleKeywords, setNewpeopleKeywords] = useState<any[]>([]);
  const [portalLoading, setPortalLoading] = useState(false);

  // Fetch keywords from portalKeywords collection for New People tab
  const fetchNewpeopleKeywords = async () => {
    setPortalLoading(true);
    try {
      console.log('🔍 Fetching newpeople keywords from portalKeywords collection...');

      // Query the portalKeywords collection for documents with portal = "newpeople"
      const q = query(collection(db, 'portalKeywords'), where('portal', '==', 'newpeople'));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('⚠️ No newpeople keywords found in portalKeywords collection');
        setNewpeopleKeywords([]);
        return;
      }

      const keywords: any[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const keywordList = data.keywords || [];

        // Convert each keyword in the array to the expected format
        keywordList.forEach((keyword: string, index: number) => {
          keywords.push({
            id: `${doc.id}_${index}`,
            keyword: keyword,
            volume: 0, // Default values since not provided in collection
            difficulty: 0,
            opportunity: 'Medium',
            intent: 'Commercial',
            cpc: 0,
            position: 0,
            seoScore: 0,
            searchVolume: 0,
            trafficEstimate: 0,
            competition: 'unknown',
            serpFeatures: []
          });
        });
      });

      console.log(`✅ Found ${keywords.length} newpeople keywords`);
      setNewpeopleKeywords(keywords);

    } catch (error) {
      console.error('❌ Error fetching newpeople keywords:', error);
      setNewpeopleKeywords([]);
    } finally {
      setPortalLoading(false);
    }
  };

  // Fetch newpeople keywords when tab changes to New People
  useEffect(() => {
    if (selectedFilter === 'New People') {
      fetchNewpeopleKeywords();
    }
  }, [selectedFilter]);

  // Filter keywords based on selected tab
  const filteredKeywords = useMemo(() => {
    if (selectedFilter === 'CV Maker') {
      return keywordsToDisplay; // From best_keywords collection
    } else if (selectedFilter === 'New People') {
      return newpeopleKeywords; // From portalKeywords collection
    }
    return [];
  }, [keywordsToDisplay, newpeopleKeywords, selectedFilter]);


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full space-y-8">
        {/* Header */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Keyword Performance</h1>
              <p className="text-gray-600 mt-1 sm:mt-1">Analyze your keyword data and performance metrics</p>
            </div>
            {loadFirebaseData && (
              <Button
                onClick={loadFirebaseData}
                disabled={firebaseLoading}
                className="bg-black text-white hover:bg-gray-800 rounded-xl px-6 py-2 self-start sm:self-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${firebaseLoading ? 'animate-spin' : ''}`} />
                {firebaseLoading ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            )}
          </div>
        </div>

        {/* Sub Tab Selection */}
        <div className="flex justify-center">
          <div className="bg-white border border-gray-200 rounded-xl p-1 inline-flex">
            <button
              className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                selectedFilter === 'CV Maker'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => {
                if (onTabChange) {
                  onTabChange('CV Maker');
                }
              }}
            >
              CV Maker
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                selectedFilter === 'New People'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => {
                if (onTabChange) {
                  onTabChange('New People');
                }
              }}
            >
              New People
            </button>
          </div>
        </div>



        {/* Error State */}
        {firebaseError && (
          <div>
            <div className="bg-white border border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-red-900">Error Loading Data</h3>
                  <p className="text-red-700 text-sm">{firebaseError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {((selectedFilter === 'CV Maker' && firebaseLoading) ||
          (selectedFilter === 'New People' && portalLoading)) && (
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded-xl w-32 animate-pulse"></div>
              </div>
            </div>

            {/* Tab Selection Skeleton */}
            <div className="flex justify-center">
              <div className="bg-white border border-gray-200 rounded-xl p-1 inline-flex">
                <div className="w-20 h-10 bg-gray-200 rounded-lg mx-1 animate-pulse"></div>
                <div className="w-24 h-10 bg-gray-200 rounded-lg mx-1 animate-pulse"></div>
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                          <div className="flex-1 min-w-0">
                            <div className="h-5 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:text-right space-y-2 sm:space-y-1">
                          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                          <div className="flex items-center gap-2 sm:justify-end">
                            <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredKeywords.length === 0 &&
          ((selectedFilter === 'CV Maker' && !firebaseLoading) ||
           (selectedFilter === 'New People' && !portalLoading)) && (
          <div>
            <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <Target className="h-8 w-8 text-gray-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedFilter === 'CV Maker' ? 'No CV Maker Keywords' : 'No New People Keywords'}
                  </h3>
                  <p className="text-gray-600">
                    {selectedFilter === 'CV Maker'
                      ? 'No keywords found in the best_keywords collection.'
                      : 'No keywords found for New People portal in portalKeywords collection.'
                    }
                  </p>
                </div>
                {selectedFilter === 'CV Maker' && loadFirebaseData && (
                  <Button
                    onClick={loadFirebaseData}
                    className="mt-4 bg-black text-white hover:bg-gray-800 rounded-xl"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                )}
                {selectedFilter === 'New People' && (
                  <Button
                    onClick={() => fetchNewpeopleKeywords()}
                    className="mt-4 bg-black text-white hover:bg-gray-800 rounded-xl"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CV Maker Tab */}
        {selectedFilter === 'CV Maker' && (
          /* CV Maker - Keywords from best_keywords collection */
          filteredKeywords.length > 0 ? (
            <div>
              {/* Desktop Table View - Responsive for different screen sizes */}
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
                          Difficulty
                        </th>
                        <th scope="col" className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Metrics
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredKeywords.map((keyword, index) => (
                        <tr key={keyword.id || index} className={`transition-all duration-300 ${
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
                              {formatNumber(keyword.volume || keyword.searchVolume)}
                            </div>
                          </td>
                          <td className="px-3 lg:px-4 xl:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {keyword.difficulty || '—'}
                            </div>
                          </td>
                          <td className="px-3 lg:px-4 xl:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 justify-start">
                              <Badge
                                variant="outline"
                                className={`text-xs rounded-full ${
                                  keyword.opportunity === 'High' ? 'border-green-400 text-green-700' :
                                  keyword.opportunity === 'Medium' ? 'border-yellow-400 text-yellow-700' : 'border-red-400 text-red-700'
                                }`}
                              >
                                {keyword.opportunity || 'Medium'}
                              </Badge>
                              <Badge variant="outline" className="text-xs rounded-full border-gray-400 text-gray-700">
                                {keyword.intent || 'Commercial'}
                              </Badge>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tablet View - For medium screens (768px - 1024px) */}
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
                          Volume
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Metrics
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredKeywords.map((keyword, index) => (
                        <tr key={keyword.id || index} className={`transition-all duration-300 ${
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
                              {formatNumber(keyword.volume || keyword.searchVolume)}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 justify-start">
                              <Badge
                                variant="outline"
                                className={`text-xs rounded-full ${
                                  keyword.opportunity === 'High' ? 'border-green-400 text-green-700' :
                                  keyword.opportunity === 'Medium' ? 'border-yellow-400 text-yellow-700' : 'border-red-400 text-red-700'
                                }`}
                              >
                                {keyword.opportunity || 'Medium'}
                              </Badge>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                    {filteredKeywords.map((keyword, index) => (
                  <div key={keyword.id || index} className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors duration-200">
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
                        <span className="ml-2 text-gray-900">{formatNumber(keyword.volume || keyword.searchVolume)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Difficulty:</span>
                        <span className="ml-2 text-gray-900">{keyword.difficulty || '—'}</span>
                      </div>
                            </div>
                    <div className="flex items-center gap-2 mt-3 justify-start">
                              <Badge
                                variant="outline"
                                className={`text-xs rounded-full ${
                                  keyword.opportunity === 'High' ? 'border-green-400 text-green-700' :
                                  keyword.opportunity === 'Medium' ? 'border-yellow-400 text-yellow-700' : 'border-red-400 text-red-700'
                                }`}
                              >
                                {keyword.opportunity || 'Medium'}
                              </Badge>
                              <Badge variant="outline" className="text-xs rounded-full border-gray-400 text-gray-700">
                                {keyword.intent || 'Commercial'}
                              </Badge>
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          ) : (
            /* Empty state for New People */
            <div>
              <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Target className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">No Keywords Available</h3>
                    <p className="text-gray-600">No keyword data found for New People portal.</p>
                  </div>
                  <Button
                    onClick={() => fetchNewpeopleKeywords()}
                    className="mt-4 bg-black text-white hover:bg-gray-800 rounded-xl"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>
              </div>
            </div>
          )
        )}

        {/* New People Tab */}
        {selectedFilter === 'New People' && (
          /* New People - Keywords from portalKeywords collection */
          filteredKeywords.length > 0 ? (
            <div>
              {/* Desktop Table View - Responsive for different screen sizes */}
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
                          Difficulty
                        </th>
                        <th scope="col" className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Metrics
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredKeywords.map((keyword, index) => (
                        <tr key={keyword.id || index} className={`transition-all duration-300 ${
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
                              {formatNumber(keyword.volume || keyword.searchVolume)}
                            </div>
                          </td>
                          <td className="px-3 lg:px-4 xl:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {keyword.difficulty || '—'}
                            </div>
                          </td>
                          <td className="px-3 lg:px-4 xl:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 justify-start">
                              <Badge
                                variant="outline"
                                className={`text-xs rounded-full ${
                                  keyword.opportunity === 'High' ? 'border-green-400 text-green-700' :
                                  keyword.opportunity === 'Medium' ? 'border-yellow-400 text-yellow-700' : 'border-red-400 text-red-700'
                                }`}
                              >
                                {keyword.opportunity || 'Medium'}
                              </Badge>
                              <Badge variant="outline" className="text-xs rounded-full border-gray-400 text-gray-700">
                                {keyword.intent || 'Commercial'}
                              </Badge>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tablet View - For medium screens (768px - 1024px) */}
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
                          Volume
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Metrics
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredKeywords.map((keyword, index) => (
                        <tr key={keyword.id || index} className={`transition-all duration-300 ${
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
                              {formatNumber(keyword.volume || keyword.searchVolume)}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 justify-start">
                              <Badge
                                variant="outline"
                                className={`text-xs rounded-full ${
                                  keyword.opportunity === 'High' ? 'border-green-400 text-green-700' :
                                  keyword.opportunity === 'Medium' ? 'border-yellow-400 text-yellow-700' : 'border-red-400 text-red-700'
                                }`}
                              >
                                {keyword.opportunity || 'Medium'}
                              </Badge>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredKeywords.map((keyword, index) => (
                  <div key={keyword.id || index} className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors duration-200">
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
                        <span className="ml-2 text-gray-900">{formatNumber(keyword.volume || keyword.searchVolume)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Difficulty:</span>
                        <span className="ml-2 text-gray-900">{keyword.difficulty || '—'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 justify-start">
                      <Badge
                        variant="outline"
                        className={`text-xs rounded-full ${
                          keyword.opportunity === 'High' ? 'border-green-400 text-green-700' :
                          keyword.opportunity === 'Medium' ? 'border-yellow-400 text-yellow-700' : 'border-red-400 text-red-700'
                        }`}
                      >
                        {keyword.opportunity || 'Medium'}
                      </Badge>
                      <Badge variant="outline" className="text-xs rounded-full border-gray-400 text-gray-700">
                        {keyword.intent || 'Commercial'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Empty state for New People */
            <div>
              <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Target className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">No Keywords Available</h3>
                    <p className="text-gray-600">No keyword data found for New People portal.</p>
                  </div>
                  <Button
                    onClick={() => fetchNewpeopleKeywords()}
                    className="mt-4 bg-black text-white hover:bg-gray-800 rounded-xl"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>
              </div>
            </div>
          )
        )}

      </div>
    </div>
  );
}