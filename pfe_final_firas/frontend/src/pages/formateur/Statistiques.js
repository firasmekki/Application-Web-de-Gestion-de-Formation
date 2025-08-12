import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  StarIcon,
  TrendingUpIcon,
  ChartBarIcon,
  ClockIcon,
  TrophyIcon,
  EyeIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#06B6D4'];

const Statistiques = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('month');
  const [stats, setStats] = useState({});

  // Données de démonstration
  const demoData = {
    performanceMensuelle: [
      { mois: 'Jan', participants: 65, formations: 3 },
      { mois: 'Fév', participants: 78, formations: 4 },
      { mois: 'Mar', participants: 90, formations: 5 },
      { mois: 'Avr', participants: 85, formations: 4 },
      { mois: 'Mai', participants: 95, formations: 6 },
      { mois: 'Juin', participants: 110, formations: 7 }
    ],
    participantsParFormation: [
      { nom: 'React Avancé', participants: 25 },
      { nom: 'Node.js', participants: 18 },
      { nom: 'Python ML', participants: 22 },
      { nom: 'DevOps', participants: 15 },
      { nom: 'UI/UX', participants: 20 }
    ],
    progressionMoyenne: [
      { semaine: 'S1', progression: 20 },
      { semaine: 'S2', progression: 45 },
      { semaine: 'S3', progression: 65 },
      { semaine: 'S4', progression: 80 },
      { semaine: 'S5', progression: 90 },
      { semaine: 'S6', progression: 95 }
    ]
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simulation d'un appel API
        const mockStats = {
          totalParticipants: 156,
          tauxReussite: 87,
          formationsActives: 8,
          noteMoyenne: 4.8,
          moyenneCompletion: 85
        };
        setStats(mockStats);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      }
    };

    fetchStats();
  }, [timeRange]);

  if (!stats) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
          className="relative"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500 border-t-transparent animate-ping"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Statistiques</h1>
              <p className="text-gray-600">Analysez vos performances et suivez votre progression</p>
            </div>
            <div className="flex items-center space-x-3">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">7 jours</option>
                <option value="month">30 jours</option>
                <option value="quarter">3 mois</option>
                <option value="year">1 an</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Cartes de statistiques principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants || 156}</p>
                <p className="text-sm text-green-600">+12% ce mois</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taux de Réussite</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tauxReussite || 87}%</p>
                <p className="text-sm text-green-600">+5% ce mois</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500 rounded-lg">
                <AcademicCapIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Formations Actives</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
                <p className="text-sm text-blue-600">3 en cours</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-500 rounded-lg">
                <StarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Note Moyenne</p>
                <p className="text-2xl font-bold text-gray-900">4.8/5</p>
                <p className="text-sm text-green-600">+0.2 ce mois</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Performance mensuelle */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <TrendingUpIcon className="h-6 w-6 text-blue-500 mr-2" />
                Performance Mensuelle
              </h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={demoData.performanceMensuelle}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mois" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="participants" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="formations" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#8B5CF6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Participants par formation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <ChartBarIcon className="h-6 w-6 text-green-500 mr-2" />
                Participants par Formation
              </h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demoData.participantsParFormation}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="nom" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="participants" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Graphiques secondaires */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Progression moyenne */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <ClockIcon className="h-6 w-6 text-purple-500 mr-2" />
                Progression Moyenne
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={demoData.progressionMoyenne}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="semaine" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="progression" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#8B5CF6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Répartition des formations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <TrophyIcon className="h-6 w-6 text-orange-500 mr-2" />
                Répartition des Formations
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demoData.participantsParFormation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="participants"
                  >
                    {demoData.participantsParFormation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Métriques détaillées */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <EyeIcon className="h-6 w-6 text-indigo-500 mr-2" />
            Métriques Détaillées
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Taux de complétion</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.moyenneCompletion || 85}%
                  </p>
                </div>
                <div className="p-2 bg-blue-500 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Moyenne sur toutes les formations
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Satisfaction</p>
                  <p className="text-2xl font-bold text-green-900">4.8/5</p>
                </div>
                <div className="p-2 bg-green-500 rounded-lg">
                  <StarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-xs text-green-700 mt-2">
                Note moyenne des participants
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Engagement</p>
                  <p className="text-2xl font-bold text-purple-900">92%</p>
                </div>
                <div className="p-2 bg-purple-500 rounded-lg">
                  <TrendingUpIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-xs text-purple-700 mt-2">
                Taux de participation actif
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Statistiques;
