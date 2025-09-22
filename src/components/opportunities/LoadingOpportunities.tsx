'use client';

import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

export function LoadingOpportunities() {
  return (
    <div className="space-y-6">
      {/* Loading Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-64 mx-auto"></div>
      </motion.div>

      {/* Loading Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
            {/* Loading Table Header */}
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keywords
                </th>
                <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visual
                </th>
                <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            
            {/* Loading Table Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <motion.tr
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: item * 0.05 }}
                  className="bg-white border-b border-gray-200"
                >
                  {/* Content Column */}
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                      </div>
                    </div>
                  </td>

                  {/* Description Column */}
                  <td className="px-4 md:px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </div>
                  </td>

                  {/* Keywords Column */}
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-20"></div>
                      <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-24"></div>
                      <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-16"></div>
                    </div>
                  </td>

                  {/* Visual Column */}
                  <td className="px-4 md:px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="px-4 md:px-6 py-4">
                    <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
      </div>

      {/* Loading Mobile Cards */}
      <div className="md:hidden space-y-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: item * 0.05 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
          >
            <div className="space-y-4">
              {/* Header with Logo and Title */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
              
              {/* Keywords */}
              <div className="flex flex-wrap gap-2">
                <div className="h-6 bg-gray-200 rounded-md animate-pulse w-20"></div>
                <div className="h-6 bg-gray-200 rounded-md animate-pulse w-24"></div>
              </div>
              
              {/* Visual Concept */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </div>
              
              {/* Status Badge */}
              <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
