import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const FilterBadge = ({ label, onRemove }) => {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.05 }}
      className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200 shadow-sm"
    >
      {label}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onRemove}
        className="ml-2 -mr-1 p-0.5 rounded-full hover:bg-blue-100 transition-colors duration-200"
      >
        <XMarkIcon className="h-4 w-4" />
      </motion.button>
    </motion.span>
  );
};

export default FilterBadge;
