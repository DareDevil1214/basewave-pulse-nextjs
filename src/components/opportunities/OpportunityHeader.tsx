'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { getPortalLogo } from '@/lib/opportunities-firebase';
import { Target, TrendingUp, FileText } from 'lucide-react';

interface OpportunityHeaderProps {
  portalId: string;
  portalName: string;
  articleCount: number;
}

export function OpportunityHeader({ portalId, portalName, articleCount }: OpportunityHeaderProps) {
  const portalLogo = getPortalLogo(portalId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/70 backdrop-blur-xl rounded-xl border border-slate-200/50 shadow-lg p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div 
            className="w-16 h-16 rounded-xl overflow-hidden"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <img 
              src={portalLogo}
              alt={`${portalName} logo`}
              className="w-full h-full object-contain"
            />
          </motion.div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{portalName}</h2>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                <Target className="h-3 w-3 mr-1" />
                Active Portal
              </Badge>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>{articleCount} content opportunities</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Ready to Create</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">{articleCount}</div>
          <div className="text-xs text-gray-500">Opportunities</div>
        </div>
      </div>
    </motion.div>
  );
}
