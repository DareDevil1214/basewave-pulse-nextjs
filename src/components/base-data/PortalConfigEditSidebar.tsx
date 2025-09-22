'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, CheckCircle } from 'lucide-react';
import { PortalConfig } from '@/lib/portal-firebase';

interface PortalConfigEditSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  config: PortalConfig | null;
  field: string | null;
  onSave: (configId: string, updates: Partial<PortalConfig>) => Promise<boolean>;
}

export function PortalConfigEditSidebar({ 
  isOpen, 
  onClose, 
  config, 
  field, 
  onSave 
}: PortalConfigEditSidebarProps) {
  const [editingData, setEditingData] = useState<Partial<PortalConfig>>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (config && field) {
      setEditingData({ [field]: config[field] });
      setSaveSuccess(false);
    }
  }, [config, field]);

  const handleSave = async () => {
    if (!config || !field) return;

    setSaving(true);
    try {
      const success = await onSave(config.id, editingData);
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (value: any) => {
    if (!field) return;
    setEditingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getFieldDisplayName = (fieldName: string) => {
    return fieldName.replace(/([A-Z])/g, ' $1').trim();
  };

  const renderField = () => {
    if (!config || !field) return null;

    const value = config[field];
    const currentValue = editingData[field] !== undefined ? editingData[field] : value;

    if (typeof value === 'boolean') {
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={currentValue || false}
              onChange={(e) => handleFieldChange(e.target.checked)}
              className="w-5 h-5 text-black bg-white border-2 border-gray-300 rounded focus:ring-black focus:ring-2 transition-all duration-200"
            />
            <span className="text-lg font-medium text-black">
              {currentValue ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      );
    } else if (typeof value === 'number') {
      return (
        <input
          type="number"
          value={currentValue || ''}
          onChange={(e) => handleFieldChange(Number(e.target.value))}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white text-lg font-medium"
          placeholder="Enter number..."
          autoFocus
        />
      );
    } else {
      const isLongText = field.toLowerCase().includes('narrative') || 
                        field.toLowerCase().includes('audience') || 
                        field.toLowerCase().includes('tone') ||
                        (typeof value === 'string' && value.length > 50);
      
      return (
        <textarea
          value={currentValue || ''}
          onChange={(e) => handleFieldChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white resize-none text-lg leading-relaxed scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
          style={{
            height: isLongText ? '300px' : '120px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#9CA3AF #F3F4F6'
          }}
          placeholder="Enter text..."
          autoFocus
        />
      );
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 w-screen h-screen"
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              width: '100vw',
              height: '100vh',
              minWidth: '100vw',
              minHeight: '100vh'
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b-2 border-gray-100">
              <div className="min-w-0 flex-1 mr-4">
                <h2 className="text-xl sm:text-2xl font-bold text-black truncate">Edit Configuration</h2>
                {field && (
                  <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">
                    Editing: {getFieldDisplayName(field)}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <X className="w-6 h-6 text-black" />
              </button>
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mx-6 mt-4 p-4 bg-gray-100 border-2 border-gray-200 rounded-xl flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-black" />
                  <span className="text-black font-medium">Configuration updated successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-black mb-4 uppercase tracking-wide">
                    {field && getFieldDisplayName(field)}
                  </label>
                  {renderField()}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t-2 border-gray-100 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || saveSuccess}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : saveSuccess ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
                </button>
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="px-6 py-3 bg-white border-2 border-gray-300 text-black rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
