'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SuccessToastProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  duration?: number;
}

export function SuccessToast({ 
  isVisible, 
  onClose, 
  title = "Success!", 
  message = "Operation completed successfully.",
  duration = 4000 
}: SuccessToastProps) {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      
      // Auto close after duration
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.3 
          }}
          className="fixed top-4 right-4 z-50 flex w-80 max-w-80 h-20 bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200"
        >
          {/* Decorative SVG Pattern */}
          <svg width="16" height="80" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <path
              d="M 8 0 
                       Q 4 4.8, 8 9.6 
                       T 8 19.2 
                       Q 4 24, 8 28.8 
                       T 8 38.4 
                       Q 4 43.2, 8 48 
                       T 8 57.6 
                       Q 4 62.4, 8 67.2 
                       T 8 76.8 
                       Q 4 81.6, 8 86.4 
                       T 8 96 
                       L 0 96 
                       L 0 0 
                       Z"
              fill="#66cdaa"
              stroke="#66cdaa"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          
          {/* Content Area */}
          <div className="mx-2 overflow-hidden w-full flex items-center">
            <div className="flex-1">
              <p className="text-lg font-bold text-[#66cdaa] leading-5 mr-2 overflow-hidden text-ellipsis whitespace-nowrap">
                {title}
              </p>
              <p className="overflow-hidden leading-4 break-all text-zinc-400 max-h-6 text-xs">
                {message}
              </p>
            </div>
          </div>
          
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="w-12 cursor-pointer focus:outline-none hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="mediumseagreen"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
