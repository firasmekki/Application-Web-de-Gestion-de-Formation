import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { obtenirStatistiquesFormateur } from '../../redux/slices/formateurSlice';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  UserGroupIcon,
  StarIcon,
  PlusIcon,
  UserIcon,
  ChartBarIcon,
  BellIcon,
  CogIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CalendarIcon,
  BookOpenIcon,
  UserIcon as UsersIcon,
  TrophyIcon,
  ChartBarSquareIcon as TrendingUpIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ icon: Icon, title, value, subValue, color, gradient, iconBg, trend }) => (
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
        {trend && (
          <div className={`text-sm font-medium ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
          }`}>
            <span className="mr-1">
              {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'}
            </span>
            {Math.abs(trend)}%
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

const TableauBord = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { statistiques } = useSelector((state) => state.formateur);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        await dispatch(obtenirStatistiquesFormateur()).unwrap();
      } catch (err) {
        setError('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    chargerDonnees();
  }, [dispatch]);

  if (loading) {
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

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Une erreur s'est produite: {error}
      </div>
    );
  }

  // Données de démonstration pour les statistiques
  const stats = {
    formationsEnCours: 3,
    totalFormations: 8,
    totalParticipants: 45,
    noteMoyenne: 4.7,
    formationsTerminees: 5,
    formationsEnAttente: 2,
    inscriptionsMois: 12,
    tauxReussite: 92
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header avec profil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <UserIcon className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Bienvenue, {user?.prenom || 'Formateur'} !
                </h1>
                <p className="text-gray-600">Tableau de bord formateur - Gérez vos formations</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-500">Formateur certifié</span>
                  <span className="text-sm text-green-600 font-medium">● En ligne</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Actif</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/formateur/profil')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center"
              >
                <UserIcon className="h-5 w-5 mr-2" />
                Mon Profil
              </motion.button>
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
          <StatCard
            icon={AcademicCapIcon}
            title="Formations Actives"
            value={stats.formationsEnCours}
            subValue={`${stats.totalFormations} au total`}
            color="text-blue-600"
            gradient="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            iconBg="bg-blue-100"
            trend={15}
          />
          <StatCard
            icon={UserGroupIcon}
            title="Participants"
            value={stats.totalParticipants}
            subValue={`${stats.inscriptionsMois} ce mois`}
            color="text-purple-600"
            gradient="bg-gradient-to-br from-purple-500 to-purple-600 text-white"
            iconBg="bg-purple-100"
            trend={22}
          />
          <StatCard
            icon={StarIcon}
            title="Note Moyenne"
            value={`${stats.noteMoyenne}/5`}
            subValue="Excellent"
            color="text-yellow-600"
            gradient="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white"
            iconBg="bg-yellow-100"
            trend={8}
          />
          <StatCard
            icon={TrophyIcon}
            title="Taux de Réussite"
            value={`${stats.tauxReussite}%`}
            subValue="Très bon"
            color="text-green-600"
            gradient="bg-gradient-to-br from-green-500 to-green-600 text-white"
            iconBg="bg-green-100"
            trend={5}
          />
        </motion.div>

        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <CogIcon className="h-6 w-6 text-gray-500 mr-2" />
            Actions rapides
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/formateur/formations/creation')}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Créer Formation
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/formateur/formations')}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
            >
              <BookOpenIcon className="h-5 w-5 mr-2" />
              Mes Formations
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/formateur/chat')}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
              Messages
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/formateur/notifications')}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
            >
              <BellIcon className="h-5 w-5 mr-2" />
              Notifications
            </motion.button>
          </div>
        </motion.div>

        {/* Section principale avec graphiques et détails */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8"
        >
          {/* Statistiques détaillées */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <ChartBarIcon className="h-6 w-6 text-blue-500 mr-2" />
              Statistiques détaillées
            </h3>
            
            {/* Métriques de performance */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <AcademicCapIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">Total Formations</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.totalFormations}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CheckCircleIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">Terminées</p>
                    <p className="text-2xl font-bold text-green-900">{stats.formationsTerminees}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <UsersIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-600">Participants</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.totalParticipants}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <ClockIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-orange-600">En Attente</p>
                    <p className="text-2xl font-bold text-orange-900">{stats.formationsEnAttente}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Graphique de performance (placeholder) */}
            <div className="h-64 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Graphique de performance</p>
                <p className="text-sm text-gray-400">Évolution des formations et participants</p>
              </div>
            </div>
          </div>

          {/* Profil et activités récentes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <UserIcon className="h-6 w-6 text-purple-500 mr-2" />
              Mon Profil
            </h3>
            
            {/* Informations du profil */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{user?.prenom} {user?.nom}</h4>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <div className="flex items-center mt-1">
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-600 ml-1">{stats.noteMoyenne}/5</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Formations créées</span>
                  <span className="font-semibold text-gray-900">{stats.totalFormations}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Participants formés</span>
                  <span className="font-semibold text-gray-900">{stats.totalParticipants}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Taux de réussite</span>
                  <span className="font-semibold text-green-600">{stats.tauxReussite}%</span>
                </div>
              </div>
            </div>
            
            {/* Actions du profil */}
            <div className="space-y-2">
              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => navigate('/formateur/profil')}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Modifier le profil</span>
                </div>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </motion.button>
              
              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => navigate('/formateur/statistiques')}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Voir les statistiques</span>
                </div>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Formations récentes et activités */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          {/* Formations récentes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <BookOpenIcon className="h-6 w-6 text-blue-500 mr-2" />
              Formations récentes
            </h3>
            <div className="space-y-4">
              {[
                { id: 1, titre: "React.js Avancé", participants: 15, statut: "en_cours", date: "2024-01-15" },
                { id: 2, titre: "Flutter Mobile", participants: 12, statut: "terminee", date: "2024-01-10" },
                { id: 3, titre: "Intelligence Artificielle", participants: 18, statut: "en_attente", date: "2024-01-20" }
              ].map((formation) => (
                <motion.div
                  key={formation.id}
                  whileHover={{ x: 4 }}
                  className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  onClick={() => navigate(`/formateur/formations/${formation.id}`)}
                >
                  <div className={`w-3 h-3 rounded-full mr-4 ${
                    formation.statut === 'en_cours' ? 'bg-blue-500' :
                    formation.statut === 'terminee' ? 'bg-green-500' : 'bg-orange-500'
                  }`}></div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{formation.titre}</h4>
                    <p className="text-xs text-gray-500">
                      {formation.participants} participants • {new Date(formation.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    formation.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                    formation.statut === 'terminee' ? 'bg-green-100 text-green-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {formation.statut === 'en_cours' ? 'En cours' :
                     formation.statut === 'terminee' ? 'Terminée' : 'En attente'}
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 text-right">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/formateur/formations')}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                Voir toutes les formations
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </motion.button>
            </div>
          </div>

          {/* Activités récentes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <BellIcon className="h-6 w-6 text-green-500 mr-2" />
              Activités récentes
            </h3>
            <div className="space-y-4">
              {[
                { id: 1, action: "Nouvelle inscription", detail: "Ahmed s'est inscrit à React.js", time: "Il y a 2h", type: "inscription" },
                { id: 2, action: "Formation terminée", detail: "Flutter Mobile a été complétée", time: "Il y a 1j", type: "success" },
                { id: 3, action: "Nouveau message", detail: "Message de Sarah concernant IA", time: "Il y a 3h", type: "message" },
                { id: 4, action: "Évaluation reçue", detail: "Note 5/5 pour React.js", time: "Il y a 5h", type: "evaluation" }
              ].map((activite) => (
                <motion.div
                  key={activite.id}
                  whileHover={{ x: 4 }}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activite.type === 'inscription' ? 'bg-blue-500' :
                    activite.type === 'success' ? 'bg-green-500' :
                    activite.type === 'message' ? 'bg-purple-500' : 'bg-yellow-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activite.action}</p>
                    <p className="text-xs text-gray-500">{activite.detail}</p>
                    <p className="text-xs text-gray-400 mt-1">{activite.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 text-right">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/formateur/notifications')}
                className="text-green-600 hover:text-green-800 font-medium flex items-center"
              >
                Voir toutes les activités
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TableauBord;
