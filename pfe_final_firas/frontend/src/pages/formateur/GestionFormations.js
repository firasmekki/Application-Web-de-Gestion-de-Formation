import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { obtenirFormations, deleteFormation } from '../../redux/slices/formationSlice';
import { motion } from 'framer-motion';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const GestionFormations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');

  const formations = useSelector((state) => state.formations.formations);
  const loading = useSelector((state) => state.formations.loading);
  const error = useSelector((state) => state.formations.error);

  useEffect(() => {
    dispatch(obtenirFormations());
  }, [dispatch]);

  const handleView = (id) => {
    navigate(`/formateur/formations/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/formateur/formation/modifier/${id}`);
  };

  const handleDelete = (formation) => {
    setSelectedFormation(formation);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedFormation) {
      await dispatch(deleteFormation(selectedFormation._id));
      setShowDeleteModal(false);
      setSelectedFormation(null);
    }
  };

  const getStatutStyle = (statut) => {
    switch (statut) {
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approuve':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'en_cours':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'termine':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'annule':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatutLabel = (statut) => {
    const labels = {
      'en_attente': 'En attente',
      'approuve': 'Approuvé',
      'en_cours': 'En cours',
      'termine': 'Terminé',
      'annule': 'Annulé'
    };
    return labels[statut] || statut;
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'en_attente':
        return <ClockIcon className="h-4 w-4" />;
      case 'approuve':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'en_cours':
        return <AcademicCapIcon className="h-4 w-4" />;
      case 'termine':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'annule':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  // Filtrer les formations
  const filteredFormations = formations?.filter(formation => {
    const matchesSearch = formation.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formation.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'tous' || formation.statut === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  // Statistiques
  const stats = {
    total: formations?.length || 0,
    enCours: formations?.filter(f => f.statut === 'en_cours').length || 0,
    approuve: formations?.filter(f => f.statut === 'approuve').length || 0,
    enAttente: formations?.filter(f => f.statut === 'en_attente').length || 0
  };

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Formations</h1>
              <p className="text-gray-600">Gérez vos formations et suivez leur progression</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/formateur/formations/creation')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nouvelle Formation
            </motion.button>
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 rounded-lg">
                <AcademicCapIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.enCours}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approuvées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approuve}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-500 rounded-lg">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.enAttente}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filtres et recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une formation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="tous">Tous les statuts</option>
                <option value="en_attente">En attente</option>
                <option value="approuve">Approuvé</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Liste des formations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Formations ({filteredFormations.length})</h2>
          </div>
          
          {filteredFormations.length === 0 ? (
            <div className="p-12 text-center">
              <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucune formation trouvée</p>
              <p className="text-gray-400">Créez votre première formation pour commencer</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredFormations.map((formation) => (
                <motion.div
                  key={formation._id}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <AcademicCapIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {formation.titre}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {formation.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <UserGroupIcon className="h-4 w-4 mr-1" />
                              {formation.participants?.length || 0} participants
                            </div>
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {formation.dateDebut ? new Date(formation.dateDebut).toLocaleDateString() : 'Non définie'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatutStyle(formation.statut)}`}>
                        <div className="flex items-center">
                          {getStatutIcon(formation.statut)}
                          <span className="ml-1">{getStatutLabel(formation.statut)}</span>
                        </div>
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleView(formation._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(formation._id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(formation)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Modal de confirmation de suppression */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmer la suppression</h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer la formation "{selectedFormation?.titre}" ? Cette action est irréversible.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionFormations;
