import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserGroupIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon, 
  CheckIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  fetchUsers, 
  modifierUtilisateur, 
  supprimerUtilisateur, 
  changerStatutUtilisateur 
} from '../../redux/slices/adminSlice';

const GestionUtilisateurs = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    role: '',
    telephone: '',
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        nom: selectedUser.nom,
        prenom: selectedUser.prenom,
        email: selectedUser.email,
        role: selectedUser.role,
        telephone: selectedUser.telephone || '',
      });
    }
  }, [selectedUser]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        await dispatch(modifierUtilisateur({ id: selectedUser._id, ...formData })).unwrap();
      }
      setShowModal(false);
      setSelectedUser(null);
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        role: '',
        telephone: '',
      });
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await dispatch(supprimerUtilisateur(userId)).unwrap();
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
      }
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await dispatch(changerStatutUtilisateur({ userId, statut: newStatus })).unwrap();
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
    }
  };

  const filteredUsers = users?.filter(user =>
    user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculer les statistiques
  const stats = {
    total: users?.length || 0,
    actifs: users?.filter(user => user.statut === 'actif').length || 0,
    inactifs: users?.filter(user => user.statut === 'inactif').length || 0,
    enAttente: users?.filter(user => user.statut === 'en_attente').length || 0
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
            <span className="font-medium">Une erreur s'est produite: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-2xl mb-8 overflow-hidden">
          <div className="px-8 py-12 relative">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <UserGroupIcon className="w-full h-full" />
            </div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-white mb-4 flex items-center">
                <UserGroupIcon className="h-10 w-10 mr-4" />
                Gestion des Utilisateurs
              </h1>
              <p className="text-blue-100 text-lg">
                Gérez tous les utilisateurs de votre plateforme de formation
              </p>
            </div>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Actifs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.actifs}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <XMarkIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactifs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.inactifs}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-3xl font-bold text-gray-900">{stats.enAttente}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Barre de recherche moderne */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur par nom, prénom ou email..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedUser(null);
                setFormData({
                  nom: '',
                  prenom: '',
                  email: '',
                  role: '',
                  telephone: '',
                });
                setShowModal(true);
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Nouvel Utilisateur</span>
            </motion.button>
          </div>
        </div>

        {/* Tableau des utilisateurs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Liste des Utilisateurs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers?.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <UserGroupIcon className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-lg font-medium">Aucun utilisateur trouvé</p>
                        <p className="text-sm">Commencez par ajouter un nouvel utilisateur</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filteredUsers?.map((user, index) => (
                      <motion.tr 
                        key={user._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                              {user.nom?.charAt(0)}{user.prenom?.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.nom} {user.prenom}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'administrateur' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'formateur' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role === 'administrateur' ? 'Administrateur' :
                             user.role === 'formateur' ? 'Formateur' : 'Participant'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleStatusChange(user._id, 'actif')}
                                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                                  (user.statut || 'actif') === 'actif'
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                <div className="flex items-center space-x-1">
                                  <div className={`w-2 h-2 rounded-full ${
                                    (user.statut || 'actif') === 'actif' ? 'bg-white' : 'bg-green-500'
                                  }`}></div>
                                  <span>Actif</span>
                                </div>
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleStatusChange(user._id, 'inactif')}
                                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                                  (user.statut || 'actif') === 'inactif'
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                <div className="flex items-center space-x-1">
                                  <div className={`w-2 h-2 rounded-full ${
                                    (user.statut || 'actif') === 'inactif' ? 'bg-white' : 'bg-red-500'
                                  }`}></div>
                                  <span>Inactif</span>
                                </div>
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleStatusChange(user._id, 'en_attente')}
                                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                                  (user.statut || 'actif') === 'en_attente'
                                    ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                <div className="flex items-center space-x-1">
                                  <div className={`w-2 h-2 rounded-full ${
                                    (user.statut || 'actif') === 'en_attente' ? 'bg-white' : 'bg-yellow-500'
                                  }`}></div>
                                  <span>En attente</span>
                                </div>
                              </motion.button>
                            </div>
                            
                            {/* Indicateur visuel du statut actuel */}
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>Statut actuel:</span>
                              <span className={`font-medium ${
                                (user.statut || 'actif') === 'actif' ? 'text-green-600' :
                                (user.statut || 'actif') === 'inactif' ? 'text-red-600' :
                                'text-yellow-600'
                              }`}>
                                {user.statut === 'actif' ? '● Actif' :
                                 user.statut === 'inactif' ? '● Inactif' :
                                 user.statut === 'en_attente' ? '● En attente' : '● Actif'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedUser(user);
                                setShowModal(true);
                              }}
                              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
                            >
                              <PencilIcon className="h-4 w-4" />
                              <span>Modifier</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(user._id)}
                              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                            >
                              <TrashIcon className="h-4 w-4" />
                              <span>Supprimer</span>
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal pour ajouter/modifier un utilisateur */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                      {selectedUser ? 'Modifier' : 'Ajouter'} un utilisateur
                    </h2>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setSelectedUser(null);
                      }}
                      className="text-white hover:text-gray-200 transition-colors duration-200"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Entrez le nom"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Entrez le prénom"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Entrez l'email"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">Sélectionner un rôle</option>
                      <option value="participant">Participant</option>
                      <option value="formateur">Formateur</option>
                      <option value="administrateur">Administrateur</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Entrez le numéro de téléphone"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowModal(false);
                        setSelectedUser(null);
                      }}
                      className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 shadow-lg"
                    >
                      {selectedUser ? 'Mettre à jour' : 'Ajouter'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GestionUtilisateurs;
