'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Loader2,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle,
  Sparkles,
  Globe
} from 'lucide-react';
import { BestKeyword } from '@/lib/firebase';
import { fetchKeywordsFromBackend, addKeywordToBackend, updateKeywordInBackend, deleteKeywordFromBackend } from '@/lib/backend-api';
import { formatNumber } from '@/hooks/useKeywordStrategies';
import { generateAndSaveOpportunity } from '@/lib/opportunity-generator';
import { CompetitorKeywordModal } from './CompetitorKeywordModal';
import { SuccessToast } from '@/components/ui/SuccessToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CVMakerKeywordsSectionProps {
  portal?: string;
}

export function CVMakerKeywordsSection({ portal = 'cv-maker' }: CVMakerKeywordsSectionProps) {
  const [keywords, setKeywords] = useState<BestKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingKeyword, setEditingKeyword] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [generatingOpportunity, setGeneratingOpportunity] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showCompetitorModal, setShowCompetitorModal] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);

  // Fetch keywords from backend API
  const fetchKeywords = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching keywords from backend API...');

      const keywordsData = await fetchKeywordsFromBackend();

      if (!keywordsData || keywordsData.length === 0) {
        console.log('⚠️ No keywords found from backend API');
        setKeywords([]);
        return;
      }

      console.log(`✅ Found ${keywordsData.length} keywords from backend API`);
      setKeywords(keywordsData);

    } catch (error) {
      console.error('❌ Error fetching keywords from backend:', error);
      setKeywords([]);
    } finally {
      setLoading(false);
    }
  };

  // Add new keyword via backend API
  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;

    setUpdating(true);
    try {
      const keywordData = {
        keyword: newKeyword.trim(),
        volume: 0,
        difficulty: 0,
        opportunity: 'Medium',
        intent: 'Commercial',
        cpc: 0,
        position: 0,
        seoScore: 0,
        searchVolume: 0,
        trafficEstimate: 0,
        competition: 'unknown',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addKeywordToBackend(keywordData);

      setNewKeyword('');
      setShowAddForm(false);
      await fetchKeywords();
    } catch (error) {
      console.error('Error adding keyword:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Update keyword via backend API
  const handleUpdateKeyword = async (keywordId: string, newKeyword: string) => {
    setUpdating(true);
    try {
      const updateData = {
        keyword: newKeyword.trim(),
        updatedAt: new Date().toISOString()
      };

      await updateKeywordInBackend(keywordId, updateData);

      await fetchKeywords();
    } catch (error) {
      console.error('Error updating keyword:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Delete keyword via backend API
  const handleDeleteKeyword = async (keywordId: string) => {
    setDeletingId(keywordId);
    try {
      await deleteKeywordFromBackend(keywordId);

      await fetchKeywords();
    } catch (error) {
      console.error('Error deleting keyword:', error);
    } finally {
      setDeletingId(null);
    }
  };

  // Load keywords on component mount
  useEffect(() => {
    fetchKeywords();
  }, []);

  const handleEdit = (keyword: BestKeyword) => {
    setEditingId(keyword.id);
    setEditingKeyword(keyword.keyword || '');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingKeyword('');
  };

  const handleDelete = async (keywordId: string) => {
    await handleDeleteKeyword(keywordId);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewKeyword('');
  };

  // Generate opportunity from keyword
  const handleGenerateOpportunity = async (keyword: string) => {
    setGeneratingOpportunity(keyword);
    try {
      const result = await generateAndSaveOpportunity(keyword, 'cv-maker');
      
      if (result.success) {
        setToastMessage(`Opportunity generated successfully!`);
        setShowSuccessToast(true);
      } else {
        setToastMessage(`Failed to generate opportunity: ${result.message}`);
        setShowSuccessToast(true);
      }
    } catch (error) {
      console.error('Error generating opportunity:', error);
      setToastMessage('Failed to generate opportunity. Please try again.');
      setShowSuccessToast(true);
    } finally {
      setGeneratingOpportunity(null);
    }
  };

  // Handle competitor keyword extraction success
  const handleCompetitorKeywordsSuccess = async (keywords: string[]) => {
    try {
      // Convert keywords to BestKeyword format
      const bestKeywords: BestKeyword[] = keywords.map(keyword => ({
        keyword: keyword.trim(),
        volume: 0,
        cpc: 0,
        competition: 0,
        difficulty: 0,
        trends: []
      }));

      // Add each keyword via backend API
      for (const bestKeyword of bestKeywords) {
        await addKeywordToBackend(bestKeyword);
      }

      await fetchKeywords();
      setToastMessage(`Successfully added ${keywords.length} keywords from competitors!`);
      setShowSuccessToast(true);
    } catch (error) {
      console.error('Error adding competitor keywords:', error);
      setToastMessage('Failed to add competitor keywords. Please try again.');
      setShowSuccessToast(true);
    }
  };

  const handleSave = async () => {
    if (!editingId || !editingKeyword.trim()) return;

    await handleUpdateKeyword(editingId, editingKeyword);
    setEditingId(null);
    setEditingKeyword('');
  };

  // Render portal name
  const renderPortalName = () => {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-base text-gray-600 italic font-medium">
          CV Maker
        </span>
      </div>
    );
  };

  // Handle click outside to cancel edit
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingId && editRef.current && !editRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && editingId) {
        handleCancel();
      }
    };

    if (editingId) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [editingId]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto animate-pulse"></div>
        </motion.div>

        {/* Desktop Table Skeleton */}
        <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-4 md:px-6 py-3">
            <div className="grid grid-cols-4 gap-4">
              <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="px-4 md:px-6 py-4">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Card Skeleton */}
        <div className="md:hidden space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-4 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (keywords.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gray-100 rounded-xl">
            <Target className="w-6 h-6 text-gray-900" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">CV Maker Keywords</h2>
            <p className="text-gray-600">Manage your CV Maker keywords and targeting</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No keywords found</h3>
          <p className="text-gray-500">This portal doesn't have any keywords yet.</p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="mt-4 bg-black text-white hover:bg-gray-800 rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Keyword
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between relative"
      >
        <div className="flex-1"></div>
        <h3 className="text-3xl font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
        Keyword Management
        </h3>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCompetitorModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium"
          >
            <Globe className="w-4 h-4" />
            Add Competitor
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Cancel' : 'Add Keyword'}
          </motion.button>
        </div>
      </motion.div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 md:px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th scope="col" className="px-4 md:px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Keyword
              </th>
              <th scope="col" className="px-4 md:px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Volume
              </th>
              <th scope="col" className="px-4 md:px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulty
              </th>
              <th scope="col" className="px-4 md:px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metrics
              </th>
              <th scope="col" className="px-4 md:px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Add New Keyword Row */}
            <AnimatePresence>
              {showAddForm && (
                <motion.tr
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="bg-blue-50 border-b border-blue-200"
                >
                  <td className="px-4 md:px-6 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 text-center">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                      placeholder="Enter keyword..."
                      autoFocus
                    />
                  </td>
                  <td className="px-4 md:px-6 py-3 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">0</div>
                  </td>
                  <td className="px-4 md:px-6 py-3 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">—</div>
                  </td>
                  <td className="px-4 md:px-6 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <Badge variant="outline" className="text-xs rounded-full border-yellow-400 text-yellow-700">
                        Medium
                      </Badge>
                      <Badge variant="outline" className="text-xs rounded-full border-gray-400 text-gray-700">
                        Commercial
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddKeyword}
                        disabled={updating || !newKeyword.trim()}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-xs font-medium"
                      >
                        {updating ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Plus className="w-3 h-3" />
                        )}
                        Add
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCancelAdd}
                        disabled={updating}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-all duration-200 text-xs font-medium"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>


            {keywords.map((keyword, index) => {
              const isEditing = editingId === keyword.id;

              return (
                <motion.tr
                  key={keyword.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`transition-all duration-300 ${
                    isEditing
                      ? 'bg-gray-50'
                      : index % 2 === 0
                        ? 'bg-white hover:bg-gray-50'
                        : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <td className="px-4 md:px-6 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">{index + 1}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 text-center h-16">
                    {isEditing ? (
                      <motion.div
                        ref={editRef}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="w-full space-y-2 flex flex-col justify-center"
                        style={{ minHeight: '40px' }}
                      >
                        <input
                          type="text"
                          value={editingKeyword}
                          onChange={(e) => setEditingKeyword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                          placeholder="Enter keyword..."
                          autoFocus
                        />
                        <motion.div
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSave}
                            disabled={updating}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all duration-200 text-xs font-medium"
                          >
                            {updating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Save className="w-3 h-3" />
                            )}
                            Save
                          </motion.button>
                          <motion.button
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCancel}
                            disabled={updating}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-all duration-200 text-xs font-medium"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </motion.button>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={`normal-${keyword.id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: '40px' }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="text-base font-medium text-gray-900 flex items-center justify-center"
                        style={{ height: '40px' }}
                      >
                        {keyword.keyword}
                      </motion.div>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-3 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">
                      {formatNumber(keyword.volume || keyword.searchVolume)}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">
                      {keyword.difficulty || '—'}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center gap-2 justify-center">
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
                  <td className="px-4 md:px-6 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      {!isEditing && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEdit(keyword)}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 text-xs font-medium"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(keyword.id)}
                            disabled={deletingId === keyword.id}
                            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all duration-200 text-xs font-medium"
                          >
                            {deletingId === keyword.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                            Delete
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleGenerateOpportunity(keyword.keyword)}
                            disabled={generatingOpportunity === keyword.keyword}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 text-xs font-medium"
                          >
                            {generatingOpportunity === keyword.keyword ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3" />
                            )}
                            Generate
                          </motion.button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {/* Mobile Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="border border-blue-200 rounded-xl p-4 bg-blue-50"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portal
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                    {renderPortalName()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keyword
                  </label>
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                    placeholder="Enter keyword..."
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddKeyword}
                    disabled={updating || !newKeyword.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Add Keyword
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancelAdd}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-all duration-200 text-sm font-medium"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {keywords.map((keyword, index) => {
          const isEditing = editingId === keyword.id;

          return (
            <motion.div
              key={keyword.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`border border-gray-200 rounded-xl p-4 transition-all duration-300 ${
                isEditing ? 'ring-2 ring-gray-500/20 bg-gray-50' : 'hover:bg-gray-50'
              }`}
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{index + 1}</span>
                  </div>
                  <div>
                    <div className="mb-2">
                      {isEditing ? (
                        <motion.div
                          ref={editRef}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="space-y-2"
                        >
                          <input
                            type="text"
                            value={editingKeyword}
                            onChange={(e) => setEditingKeyword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                            placeholder="Enter keyword..."
                            autoFocus
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={handleSave}
                              disabled={updating}
                              className="flex items-center gap-1 px-2 py-1 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all duration-200 text-xs font-medium"
                            >
                              {updating ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Save className="w-3 h-3" />
                              )}
                              Save
                            </Button>
                            <Button
                              onClick={handleCancel}
                              disabled={updating}
                              className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-all duration-200 text-xs font-medium"
                            >
                              <X className="w-3 h-3" />
                              Cancel
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="text-base font-medium text-gray-900">
                          {keyword.keyword}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Volume:</span>
                        <span className="ml-2 text-gray-900">{formatNumber(keyword.volume || keyword.searchVolume)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Difficulty:</span>
                        <span className="ml-2 text-gray-900">{keyword.difficulty || '—'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-start mb-3">
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
                    {renderPortalName()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isEditing && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(keyword)}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 text-xs font-medium"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(keyword.id)}
                        disabled={deletingId === keyword.id}
                        className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all duration-200 text-xs font-medium"
                      >
                        {deletingId === keyword.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        Delete
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleGenerateOpportunity(keyword.keyword)}
                        disabled={generatingOpportunity === keyword.keyword}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 text-xs font-medium"
                      >
                        {generatingOpportunity === keyword.keyword ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        Generate
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Competitor Keyword Modal */}
      <CompetitorKeywordModal
        isOpen={showCompetitorModal}
        onClose={() => setShowCompetitorModal(false)}
        onSuccess={handleCompetitorKeywordsSuccess}
        portal="cv-maker"
      />

      {/* Success Toast */}
      <SuccessToast
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        title="Success!"
        message={toastMessage}
        duration={4000}
      />
    </div>
  );
}
