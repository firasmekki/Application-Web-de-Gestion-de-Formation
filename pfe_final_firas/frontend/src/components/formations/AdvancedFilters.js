import React from 'react';
import { motion } from 'framer-motion';
import { 
  AcademicCapIcon, 
  BookOpenIcon, 
  MapPinIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const FilterSelect = ({ icon: Icon, label, name, value, onChange, options, loading }) => (
  <div className="relative">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={loading}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      {loading && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ArrowPathIcon className="h-4 w-4 text-gray-400 animate-spin" />
        </div>
      )}
    </div>
  </div>
);

const AdvancedFilters = ({ 
  filters, 
  onChange, 
  onReset,
  domaines = [],
  loading = false
}) => {
  const niveauOptions = [
    { value: '', label: 'Tous les niveaux' },
    { value: 'debutant', label: 'Débutant' },
    { value: 'intermediaire', label: 'Intermédiaire' },
    { value: 'avance', label: 'Avancé' }
  ];

  const modalitesOptions = [
    { value: '', label: 'Toutes les modalités' },
    { value: 'presentiel', label: 'Présentiel' },
    { value: 'distanciel', label: 'Distanciel' },
    { value: 'hybride', label: 'Hybride' }
  ];

  const domaineOptions = [
    { value: '', label: 'Tous les domaines' },
    ...domaines.map(d => ({ value: d._id, label: d.nom }))
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-lg p-6 space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FilterSelect
          icon={BookOpenIcon}
          label="Domaine"
          name="domaine"
          value={filters.domaine}
          onChange={onChange}
          options={domaineOptions}
          loading={loading}
        />

        <FilterSelect
          icon={AcademicCapIcon}
          label="Niveau"
          name="niveau"
          value={filters.niveau}
          onChange={onChange}
          options={niveauOptions}
        />

        <FilterSelect
          icon={MapPinIcon}
          label="Modalités"
          name="modalites"
          value={filters.modalites}
          onChange={onChange}
          options={modalitesOptions}
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          onClick={onReset}
          className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Réinitialiser les filtres
        </button>
      </div>
    </motion.div>
  );
};

export default AdvancedFilters;
