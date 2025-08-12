import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { obtenirFormationsInscrites, obtenirNotifications } from '../../redux/slices/participantSlice';
import {
  AcademicCapIcon,
  CheckCircleIcon,
  BellIcon,
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  ChartBarIcon,
  UserGroupIcon,
  BookOpenIcon,
  ClockIcon,
  ArrowPathIcon,
  FireIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { toast } from 'react-toastify';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StatCard = ({ icon: Icon, title, value, color, percentage, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-2xl shadow-lg p-6 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-xl relative overflow-hidden cursor-pointer group`}
  >
    <div className={`absolute top-0 left-0 w-2 h-full ${color.replace('border-', 'bg-')}`} />
    <div className={`absolute top-0 right-0 w-32 h-32 ${color.replace('border-', 'bg-')} opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500`} />
    <div className="flex items-center justify-between mb-4 relative">
      <div className={`p-3 ${color.replace('border-', 'bg-').replace('-600', '-100')} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`h-6 w-6 ${color.replace('border-', 'text-')}`} />
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">{title}</p>
        <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{value}</p>
      </div>
    </div>
    {percentage !== undefined && (
      <div className="mt-4 relative">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color.replace('border-', 'bg-')} rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right group-hover:text-blue-600 transition-colors duration-300">
          {percentage.toFixed(1)}%
        </p>
      </div>
    )}
  </div>
);

const ProgressCircle = ({ value, color, size = "medium" }) => {
  const sizes = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32"
  };

  return (
    <div className={`${sizes[size]} relative group`}>
      <div className="absolute inset-0 rounded-full bg-gray-100 transform transition-transform duration-300 group-hover:scale-105" />
      <CircularProgressbar
        value={value}
        text={`${value.toFixed(1)}%`}
        styles={buildStyles({
          pathColor: color,
          textColor: color,
          trailColor: 'transparent',
          pathTransition: 'stroke-dashoffset 0.5s ease 0s',
          textSize: '1.5rem',
        })}
      />
    </div>
  );
};

const ActivityItem = ({ icon: Icon, title, time, isUnread }) => (
  <div className="flex items-center p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer group relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent group-hover:from-blue-50 group-hover:to-transparent transition-all duration-300" />
    <div className="p-2 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors duration-200 relative">
      <Icon className="h-5 w-5 text-blue-600" />
    </div>
    <div className="ml-4 flex-1 relative">
      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
        {title}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">
        {time}
      </p>
    </div>
    {isUnread && (
      <span className="h-2 w-2 bg-blue-600 rounded-full absolute right-4 top-1/2 transform -translate-y-1/2 animate-pulse" />
    )}
  </div>
);

