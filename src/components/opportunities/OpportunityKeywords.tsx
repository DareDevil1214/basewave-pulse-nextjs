'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Hash, Target, TrendingUp } from 'lucide-react';

interface OpportunityKeywordsProps {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  longTailKeywords: string[];
}

export function OpportunityKeywords({ 
  primaryKeywords, 
  secondaryKeywords, 
  longTailKeywords 
}: OpportunityKeywordsProps) {
  return (
    <div className="space-y-4">
      {/* Primary Keywords */}
      {primaryKeywords.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
                         <Target className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Primary Keywords</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {primaryKeywords.map((keyword, index) => (
              <motion.div
                key={keyword}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                                 <Badge variant="default" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                  {keyword}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Secondary Keywords */}
      {secondaryKeywords.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
                         <TrendingUp className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Secondary Keywords</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {secondaryKeywords.map((keyword, index) => (
              <motion.div
                key={keyword}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                                 <Badge variant="secondary" className="bg-gray-200 text-gray-800 hover:bg-gray-300">
                  {keyword}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Long Tail Keywords */}
      {longTailKeywords.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
                         <Hash className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Long Tail Keywords</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {longTailKeywords.slice(0, 6).map((keyword, index) => (
              <motion.div
                key={keyword}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                                 <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100">
                  {keyword}
                </Badge>
              </motion.div>
            ))}
            {longTailKeywords.length > 6 && (
              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                +{longTailKeywords.length - 6} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
