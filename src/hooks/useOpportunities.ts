import { useState, useEffect } from 'react';
import { fetchPortalOpportunities, PortalOpportunities } from '@/lib/opportunities-firebase';

export function useOpportunities(portalId: string | null) {
  const [opportunities, setOpportunities] = useState<PortalOpportunities | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      if (!portalId) {
        setOpportunities(null);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔄 Fetching opportunities for portal: ${portalId}`);
        const data = await fetchPortalOpportunities(portalId);
        
        if (data) {
          setOpportunities(data);
          console.log(`✅ Loaded ${data.articles.length} articles for ${portalId}`);
        } else {
          setError('No opportunities found for this portal');
        }
      } catch (err) {
        console.error('❌ Error fetching opportunities:', err);
        setError('Failed to load opportunities');
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [portalId]);

  const refreshOpportunities = async () => {
    if (!portalId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchPortalOpportunities(portalId);
      if (data) {
        setOpportunities(data);
      } else {
        setError('No opportunities found for this portal');
      }
    } catch (err) {
      console.error('❌ Error refreshing opportunities:', err);
      setError('Failed to refresh opportunities');
    } finally {
      setLoading(false);
    }
  };

  return {
    opportunities,
    loading,
    error,
    refreshOpportunities
  };
}
