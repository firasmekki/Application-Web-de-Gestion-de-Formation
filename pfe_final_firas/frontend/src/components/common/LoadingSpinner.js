import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = "Chargement..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <motion.div
        className="relative w-16 h-16"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute w-full h-full border-4 border-blue-200 rounded-full"></div>
        <motion.div
          className="absolute w-full h-full border-4 border-blue-600 rounded-full"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          style={{ clipPath: 'inset(0 0 0 50%)' }}
        ></motion.div>
      </motion.div>
      <motion.p
        className="text-gray-600 text-sm font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {message}
      </motion.p>
    </div>
  );
};

export default LoadingSpinner;
