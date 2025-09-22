'use client';

import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorOpportunitiesProps {
  error: string;
  onRetry: () => void;
}

export function ErrorOpportunities({ error, onRetry }: ErrorOpportunitiesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/70 backdrop-blur-xl rounded-xl border border-slate-200/50 shadow-lg p-8"
    >
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-xl flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Opportunities</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        
        <Button
          onClick={onRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </motion.div>
  );
}
