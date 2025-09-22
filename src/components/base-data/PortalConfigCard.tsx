'use client';

import { motion } from 'framer-motion';
import { Edit } from 'lucide-react';
import { PortalConfig } from '@/lib/portal-firebase';

interface PortalConfigCardProps {
  config: PortalConfig;
  field: string;
  value: any;
  onEdit: (config: PortalConfig, field: string) => void;
  index: number;
}

export function PortalConfigCard({ config, field, value, onEdit, index }: PortalConfigCardProps) {
  const getFieldDisplayName = (fieldName: string) => {
    return fieldName.replace(/([A-Z])/g, ' $1').trim();
  };

  const isImportantField = (field: string) => {
    return field.toLowerCase().includes('narrative') || 
           field.toLowerCase().includes('tone') || 
           field.toLowerCase().includes('audience');
  };

  const renderFieldValue = () => {
    if (typeof value === 'boolean') {
      return (
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${value ? 'bg-black' : 'bg-gray-300'}`} />
          <span className={`text-base font-medium ${value ? 'text-black' : 'text-gray-500'}`}>
            {value ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      );
    }

    const isLongText = field.toLowerCase().includes('narrative') || 
                      field.toLowerCase().includes('audience') || 
                      field.toLowerCase().includes('tone') ||
                      (typeof value === 'string' && value.length > 50);

    if (isLongText) {
      return (
        <div className="text-sm text-gray-700 leading-relaxed overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical'
        }}>
          {String(value)}
        </div>
      );
    }

    return (
      <div className="text-base font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
        {String(value)}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`group relative bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:border-black hover:shadow-lg transition-all duration-300 cursor-pointer ${
        isImportantField(field) ? 'ring-2 ring-gray-100' : ''
      }`}
      onClick={() => onEdit(config, field)}
    >
      {/* Header */}
      <div className="flex items-center justify-center mb-4 relative">
        <h3 className={`font-bold text-lg sm:text-xl uppercase tracking-wide text-center ${
          isImportantField(field) ? 'text-black' : 'text-gray-900'
        }`}>
          {getFieldDisplayName(field)}
        </h3>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          <Edit className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Divider Line */}
      <div className="w-3/4 h-px bg-gray-200 mx-auto mb-4" />

      {/* Content */}
      <div className="space-y-3">
        {renderFieldValue()}
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl" />
      
      {/* Important Field Indicator */}
      {isImportantField(field) && (
        <div className="absolute top-3 right-3 w-2 h-2 bg-black rounded-full" />
      )}
    </motion.div>
  );
}
