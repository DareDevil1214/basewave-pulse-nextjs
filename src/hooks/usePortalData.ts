'use client';

import { useState, useEffect } from 'react';
import { fetchPortalData, updatePortalConfig, updatePortalKeyword, addPortalKeyword, deletePortalKeyword, PortalConfig, PortalKeyword } from '@/lib/portal-firebase';

interface PortalData {
  configs: PortalConfig[];
  keywords: PortalKeyword[];
  totalConfigs: number;
  totalKeywords: number;
}

export function usePortalData(portalName: string | null) {
  const [data, setData] = useState<PortalData>({
    configs: [],
    keywords: [],
    totalConfigs: 0,
    totalKeywords: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch portal data
  const fetchData = async () => {
    if (!portalName) {
      setData({ configs: [], keywords: [], totalConfigs: 0, totalKeywords: 0 });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const portalData = await fetchPortalData(portalName);
      setData(portalData);
    } catch (err) {
      console.error('Error fetching portal data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch portal data');
    } finally {
      setLoading(false);
    }
  };

  // Update portal config
  const updateConfig = async (configId: string, updates: Partial<PortalConfig>) => {
    try {
      await updatePortalConfig(configId, updates);
      // Refresh data after update
      await fetchData();
      return true;
    } catch (err) {
      console.error('Error updating portal config:', err);
      setError(err instanceof Error ? err.message : 'Failed to update portal config');
      return false;
    }
  };

  // Update portal keyword
  const updateKeyword = async (keywordId: string, updates: Partial<PortalKeyword>) => {
    try {
      await updatePortalKeyword(keywordId, updates);
      // Refresh data after update
      await fetchData();
      return true;
    } catch (err) {
      console.error('Error updating portal keyword:', err);
      setError(err instanceof Error ? err.message : 'Failed to update portal keyword');
      return false;
    }
  };

  // Add portal keyword
  const addKeyword = async (portal: string, keyword: string) => {
    try {
      await addPortalKeyword(portal, keyword);
      // Refresh data after adding
      await fetchData();
      return true;
    } catch (err) {
      console.error('Error adding portal keyword:', err);
      setError(err instanceof Error ? err.message : 'Failed to add portal keyword');
      return false;
    }
  };

  // Delete portal keyword
  const deleteKeyword = async (keywordId: string) => {
    try {
      await deletePortalKeyword(keywordId);
      // Refresh data after deleting
      await fetchData();
      return true;
    } catch (err) {
      console.error('Error deleting portal keyword:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete portal keyword');
      return false;
    }
  };

  // Fetch data when portal name changes
  useEffect(() => {
    fetchData();
  }, [portalName]);

  return {
    data,
    loading,
    error,
    fetchData,
    updateConfig,
    updateKeyword,
    addKeyword,
    deleteKeyword
  };
}
