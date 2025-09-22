'use client';

import { motion } from 'framer-motion';
import { FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface OpportunityOutlineProps {
  outline: string;
}

export function OpportunityOutline({ outline }: OpportunityOutlineProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Parse the outline into sections
  const parseOutline = (outlineText: string) => {
    const lines = outlineText.split('\n').filter(line => line.trim());
    const sections: { title: string; content: string[] }[] = [];
    let currentSection: { title: string; content: string[] } | null = null;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Check if it's a section header (starts with number or letter followed by period)
      if (/^[0-9A-Z]\./.test(trimmedLine)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmedLine,
          content: []
        };
      } else if (currentSection && trimmedLine) {
        currentSection.content.push(trimmedLine);
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  };

  const sections = parseOutline(outline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
             className="bg-gray-50 rounded-lg p-4"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
                 className="flex items-center gap-2 w-full text-left hover:bg-gray-100 rounded-lg p-2 transition-colors"
      >
                 <FileText className="h-4 w-4 text-gray-600" />
        <span className="font-semibold text-gray-800">Blog Outline</span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-500 ml-auto" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500 ml-auto" />
        )}
      </button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 space-y-3"
        >
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
                             className="bg-white rounded-lg p-3 border border-gray-200"
            >
              <h4 className="font-semibold text-gray-800 mb-2">{section.title}</h4>
              <div className="space-y-1">
                {section.content.map((item, itemIndex) => (
                  <p key={itemIndex} className="text-sm text-gray-600 leading-relaxed">
                    {item}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
