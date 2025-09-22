'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedLogoProps {
  className?: string;
  isCollapsed?: boolean;
}

export function AnimatedLogo({ className, isCollapsed }: AnimatedLogoProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={cn("flex justify-center", className)}>
      <motion.div 
        className="relative cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          width: isHovered ? 180 : 60,
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <div className="relative h-[60px] bg-white rounded-full flex justify-center items-center overflow-hidden">
          {/* Gradient Background */}
          <motion.div 
            className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-400 to-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Blur Effect */}
          <motion.div 
            className="absolute top-[10px] w-full h-full rounded-full bg-gradient-to-r from-gray-400 to-gray-600 -z-10"
            style={{ filter: 'blur(15px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.5 : 0 }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Logo Icon */}
          <AnimatePresence mode="wait">
            {!isHovered && (
              <motion.div 
                className="relative z-10 flex items-center justify-center"
                initial={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <img 
                  src="/sidebar-logo.png" 
                  alt="MarketPulse Logo" 
                  className="w-7 h-7 object-contain"
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Text Title */}
          <AnimatePresence mode="wait">
            {isHovered && (
              <motion.span 
                className="absolute z-10 text-white text-lg uppercase tracking-wider font-bold whitespace-nowrap"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.25, delay: 0.25 }}
              >
                MarketPulse
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Shadow */}
        <motion.div
          className="absolute inset-0 rounded-full shadow-lg"
          animate={{
            boxShadow: isHovered 
              ? '0 0 0 rgba(0, 0, 0, 0)' 
              : '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
    </div>
  );
}

// Alternative version for when sidebar is collapsed - shows just the animated circle
export function CollapsedAnimatedLogo({ className }: { className?: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={cn("flex justify-center", className)}>
      <motion.div 
        className="relative cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-[45px] h-[45px] bg-white rounded-full flex justify-center items-center overflow-hidden">
          {/* Gradient Background */}
          <motion.div 
            className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-400 to-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Blur Effect */}
          <motion.div 
            className="absolute top-[8px] w-full h-full rounded-full bg-gradient-to-r from-gray-400 to-gray-600 -z-10"
            style={{ filter: 'blur(12px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.4 : 0 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Logo Icon */}
          <motion.div 
            className="relative z-10 flex items-center justify-center"
            animate={{ 
              scale: isHovered ? 1.1 : 1,
              filter: isHovered ? 'brightness(0) invert(1)' : 'brightness(1) invert(0)'
            }}
            transition={{ duration: 0.3 }}
          >
            <img 
              src="/sidebar-logo.png" 
              alt="MarketPulse Logo" 
              className="w-6 h-6 object-contain"
            />
          </motion.div>
        </div>

        {/* Shadow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: isHovered 
              ? '0 15px 35px rgba(107, 114, 128, 0.4)' 
              : '0 8px 20px rgba(0, 0, 0, 0.1)'
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </div>
  );
}