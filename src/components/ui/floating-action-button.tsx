'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Settings, HelpCircle, Sparkles } from 'lucide-react';

interface FloatingActionButtonProps {
  className?: string;
}

export function FloatingActionButton({ className = '' }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: MessageSquare,
      label: 'Quick Support',
      color: 'from-blue-500 to-indigo-600',
      onClick: () => alert('Support chat coming soon!')
    },
    {
      icon: Settings,
      label: 'Quick Settings',
      color: 'from-gray-500 to-gray-600',
      onClick: () => alert('Quick settings coming soon!')
    },
    {
      icon: Sparkles,
      label: 'AI Assistant',
      color: 'from-purple-500 to-pink-600',
      onClick: () => alert('AI Assistant coming soon!')
    },
    {
      icon: HelpCircle,
      label: 'Help Center',
      color: 'from-green-500 to-emerald-600',
      onClick: () => alert('Help center opening soon!')
    }
  ];

  const containerVariants = {
    open: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    closed: {
      transition: {
        staggerChildren: 0.1,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    open: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    closed: {
      y: 20,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <motion.div
        variants={containerVariants}
        animate={isOpen ? 'open' : 'closed'}
        className="flex flex-col-reverse items-end gap-3"
      >
        {/* Action Items */}
        <AnimatePresence>
          {isOpen && actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.label}
                variants={itemVariants}
                className="flex items-center gap-3"
              >
                {/* Label */}
                <div className="bg-white text-gray-700 px-3 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap border border-gray-200">
                  {action.label}
                </div>
                
                {/* Action Button */}
                <motion.button
                  onClick={action.onClick}
                  className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.color} text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow duration-200`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl transition-all duration-200 relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: isOpen ? 45 : 0 }}
        >
          <Plus className="w-6 h-6" />
          
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-10 transition-opacity duration-200"></div>
          
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
        </motion.button>
      </motion.div>

      {/* Background overlay when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 -z-10"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}