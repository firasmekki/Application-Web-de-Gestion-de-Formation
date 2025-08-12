import React from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  showFilters, 
  toggleFilters,
  placeholder = "Rechercher une formation..."
}) => {
  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        
        <motion.button
          onClick={toggleFilters}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`p-3 rounded-xl border ${
            showFilters
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          } shadow-sm transition-colors duration-200`}
          title={showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
        >
          <FunnelIcon className="h-5 w-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default SearchBar;
