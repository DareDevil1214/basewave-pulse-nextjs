'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Article } from '@/lib/opportunities-firebase';
import { OpportunityCard } from './OpportunityCard';
import { OpportunityCardMobile } from './OpportunityCardMobile';
import { Target, FileText, Plus, X, Save, Loader2, Hash, Globe, Edit3 } from 'lucide-react';
// Note: Firebase dependencies removed - using backend API instead
// import { db } from '@/lib/firebase';
// import { collection, doc, setDoc, getDocs, query } from 'firebase/firestore';

interface OpportunityGridProps {
  articles: Article[];
  portalName: string;
  portalId: string;
  onDelete?: (article: Article) => void;
  onRefresh?: () => void;
  onGenerate?: (article: Article) => void;
}

interface NewOpportunityForm {
  title: string;
  description: string;
  primaryKeywords: string;
  secondaryKeywords: string;
  longTailKeywords: string;
  outline: string;
  visual: string;
  selectedPortal: string;
}

export function OpportunityGrid({ articles, portalName, portalId, onDelete, onRefresh, onGenerate }: OpportunityGridProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newOpportunity, setNewOpportunity] = useState<NewOpportunityForm>({
    title: '',
    description: '',
    primaryKeywords: '',
    secondaryKeywords: '',
    longTailKeywords: '',
    outline: '',
    visual: '',
    selectedPortal: portalId // Default to current portal
  });

  const handleViewDetails = (article: Article) => {
    // Handle view details - you can implement a modal or navigation here
    console.log('View details for:', article.title);
  };

  const handleAddOpportunity = async () => {
    if (!newOpportunity.title.trim() || !newOpportunity.description.trim()) {
      return;
    }

    setAdding(true);
    try {
      // Get the website URL based on selected portal
      const website = newOpportunity.selectedPortal === 'new-people' ? 'https://newpeople.com' : 'https://cv-maker.com';
      
      // Parse keywords from comma-separated strings
      const primaryKeywords = newOpportunity.primaryKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
      const secondaryKeywords = newOpportunity.secondaryKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
      const longTailKeywords = newOpportunity.longTailKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);

      // Create the article object
      const newArticle: Article = {
        title: newOpportunity.title.trim(),
        description: newOpportunity.description.trim(),
        primary_keywords: primaryKeywords,
        secondary_keywords: secondaryKeywords,
        long_tail_keywords: longTailKeywords,
        outline: newOpportunity.outline.trim() || `Introduction to ${newOpportunity.title}, Key concepts, Implementation strategies, Best practices, Conclusion`,
        visual: newOpportunity.visual.trim() || 'Manual Entry',
        website: website
      };

      // Find or create a document in compBlogContent collection
      const compBlogContentRef = collection(db, 'compBlogContent');
      
      // Try to find existing document for this portal
      const snapshot = await getDocs(query(compBlogContentRef));
      let targetDocId = null;
      
      // Look for existing document that has articles with the same website
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        if (data.articles) {
          const hasMatchingWebsite = Object.values(data.articles).some((article: any) => 
            article.website === website
          );
          if (hasMatchingWebsite && !targetDocId) {
            targetDocId = docSnapshot.id;
          }
        }
      });

      // If no existing document found, create a new one
      if (!targetDocId) {
        targetDocId = `manual-${portalId}-${Date.now()}`;
      }

      // Get existing document data or create new structure
      const docRef = doc(db, 'compBlogContent', targetDocId);
      let existingData = { articles: {} };
      
      try {
        const existingDoc = await getDocs(query(collection(db, 'compBlogContent')));
        existingDoc.forEach((docSnapshot) => {
          if (docSnapshot.id === targetDocId) {
            existingData = docSnapshot.data() as any;
          }
        });
      } catch (error) {
        console.log('Creating new document structure');
      }

      // Add the new article with a unique key
      const articleKey = `manual-${Date.now()}`;
      const updatedArticles = {
        ...existingData.articles,
        [articleKey]: newArticle
      };

      // Save to Firebase
      await setDoc(docRef, {
        ...existingData,
        articles: updatedArticles,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Reset form and close
      setNewOpportunity({
        title: '',
        description: '',
        primaryKeywords: '',
        secondaryKeywords: '',
        longTailKeywords: '',
        outline: '',
        visual: '',
        selectedPortal: portalId // Reset to current portal
      });
      setShowAddForm(false);
      
      // Refresh the opportunities list if callback provided
      if (onRefresh) {
        onRefresh();
      }

    } catch (error) {
      console.error('Error adding opportunity:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewOpportunity({
      title: '',
      description: '',
      primaryKeywords: '',
      secondaryKeywords: '',
      longTailKeywords: '',
      outline: '',
      visual: '',
      selectedPortal: portalId // Reset to current portal
    });
  };

  if (articles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/70 backdrop-blur-xl rounded-xl border border-slate-200/50 shadow-lg p-8"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
            <Target className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Opportunities Found</h3>
          <p className="text-gray-500 mb-6">
            No content opportunities are currently available for {portalName}.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add First Opportunity
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex-1"></div>
        <h3 className="text-2xl font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
          Content Opportunities
        </h3>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Cancel' : 'Add Opportunity'}
          </motion.button>
        </div>
      </motion.div>

      {/* Add Opportunity Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6"
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Opportunity
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Edit3 className="inline h-4 w-4 mr-2" />
                  Title *
                </label>
                <input
                  type="text"
                  value={newOpportunity.title}
                  onChange={(e) => setNewOpportunity(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                  placeholder="Enter opportunity title..."
                  disabled={adding}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="inline h-4 w-4 mr-2" />
                  Portal *
                </label>
                <select
                  value={newOpportunity.selectedPortal}
                  onChange={(e) => setNewOpportunity(prev => ({ ...prev, selectedPortal: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                  disabled={adding}
                >
                  <option value="new-people">New People</option>
                  <option value="cv-maker">CV Maker</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-2" />
                  Description *
                </label>
                <textarea
                  value={newOpportunity.description}
                  onChange={(e) => setNewOpportunity(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white text-sm resize-none"
                  placeholder="Enter opportunity description..."
                  rows={3}
                  disabled={adding}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="inline h-4 w-4 mr-2" />
                  Primary Keywords
                </label>
                <input
                  type="text"
                  value={newOpportunity.primaryKeywords}
                  onChange={(e) => setNewOpportunity(prev => ({ ...prev, primaryKeywords: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                  placeholder="Enter keywords separated by commas..."
                  disabled={adding}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="inline h-4 w-4 mr-2" />
                  Secondary Keywords
                </label>
                <input
                  type="text"
                  value={newOpportunity.secondaryKeywords}
                  onChange={(e) => setNewOpportunity(prev => ({ ...prev, secondaryKeywords: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                  placeholder="Enter secondary keywords..."
                  disabled={adding}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="inline h-4 w-4 mr-2" />
                  Long Tail Keywords
                </label>
                <input
                  type="text"
                  value={newOpportunity.longTailKeywords}
                  onChange={(e) => setNewOpportunity(prev => ({ ...prev, longTailKeywords: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                  placeholder="Enter long tail keywords..."
                  disabled={adding}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-2" />
                  Outline
                </label>
                <textarea
                  value={newOpportunity.outline}
                  onChange={(e) => setNewOpportunity(prev => ({ ...prev, outline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white text-sm resize-none"
                  placeholder="Enter content outline (optional - will auto-generate if empty)..."
                  rows={3}
                  disabled={adding}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="inline h-4 w-4 mr-2" />
                  Visual Description
                </label>
                <input
                  type="text"
                  value={newOpportunity.visual}
                  onChange={(e) => setNewOpportunity(prev => ({ ...prev, visual: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                  placeholder="Enter visual description (optional)..."
                  disabled={adding}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddOpportunity}
                disabled={adding || !newOpportunity.title.trim() || !newOpportunity.description.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
              >
                {adding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {adding ? 'Adding...' : 'Add Opportunity'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancelAdd}
                disabled={adding}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-all duration-200 text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Table View - Responsive for different screen sizes */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Portal
                </th>
                <th scope="col" className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  Keywords
                </th>
                <th scope="col" className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visual
                </th>
                <th scope="col" className="px-3 lg:px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.map((article, index) => (
                <OpportunityCard
                  key={`${article.title}-${index}`}
                  article={article}
                  index={index}
                  portalId={portalId}
                  onViewDetails={handleViewDetails}
                  onDelete={onDelete}
                  onGenerate={onGenerate}
                />
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
                  Title
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Portal
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  Keywords
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.map((article, index) => (
                <OpportunityCard
                  key={`${article.title}-${index}`}
                  article={article}
                  index={index}
                  portalId={portalId}
                  onViewDetails={handleViewDetails}
                  onDelete={onDelete}
                  onGenerate={onGenerate}
                  isTablet={true}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {articles.map((article, index) => (
          <OpportunityCardMobile
            key={`${article.title}-${index}`}
            article={article}
            index={index}
            portalId={portalId}
            onDelete={onDelete}
            onGenerate={onGenerate}
          />
        ))}
      </div>
    </div>
  );
}
