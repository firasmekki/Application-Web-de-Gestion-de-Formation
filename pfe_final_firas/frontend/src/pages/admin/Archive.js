import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrashIcon, 
  ArrowPathIcon, 
  EyeIcon,
  XMarkIcon,
  ArchiveBoxIcon,
  UserIcon,
  AcademicCapIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const API_URL = 'http://localhost:5000/api';

const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    withCredentials: true
  };
};

const StatCard = ({ icon: Icon, title, value, color, gradient, iconBg }) => (
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
      </div>
    </div>
  </motion.div>
);

const Archive = () => {
  const [tabValue, setTabValue] = useState(0);
  const [archives, setArchives] = useState({
    formations: [],
    utilisateurs: [],
  });
  const [filters, setFilters] = useState({
    dateDebut: null,
    dateFin: null,
    type: 'tous',
    recherche: '',
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchArchives();
  }, [tabValue, filters]);

  const fetchArchives = async () => {
    setLoading(true);
    try {
      const type = tabValue === 0 ? 'formations' : 'utilisateurs';
      const params = {
        dateDebut: filters.dateDebut?.toISOString(),
        dateFin: filters.dateFin?.toISOString(),
        type: filters.type,
        recherche: filters.recherche,
      };
      const response = await axios.get(`${API_URL}/archives/${type}`, { 
        params,
        ...getConfig()
      });
      setArchives((prev) => ({ ...prev, [type]: response.data.data }));
    } catch (error) {
      console.error('Error fetching archives:', error);
      setMessage({
        type: 'error',
        content: 'Erreur lors du chargement des archives',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id, type) => {
    try {
      await axios.put(`${API_URL}/archives/${type}/${id}/restore`, {}, getConfig());
      fetchArchives();
      setMessage({
        type: 'success',
        content: 'Élément restauré avec succès',
      });
    } catch (error) {
      console.error('Error restoring archive:', error);
      setMessage({
        type: 'error',
        content: 'Erreur lors de la restauration',
      });
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer définitivement cet élément ?')) {
      try {
        await axios.delete(`${API_URL}/archives/${type}/${id}`, getConfig());
        fetchArchives();
        setMessage({
          type: 'success',
          content: 'Élément supprimé définitivement',
        });
      } catch (error) {
        console.error('Error deleting archive:', error);
        setMessage({
          type: 'error',
          content: 'Erreur lors de la suppression',
        });
      }
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  if (loading) {
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
                <ArchiveBoxIcon className="h-8 w-8 text-orange-500 mr-3" />
                Gestion des Archives
              </h1>
              <p className="text-gray-600">Consultez et gérez les éléments archivés de votre plateforme</p>
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <AnimatePresence>
          {message.content && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-xl shadow-lg ${
                message.type === 'success' 
                  ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-800' 
                  : 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                )}
                {message.content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            icon={AcademicCapIcon}
            title="Formations Archivées"
            value={archives.formations.length}
            color="text-blue-600"
            gradient="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            iconBg="bg-blue-100"
          />
          <StatCard
            icon={UserIcon}
            title="Utilisateurs Archivés"
            value={archives.utilisateurs.length}
            color="text-purple-600"
            gradient="bg-gradient-to-br from-purple-500 to-purple-600 text-white"
            iconBg="bg-purple-100"
          />
          <StatCard
            icon={CalendarIcon}
            title="Total Archives"
            value={archives.formations.length + archives.utilisateurs.length}
            color="text-green-600"
            gradient="bg-gradient-to-br from-green-500 to-green-600 text-white"
            iconBg="bg-green-100"
          />
          <StatCard
            icon={ArchiveBoxIcon}
            title="Espace Utilisé"
            value={`${Math.round((archives.formations.length + archives.utilisateurs.length) * 0.5)} MB`}
            color="text-orange-600"
            gradient="bg-gradient-to-br from-orange-500 to-orange-600 text-white"
            iconBg="bg-orange-100"
          />
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <FunnelIcon className="h-6 w-6 text-blue-500 mr-2" />
            Filtres de recherche
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date début
              </label>
              <DatePicker
                selected={filters.dateDebut}
                onChange={(date) => setFilters({ ...filters, dateDebut: date })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                dateFormat="dd/MM/yyyy"
                placeholderText="Sélectionner une date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date fin
              </label>
              <DatePicker
                selected={filters.dateFin}
                onChange={(date) => setFilters({ ...filters, dateFin: date })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                dateFormat="dd/MM/yyyy"
                placeholderText="Sélectionner une date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="tous">Tous</option>
                <option value="formation">Formation</option>
                <option value="utilisateur">Utilisateur</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.recherche}
                  onChange={(e) => setFilters({ ...filters, recherche: e.target.value })}
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTabValue(0)}
                  className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-all duration-200 ${
                    tabValue === 0
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <AcademicCapIcon className="h-5 w-5 inline mr-2" />
                  Formations archivées
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTabValue(1)}
                  className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-all duration-200 ${
                    tabValue === 1
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <UserIcon className="h-5 w-5 inline mr-2" />
                  Utilisateurs archivés
                </motion.button>
              </nav>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {tabValue === 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-500 to-blue-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Titre
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Formateur
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Date d'archivage
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Raison
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {archives.formations.map((formation, index) => (
                    <motion.tr
                      key={formation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formation.titre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {`${formation.formateur?.nom || ''} ${formation.formateur?.prenom || ''}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(formation.dateArchivage).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          {formation.raisonArchivage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleViewDetails(formation)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRestore(formation.id, 'formations')}
                          className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-all duration-200"
                        >
                          <ArrowPathIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(formation.id, 'formations')}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-purple-500 to-purple-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Date d'archivage
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Raison
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {archives.utilisateurs.map((utilisateur, index) => (
                    <motion.tr
                      key={utilisateur.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {`${utilisateur.nom} ${utilisateur.prenom}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {utilisateur.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          utilisateur.type === 'formateur' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {utilisateur.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(utilisateur.dateArchivage).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          {utilisateur.raisonArchivage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleViewDetails(utilisateur)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRestore(utilisateur.id, 'utilisateurs')}
                          className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-all duration-200"
                        >
                          <ArrowPathIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(utilisateur.id, 'utilisateurs')}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Details Dialog */}
        <AnimatePresence>
          {openDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-center min-h-screen p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50"
                  onClick={() => setOpenDialog(false)}
                ></motion.div>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full"
                >
                  <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <EyeIcon className="h-5 w-5 mr-2 text-blue-500" />
                      Détails
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setOpenDialog(false)}
                      className="text-gray-400 hover:text-gray-500 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </motion.button>
                  </div>
                  <div className="p-6">
                    {selectedItem && (
                      <div className="space-y-4">
                        {Object.entries(selectedItem).map(([key, value]) => (
                          <div key={key} className="border-b border-gray-100 pb-3">
                            <dt className="text-sm font-medium text-gray-500 mb-1">
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </dt>
                            <dd className="text-sm text-gray-900 font-medium">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </dd>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end p-6 border-t border-gray-200">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setOpenDialog(false)}
                      className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
                    >
                      Fermer
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Archive;
