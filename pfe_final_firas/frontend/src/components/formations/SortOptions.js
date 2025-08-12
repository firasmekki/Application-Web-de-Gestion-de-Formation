import React from 'react';
import { Menu } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowsUpDownIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const sortOptions = [
  { id: 'dateDebut', label: 'Date de début', icon: CalendarIcon },
  { id: 'duree', label: 'Durée', icon: ClockIcon },
  { id: 'participants', label: 'Nombre de participants', icon: UserGroupIcon },
];

const SortOptions = ({ sortBy, sortOrder, onSortChange }) => {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        <ArrowsUpDownIcon className="w-5 h-5" />
        <span>Trier par</span>
      </Menu.Button>

      <AnimatePresence>
        <Menu.Items
          as={motion.div}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 focus:outline-none z-10"
        >
          <div className="p-2 space-y-1">
            {sortOptions.map((option) => (
              <Menu.Item key={option.id}>
                {({ active }) => (
                  <button
                    onClick={() => {
                      if (sortBy === option.id) {
                        onSortChange(option.id, sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        onSortChange(option.id, 'desc');
                      }
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg
                      ${active ? 'bg-gray-50' : ''}
                      ${sortBy === option.id ? 'text-blue-600 font-medium' : 'text-gray-700'}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <option.icon className="w-5 h-5" />
                      <span>{option.label}</span>
                    </div>
                    {sortBy === option.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {sortOrder === 'asc' ? (
                          <ArrowUpIcon className="w-4 h-4" />
                        ) : (
                          <ArrowDownIcon className="w-4 h-4" />
                        )}
                      </motion.div>
                    )}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </AnimatePresence>
    </Menu>
  );
};

export default SortOptions;
