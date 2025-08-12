import React from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  AcademicCapIcon,
  ClockIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={`bg-white rounded-xl shadow-sm p-4 border ${color}`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color.replace('border-', 'bg-').replace('border', 'bg') + '/10'}`}>
        <Icon className={`h-6 w-6 ${color.replace('border-', 'text-')}`} />
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </motion.div>
);

const FormationStats = ({ formations = [] }) => {
  const stats = {
    totalFormations: formations.length,
    totalParticipants: formations.reduce((acc, f) => acc + (f.participants?.length || 0), 0),
    averageDuration: Math.round(formations.reduce((acc, f) => acc + (f.duree || 0), 0) / formations.length || 0),
    activeFormations: formations.filter(f => f.statut === 'en_cours').length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={AcademicCapIcon}
        label="Formations totales"
        value={stats.totalFormations}
        color="border-blue-500"
      />
      <StatCard
        icon={UserGroupIcon}
        label="Total participants"
        value={stats.totalParticipants}
        color="border-green-500"
      />
      <StatCard
        icon={ClockIcon}
        label="Durée moyenne"
        value={`${stats.averageDuration}h`}
        color="border-purple-500"
      />
      <StatCard
        icon={CalendarIcon}
        label="Formations actives"
        value={stats.activeFormations}
        color="border-orange-500"
      />
    </div>
  );
};

export default FormationStats;
