'use client';

import { motion } from 'framer-motion';

interface PortalHeaderProps {
  selectedPortal: string | null;
}

const portalData = {
  'newpeople': {
    title: 'New People',
    logo: '/logo-load.webp',
    description: 'New People Base Data Management'
  },
  'cv-maker': {
    title: 'CV Maker',
    logo: '/cv-maker.png',
    description: 'CV Maker Base Data Management'
  }
};

export function PortalHeader({ selectedPortal }: PortalHeaderProps) {
  const portal = selectedPortal ? portalData[selectedPortal as keyof typeof portalData] : null;

  return (
    <div className="pt-12 md:pt-0">
      {portal ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Base Data Management</h1>
          <p className="text-gray-600 text-base md:text-lg">{portal.description}</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Base Data Management</h1>
          <p className="text-gray-600 text-base md:text-lg">Select a portal to manage its base data configurations and settings</p>
        </motion.div>
      )}
    </div>
  );
}
