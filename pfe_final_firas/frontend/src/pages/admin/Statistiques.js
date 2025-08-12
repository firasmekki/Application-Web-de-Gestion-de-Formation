import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStatistics } from '../../redux/slices/adminSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler,
} from 'chart.js';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  ChartBarIcon,
  CalendarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  UserIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  PrinterIcon,
  EyeIcon,
  ChartBarSquareIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler
);

const StatCard = ({ icon: Icon, title, value, subValue, color, gradient, iconBg }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -5 }}
    whileTap={{ scale: 0.98 }}
    className={`relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl ${gradient || 'bg-gradient-to-br from-gray-500 to-gray-600'}`}
  >
    {Icon && (
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <Icon className="w-full h-full" />
      </div>
    )}
    <div className="relative p-6">
      <div className="flex items-center justify-between">
        {Icon && (
          <div className={`p-3 rounded-lg ${iconBg || 'bg-gray-100'}`}>
            <Icon className={`h-6 w-6 ${color || 'text-gray-600'}`} />
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-3xl font-bold ${color || 'text-gray-600'} mt-2`}>{value}</p>
        {subValue && <p className="text-sm text-gray-500 mt-1">{subValue}</p>}
      </div>
    </div>
  </motion.div>
);

function Statistiques() {
  const dispatch = useDispatch();
  const { statistics, loading: statsLoading, error: adminError } = useSelector((state) => state.admin);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [message, setMessage] = useState({});

  const {
    formations: { summary: { total: totalFormations = 0, active: enCours = 0, archived: terminees = 0, inactive: enAttente = 0, aVenir = 0 } = {}, monthly: { labels: timelineLabels = [], formations: formationsData = [], inscriptions: inscriptionsData = [] } = {} } = {},
    formateurs: { summary: { total: totalFormateurs = 0, active: formateursActifs = 0 } = {} } = {},
    participants: { summary: { total: totalParticipants = 0, active: participantsActifs = 0 } = {} } = {},
    global: { totalInscriptions = 0, inscriptionsMois = 0 } = {}
  } = statistics || {};

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        await dispatch(fetchStatistics()).unwrap();
      } catch (err) {
        setMessage({
          type: 'error',
          content: 'Erreur lors du chargement des statistiques'
        });
      }
    };

    chargerDonnees();
  }, [dispatch]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '600'
          },
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.05)',
          lineWidth: 1
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6B7280',
          stepSize: 1
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 10
          },
          color: '#6B7280'
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    }
  };

  // Données de démonstration pour les graphiques
  const demoFormationsData = [0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const demoInscriptionsData = [0, 0, 2, 1, 0, 3, 2, 1, 0, 4, 2, 1, 0, 0, 5, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const performanceData = {
    labels: timelineLabels.length > 0 ? timelineLabels : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
    datasets: [
      {
        label: 'Formations créées',
        data: formationsData.length > 0 ? formationsData : demoFormationsData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) {
            return null;
          }
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.3)');
          return gradient;
        },
        tension: 0.6,
        fill: true,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 3,
        cubicInterpolationMode: 'monotone'
      },
      {
        label: 'Inscriptions',
        data: inscriptionsData.length > 0 ? inscriptionsData : demoInscriptionsData,
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) {
            return null;
          }
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(147, 51, 234, 0.1)');
          gradient.addColorStop(1, 'rgba(147, 51, 234, 0.3)');
          return gradient;
        },
        tension: 0.6,
        fill: true,
        pointBackgroundColor: 'rgb(147, 51, 234)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 3,
        cubicInterpolationMode: 'monotone'
      }
    ]
  };

  const statusData = {
    labels: ['En cours', 'Terminées', 'À venir', 'En attente'],
    datasets: [{
      data: [enCours || 0, terminees || 0, aVenir || 0, enAttente || 0],
      backgroundColor: [
        'rgba(59, 130, 246, 0.9)',
        'rgba(34, 197, 94, 0.9)',
        'rgba(245, 158, 11, 0.9)',
        'rgba(156, 163, 175, 0.9)'
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(34, 197, 94)',
        'rgb(245, 158, 11)',
        'rgb(156, 163, 175)'
      ],
      borderWidth: 3,
      hoverBorderWidth: 4
    }]
  };

  const activityData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [{
      label: 'Activité',
      data: [12, 19, 15, 25, 22, 18, 14],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2,
      borderRadius: 4
    }]
  };

  if (statsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-gray-50 to-gray-100">
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
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <ChartBarIcon className="h-8 w-8 text-blue-500 mr-3" />
                Statistiques et Rapports
              </h1>
              <p className="text-gray-600">Analyse détaillée des performances de votre plateforme</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center"
              onClick={() => window.print()}
            >
              <PrinterIcon className="h-5 w-5 mr-2" />
              Exporter le Rapport
            </motion.button>
          </div>
        </motion.div>

        {/* Cartes de statistiques principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
        >
          <StatCard
            icon={AcademicCapIcon}
            title="Total Formations"
            value={totalFormations}
            subValue={`${enCours} en cours`}
            color="text-blue-600"
            gradient="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            iconBg="bg-blue-100"
          />
          <StatCard
            icon={UserGroupIcon}
            title="Total Participants"
            value={totalParticipants}
            subValue={`${participantsActifs} actifs`}
            color="text-green-600"
            gradient="bg-gradient-to-br from-green-500 to-green-600 text-white"
            iconBg="bg-green-100"
          />
          <StatCard
            icon={UserIcon}
            title="Total Formateurs"
            value={totalFormateurs}
            subValue={`${formateursActifs} actifs`}
            color="text-purple-600"
            gradient="bg-gradient-to-br from-purple-500 to-purple-600 text-white"
            iconBg="bg-purple-100"
          />
          <StatCard
            icon={CheckCircleIcon}
            title="Formations Terminées"
            value={terminees}
            subValue={`${totalFormations > 0 ? Math.round((terminees / totalFormations) * 100) : 0}% du total`}
            color="text-orange-600"
            gradient="bg-gradient-to-br from-orange-500 to-orange-600 text-white"
            iconBg="bg-orange-100"
          />
          <StatCard
            icon={ClockIcon}
            title="En Attente"
            value={enAttente}
            subValue="Validation requise"
            color="text-red-600"
            gradient="bg-gradient-to-br from-red-500 to-red-600 text-white"
            iconBg="bg-red-100"
          />
                </motion.div>

        {/* Statistiques détaillées */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <ChartBarIcon className="h-6 w-6 text-indigo-500 mr-2" />
            Statistiques détaillées
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Taux de complétion</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {totalFormations > 0 ? Math.round((terminees / totalFormations) * 100) : 0}%
                  </p>
                </div>
                <div className="p-2 bg-blue-500 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                {terminees} formations terminées sur {totalFormations}
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Taux d'activité</p>
                  <p className="text-2xl font-bold text-green-900">
                    {totalParticipants > 0 ? Math.round((participantsActifs / totalParticipants) * 100) : 0}%
                  </p>
                </div>
                <div className="p-2 bg-green-500 rounded-lg">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-xs text-green-700 mt-2">
                {participantsActifs} participants actifs sur {totalParticipants}
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Efficacité formateurs</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {totalFormateurs > 0 ? Math.round((formateursActifs / totalFormateurs) * 100) : 0}%
                  </p>
                </div>
                <div className="p-2 bg-purple-500 rounded-lg">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-xs text-purple-700 mt-2">
                {formateursActifs} formateurs actifs sur {totalFormateurs}
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <CalendarIcon className="h-6 w-6 text-blue-500 mr-2" />
            Filtres de période
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="day">Jour</option>
                <option value="week">Semaine</option>
                <option value="month">Mois</option>
                <option value="year">Année</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                dateFormat="dd/MM/yyyy"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                dateFormat="dd/MM/yyyy"
              />
            </div>
            
            <div className="flex items-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center"
                onClick={() => {}}
                disabled={loading}
              >
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                {loading ? 'Chargement...' : 'Mettre à jour'}
              </motion.button>
            </div>
          </div>
        </motion.div>
        
        {/* Graphiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8"
        >
          {/* Graphique de performance */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <ChartBarSquareIcon className="h-6 w-6 text-blue-500 mr-2" />
              Performance des formations
            </h3>
            <div className="h-80">
              <Line data={performanceData} options={chartOptions} />
            </div>
          </div>

          {/* Graphique des statuts */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <ChartBarIcon className="h-6 w-6 text-green-500 mr-2" />
              Répartition par statut
            </h3>
            <div className="h-80">
              <Doughnut 
                data={statusData}
                options={{
                  ...chartOptions,
                  cutout: '65%',
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      position: 'bottom',
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                          size: 12,
                          weight: '600'
                        },
                        color: '#374151'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Graphiques supplémentaires */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Activité par période */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <ClockIcon className="h-6 w-6 text-purple-500 mr-2" />
              Activité par période
            </h3>
            <div className="h-80">
              <Bar data={activityData} options={chartOptions} />
            </div>
          </div>
          
          {/* Répartition des niveaux */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <DocumentTextIcon className="h-6 w-6 text-orange-500 mr-2" />
              Répartition des niveaux
            </h3>
            <div className="h-80">
              <Pie 
                data={{
                  labels: ['Débutant', 'Intermédiaire', 'Avancé'],
                  datasets: [{
                    data: [30, 45, 25],
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.8)',
                      'rgba(147, 51, 234, 0.8)',
                      'rgba(245, 158, 11, 0.8)'
                    ],
                    borderColor: [
                      'rgb(59, 130, 246)',
                      'rgb(147, 51, 234)',
                      'rgb(245, 158, 11)'
                    ],
                    borderWidth: 2
                  }]
                }}
                options={chartOptions}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Statistiques;
