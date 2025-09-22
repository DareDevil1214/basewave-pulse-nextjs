'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Article } from '@/lib/opportunities-firebase';
import { getPortalLogo } from '@/lib/opportunities-firebase';
import { Eye, Globe, FileText, Calendar, Target, ChevronRight, ExternalLink, Copy, CheckCircle2, Trash2, Loader2, Bot } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

interface OpportunityCardProps {
  article: Article;
  index: number;
  portalId: string;
  onViewDetails?: (article: Article) => void;
  onDelete?: (article: Article) => void;
  onGenerate?: (article: Article) => void;
  isTablet?: boolean;
}

export function OpportunityCard({ article, index, portalId, onViewDetails, onDelete, onGenerate, isTablet = false }: OpportunityCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setDeleting(true);
    try {
      await onDelete(article);
    } catch (error) {
      console.error('Error deleting opportunity:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
             <motion.tr
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.3, delay: index * 0.05 }}
                 className={`border-b border-gray-200 transition-all duration-300 cursor-pointer group h-20 ${
          index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
        }`}
         onClick={() => setShowModal(true)}
       >
                 {/* Title */}
         <td className={`${isTablet ? 'px-3' : 'px-4 lg:px-4 xl:px-6'} py-4 whitespace-nowrap`}>
          <div className="min-w-0 flex-1">
            <h3 
              className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors"
              title={article.title}
            >
              {article.title.length > (isTablet ? 50 : 70)
                ? `${article.title.substring(0, isTablet ? 50 : 70)}...` 
                : article.title
              }
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Globe className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500 truncate">{article.website}</span>
            </div>
          </div>
        </td>

                 {/* Description */}
         <td className={`${isTablet ? 'px-3' : 'px-4 lg:px-4 xl:px-6'} py-4`}>
          <div className={isTablet ? "max-w-48" : "max-w-xs"}>
            <p 
              className="text-sm text-gray-600 line-clamp-2 leading-relaxed"
              title={article.description}
            >
              {article.description.length > (isTablet ? 80 : 120)
                ? `${article.description.substring(0, isTablet ? 80 : 120)}...` 
                : article.description
              }
            </p>
          </div>
        </td>

                 {/* Portal */}
         <td className={`${isTablet ? 'px-3' : 'px-4 lg:px-4 xl:px-6'} py-4 whitespace-nowrap`}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg overflow-hidden">
              <img 
                src={getPortalLogo(article.portalId || portalId)} 
                alt={`${article.portalName || 'Portal'} logo`}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-sm font-medium text-gray-900">
              {article.portalName || 'Unknown Portal'}
            </span>
          </div>
        </td>

                 {/* Keywords */}
         <td className={`${isTablet ? 'px-3 w-40' : 'px-4 lg:px-4 xl:px-6 w-48'} py-4`}>
          <div className="flex flex-wrap gap-1 max-w-full">
            {article.primary_keywords?.slice(0, isTablet ? 2 : 3).map((keyword, idx) => (
              <span key={idx} className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors truncate max-w-full">
                {keyword}
              </span>
            ))}
            {article.primary_keywords && article.primary_keywords.length > (isTablet ? 2 : 3) && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                +{article.primary_keywords.length - (isTablet ? 2 : 3)}
              </span>
            )}
          </div>
        </td>

                 {/* Visual Concept - Hidden on tablet */}
         {!isTablet && (
           <td className="px-4 lg:px-4 xl:px-6 py-4">
            {article.visual ? (
              <div className="max-w-xs">
                <p 
                  className="text-xs text-gray-600 italic line-clamp-2"
                  title={article.visual}
                >
                  "{article.visual.length > 100 
                    ? `${article.visual.substring(0, 100)}...` 
                    : article.visual
                  }"
                </p>
              </div>
            ) : (
              <span className="text-xs text-gray-400">No visual concept</span>
            )}
          </td>
         )}

                 {/* Status Badge */}
         <td className={`${isTablet ? 'px-3' : 'px-4 lg:px-4 xl:px-6'} py-4 whitespace-nowrap`}>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Target className="h-3 w-3 mr-1" />
              Opportunity
            </span>
            <div className="flex items-center gap-1">
              {onGenerate && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerate(article);
                  }}
                  className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-xs font-medium"
                >
                  <Bot className="w-3 h-3" />
                  {!isTablet && 'Generate'}
                </motion.button>
              )}
              {onDelete && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={deleting}
                  className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all duration-200 text-xs font-medium"
                >
                  {deleting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  {!isTablet && 'Delete'}
                </motion.button>
              )}
            </div>
          </div>
        </td>
      </motion.tr>

             {/* Modal */}
       {showModal && createPortal(
         <div className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999999] p-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-hidden flex flex-col">
            {/* Card Header Image */}
            <div className="w-full h-48 relative overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-400/20 to-slate-500/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32">
                      <img 
                        src={getPortalLogo(portalId)} 
                        alt={`${portalId} logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Target className="h-3 w-3 mr-1" />
                  Opportunity
                </span>
              </div>
            </div>

                         {/* Card Content */}
             <div className="flex-1 overflow-y-auto p-6">
               <div className="space-y-6">
                 {/* Header Info */}
                 <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3">
                   <div className="flex items-center gap-1">
                     <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                     Content Opportunity
                   </div>
                   <div className="flex items-center gap-1">
                     <div className="p-1 sm:p-1.5 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200/80 shadow-sm">
                       <Target className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-700" />
                     </div>
                     {portalId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                   </div>
                 </div>
                 
                 {/* Title */}
                 <div>
                   <h3 className="font-bold text-gray-900 mb-2 text-lg leading-tight">
                     {article.title}
                   </h3>
                 </div>
                 
                 {/* Description */}
                 <div>
                   <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                   <p className="text-gray-600 text-sm leading-relaxed">
                     {article.description}
                   </p>
                 </div>

                 {/* Primary Keywords */}
                 {article.primary_keywords && article.primary_keywords.length > 0 && (
                   <div>
                     <h4 className="text-sm font-semibold text-gray-700 mb-2">Primary Keywords</h4>
                     <div className="flex flex-wrap gap-2">
                       {article.primary_keywords.map((keyword, idx) => (
                         <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200">
                           {keyword}
                         </span>
                       ))}
                     </div>
                   </div>
                 )}

                 {/* Secondary Keywords */}
                 {article.secondary_keywords && article.secondary_keywords.length > 0 && (
                   <div>
                     <h4 className="text-sm font-semibold text-gray-700 mb-2">Secondary Keywords</h4>
                     <div className="flex flex-wrap gap-2">
                       {article.secondary_keywords.map((keyword, idx) => (
                         <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
                           {keyword}
                         </span>
                       ))}
                     </div>
                   </div>
                 )}

                 {/* Long Tail Keywords */}
                 {article.long_tail_keywords && article.long_tail_keywords.length > 0 && (
                   <div>
                     <h4 className="text-sm font-semibold text-gray-700 mb-2">Long Tail Keywords</h4>
                     <div className="flex flex-wrap gap-2">
                       {article.long_tail_keywords.map((keyword, idx) => (
                         <span key={idx} className="text-xs bg-green-100 text-green-800 px-3 py-1.5 rounded-lg border border-green-200">
                           {keyword}
                         </span>
                       ))}
                     </div>
                   </div>
                 )}

                 {/* Visual Concept */}
                 {article.visual && (
                   <div>
                     <h4 className="text-sm font-semibold text-gray-700 mb-2">Visual Concept</h4>
                     <div className="bg-slate-50 rounded-lg p-3">
                       <p className="text-gray-600 text-sm italic">
                         "{article.visual}"
                       </p>
                     </div>
                   </div>
                 )}

                 

                                   {/* Website */}
                  {article.website && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Website</h4>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 text-sm">{article.website}</span>
                      </div>
                    </div>
                  )}
               </div>
             </div>

             {/* Footer */}
             <div className="border-t border-gray-200 p-4 bg-gray-50">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <button
                                           onClick={() => {
                        const content = `${article.title}\n\n${article.description}\n\nPrimary Keywords: ${article.primary_keywords?.join(', ')}\nSecondary Keywords: ${article.secondary_keywords?.join(', ')}\nLong Tail Keywords: ${article.long_tail_keywords?.join(', ')}\n\nVisual Concept: ${article.visual}`;
                        navigator.clipboard.writeText(content);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                     className="h-8 px-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 border-slate-200 rounded-lg border text-xs font-medium transition-colors"
                   >
                     {copied ? (
                       <>
                         <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                         Copied!
                       </>
                     ) : (
                       <>
                         <Copy className="h-3 w-3 mr-1 inline" />
                         Copy All
                       </>
                     )}
                   </button>
                 </div>
                 
                 <button
                   onClick={() => setShowModal(false)}
                   className="h-8 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors text-xs font-medium"
                 >
                   Close
                 </button>
               </div>
             </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