const TableauBord = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('semaine');
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { formationsInscrites, notifications, loading: reduxLoading } = useSelector((state) => ({
    formationsInscrites: state.participant?.formationsInscrites?.data || [],
    notifications: state.participant?.notifications?.data || [],
    loading: state.participant?.loading
  }));

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(obtenirFormationsInscrites()),
        dispatch(obtenirNotifications())
      ]);
      toast.success('Données mises à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des données');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        await Promise.all([
          dispatch(obtenirFormationsInscrites()),
          dispatch(obtenirNotifications())
        ]);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role !== 'participant') {
      navigate('/');
      return;
    }

    chargerDonnees();
  }, [dispatch, navigate, user]);

  const formationsEnCours = Array.isArray(formationsInscrites) 
    ? formationsInscrites.filter(f => f.statut === 'en_cours')
    : [];
  const formationsTerminees = Array.isArray(formationsInscrites)
    ? formationsInscrites.filter(f => f.statut === 'termine')
    : [];
  const notificationsNonLues = Array.isArray(notifications)
    ? notifications.filter(n => !n.lue)
    : [];
  
  const tauxProgressionGlobal = formationsInscrites.length > 0
    ? (formationsTerminees.length / formationsInscrites.length) * 100
    : 0;

  const progressionData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Heures de formation',
        data: [10, 25, 15, 30, 20, 35],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Progression des formations',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Chargement de votre tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-pattern opacity-10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48 group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-3 group-hover:translate-x-2 transition-transform duration-300">
                Bienvenue, {user?.prenom || 'Participant'} !
              </h1>
              <p className="text-blue-100 group-hover:translate-x-2 transition-transform duration-300 delay-75 text-lg">
                Continuez votre parcours d'apprentissage
              </p>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="p-3 hover:bg-white/10 rounded-xl transition-all duration-300 relative group/btn"
            >
              <ArrowPathIcon className={`h-6 w-6 ${refreshing ? 'animate-spin' : 'group-hover/btn:rotate-180 transition-transform duration-500'}`} />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Actualiser
              </span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={AcademicCapIcon}
            title="Formations en cours"
            value={formationsEnCours.length}
            color="border-blue-600"
            percentage={(formationsEnCours.length / formationsInscrites.length) * 100 || 0}
            onClick={() => navigate('/formations')}
          />
          <StatCard
            icon={CheckCircleIcon}
            title="Formations terminées"
            value={formationsTerminees.length}
            color="border-green-600"
            percentage={(formationsTerminees.length / formationsInscrites.length) * 100 || 0}
            onClick={() => navigate('/formations')}
          />
          <StatCard
            icon={BellIcon}
            title="Notifications"
            value={notificationsNonLues.length}
            color="border-purple-600"
            onClick={() => navigate('/notifications')}
          />
          <StatCard
            icon={FireIcon}
            title="Progression globale"
            value={`${tauxProgressionGlobal.toFixed(1)}%`}
            color="border-orange-600"
            percentage={tauxProgressionGlobal}
          />
        </div>

        {/* Progress and Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <ChartBarIcon className="h-6 w-6 mr-2 text-blue-600" />
                Progression
              </h2>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 p-2.5 pr-8 appearance-none cursor-pointer hover:bg-gray-100 transition-colors duration-200"
              >
                <option value="semaine">Cette semaine</option>
                <option value="mois">Ce mois</option>
                <option value="annee">Cette année</option>
              </select>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              <Line options={options} data={progressionData} />
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <ClockIcon className="h-6 w-6 mr-2 text-purple-600" />
                Activités récentes
              </h2>
              {notificationsNonLues.length > 0 && (
                <span className="px-3 py-1 bg-purple-100 text-purple-600 text-sm font-medium rounded-full">
                  {notificationsNonLues.length} nouvelle{notificationsNonLues.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="space-y-2 relative">
              {notifications.slice(0, 5).map((notification, index) => (
                <ActivityItem
                  key={index}
                  icon={ClockIcon}
                  title={notification.message}
                  time={new Date(notification.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  isUnread={!notification.lue}
                />
              ))}
              {notifications.length > 5 && (
                <button
                  onClick={() => navigate('/notifications')}
                  className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 group flex items-center justify-center"
                >
                  Voir toutes les notifications
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <TrophyIcon className="h-6 w-6 mr-2 text-yellow-500" />
              Réalisations
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-6 p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl hover:shadow-md transition-all duration-300 group">
              <ProgressCircle value={tauxProgressionGlobal} color="#3b82f6" size="large" />
              <div>
                <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                  Progression globale
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Toutes formations confondues
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6 p-6 bg-gradient-to-br from-green-50 to-white rounded-2xl hover:shadow-md transition-all duration-300 group">
              <ProgressCircle 
                value={(formationsTerminees.length / Math.max(formationsInscrites.length, 1)) * 100} 
                color="#10b981"
                size="large"
              />
              <div>
                <p className="font-medium text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                  Taux de réussite
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Formations terminées
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6 p-6 bg-gradient-to-br from-purple-50 to-white rounded-2xl hover:shadow-md transition-all duration-300 group">
              <ProgressCircle 
                value={75}
                color="#8b5cf6"
                size="large"
              />
              <div>
                <p className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                  Engagement
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Participation active
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableauBord;
