'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { PortalConfigCard } from './PortalConfigCard';
import { PortalConfigEditSidebar } from './PortalConfigEditSidebar';

interface PortalConfigsSectionProps {}

export function PortalConfigsSection({}: PortalConfigsSectionProps) {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState<PortalConfig | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch portal configs from portalConfigs collection
  const fetchConfigs = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching portal configs from portalConfigs collection for newpeople...');

      const q = query(collection(db, 'portalConfigs'), where('portal', '==', 'newpeople'));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('⚠️ No portal configs found for newpeople');
        setConfigs([]);
        return;
      }

      const configsData: any[] = [];

      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        configsData.push({
          id: docSnapshot.id,
          ...data
        });
      });

      console.log(`✅ Found ${configsData.length} portal configs for newpeople`);
      setConfigs(configsData);

    } catch (error) {
      console.error('❌ Error fetching portal configs:', error);
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  // Update portal config in portalConfigs collection
  const handleUpdateConfig = async (configId: string, updates: any) => {
    try {
      const docRef = doc(db, 'portalConfigs', configId);
      await updateDoc(docRef, updates);
      await fetchConfigs();
      return true;
    } catch (error) {
      console.error('Error updating portal config:', error);
      return false;
    }
  };

  // Load configs on component mount
  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleEdit = (config: any, field: string) => {
    setSelectedConfig(config);
    setSelectedField(field);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedConfig(null);
    setSelectedField(null);
  };





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

        {/* Configuration Cards Skeleton */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl p-4 border border-gray-100 bg-gray-50 animate-pulse"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>
                  <div className="min-h-[60px] flex items-start">
                    <div className="w-full h-32 bg-gray-200 rounded-xl animate-pulse"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (configs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gray-100 rounded-xl">
            <Settings className="w-6 h-6 text-gray-900" />
          </div>
          <div>
                      <h2 className="text-3xl font-bold text-gray-900">Base Data Configuration</h2>
          <p className="text-gray-600">Manage your base data settings and preferences</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No configurations found</h3>
                      <p className="text-gray-500">This portal doesn't have any base data configurations yet.</p>
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
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-black mb-2">Portal Configurations</h2>
        <p className="text-gray-600">Manage your portal settings and preferences</p>
      </motion.div>

      {/* Configuration Cards */}
      <div className="space-y-8">
        {configs.map((config, configIndex) => {
          const allFields = Object.keys(config).filter(key => key !== 'id' && key !== 'portal' && key !== 'updatedAt');
          
          // Sort fields to ensure consistent order: Narrative, Tone, Audience, then others
          const fields = allFields.sort((a, b) => {
            const order = ['narrative', 'tone', 'audience'];
            const aIndex = order.findIndex(item => a.toLowerCase().includes(item));
            const bIndex = order.findIndex(item => b.toLowerCase().includes(item));
            
            if (aIndex !== -1 && bIndex !== -1) {
              return aIndex - bIndex;
            }
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return a.localeCompare(b);
          });

          return (
            <div key={config.id} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {fields.map((field, fieldIndex) => (
                  <PortalConfigCard
                    key={`${config.id}-${field}`}
                    config={config}
                    field={field}
                    value={config[field]}
                    onEdit={handleEdit}
                    index={configIndex * fields.length + fieldIndex}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Sidebar */}
      <PortalConfigEditSidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        config={selectedConfig}
        field={selectedField}
        onSave={handleUpdateConfig}
      />
    </div>
  );
}
