'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchAllPortalOpportunities, deleteOpportunity } from '@/lib/opportunities-firebase';
import { 
  LoadingOpportunities, 
  ErrorOpportunities, 
  OpportunityGrid 
} from '@/components/opportunities';
import { OpportunityGenerationForm } from './opportunities/OpportunityGenerationForm';
import { PortalOpportunities, Article } from '@/lib/opportunities-firebase';

interface Portal {
  id: string;
  title: string;
  logo: string;
  description: string;
}

const PORTALS: Portal[] = [
  {
    id: 'new-people',
    title: 'newpeople',
    logo: '/logo-load.webp',
    description: 'AI-powered portfolio creation and management'
  },
  {
    id: 'cv-maker',
    title: 'CV Maker',
    logo: '/logo-load.webp',
    description: 'AI-powered CV and resume creation'
  }
];

export function OpportunitiesTab() {
  const [allOpportunities, setAllOpportunities] = useState<PortalOpportunities[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGenerationForm, setShowGenerationForm] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Fetch all opportunities from all portals
  const fetchAllOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching all opportunities from all portals...');
      const opportunities = await fetchAllPortalOpportunities();
      
      setAllOpportunities(opportunities);
      console.log(`✅ Loaded ${opportunities.length} portal opportunities`);
    } catch (err) {
      console.error('❌ Error fetching all opportunities:', err);
      setError('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOpportunities();
  }, []);

  // Combine all articles from all portals into a single array
  const combinedArticles = allOpportunities.flatMap(portal => 
    portal.articles.map(article => ({
      ...article,
      portalId: portal.portalId,
      portalName: portal.portalName
    }))
  );

  // Handle opportunity deletion
  const handleDeleteOpportunity = async (article: Article) => {
    try {
      const result = await deleteOpportunity(article);
      
      if (result.success) {
        // Refresh the opportunities after successful deletion
        await fetchAllOpportunities();
      } else {
        console.error('Failed to delete opportunity:', result.message);
      }
    } catch (error) {
      console.error('Error deleting opportunity:', error);
    }
  };

  // Handle content generation
  const handleGenerateContent = (article: Article) => {
    setSelectedArticle(article);
    setShowGenerationForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">All Opportunities</h1>
          <p className="text-gray-600 text-base md:text-lg">Manage and track business opportunities across all your portals</p>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Loading State */}
          {loading && <LoadingOpportunities />}
          
          {/* Error State */}
          {error && (
            <ErrorOpportunities 
              error={error} 
              onRetry={fetchAllOpportunities} 
            />
          )}
          
          {/* Opportunities Content */}
          {!loading && !error && combinedArticles.length > 0 && (
            <OpportunityGrid
              articles={combinedArticles}
              portalName="All Portals"
              portalId="all-portals"
              onDelete={handleDeleteOpportunity}
              onRefresh={fetchAllOpportunities}
              onGenerate={handleGenerateContent}
            />
          )}
          
          {/* No Opportunities */}
          {!loading && !error && combinedArticles.length === 0 && (
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-slate-200/50 shadow-lg p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Opportunities Available</h3>
                <p className="text-gray-500 mb-6">
                  No content opportunities are currently available across all portals.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Generation Form Modal */}
      {showGenerationForm && selectedArticle && (
        <OpportunityGenerationForm
          article={selectedArticle}
          portalId={selectedArticle.portalId || 'all-portals'}
          onClose={() => {
            setShowGenerationForm(false);
            setSelectedArticle(null);
          }}
          onSuccess={() => {
            setShowGenerationForm(false);
            setSelectedArticle(null);
            // Optionally refresh opportunities if needed
          }}
        />
      )}
    </div>
  );
}
