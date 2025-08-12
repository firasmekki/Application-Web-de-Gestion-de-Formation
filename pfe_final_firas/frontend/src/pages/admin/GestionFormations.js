import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { obtenirToutesFormations, createFormation, updateFormation, deleteFormation } from '../../redux/slices/formationSlice';
import { getDomaines } from '../../redux/slices/domaineSlice';
import { fetchUsers } from '../../redux/slices/adminSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AcademicCapIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const GestionFormations = () => {
  const dispatch = useDispatch();
  const { formations, loading, error } = useSelector((state) => state.formations);
  const { items: domaines } = useSelector((state) => state.domaines);
  const { users } = useSelector((state) => state.admin);
  
  // Filtrer les formateurs parmi les utilisateurs
  const formateurs = users.filter(user => user.role === 'formateur');
  
  // Debug: afficher les domaines et formateurs
  useEffect(() => {
    console.log('GestionFormations: Domaines récupérés:', domaines);
    console.log('GestionFormations: Formateurs récupérés:', formateurs);
  }, [domaines, formateurs]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showRefusModal, setShowRefusModal] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [motifRefus, setMotifRefus] = useState('');
  const [formData, setFormData] = useState(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return {
      titre: '',
      description: '',
      dateDebut: today,
      dateFin: tomorrow,
      capaciteMax: '',
      duree: '',
      niveau: '',
      modalites: '',
      lieu: '',
      lienVisio: '',
      domaine: '',
      formateur: '',
    };
  });

  useEffect(() => {
    dispatch(obtenirToutesFormations());
    dispatch(getDomaines());
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // S'assurer que les dates sont des objets Date valides
    const formDataToSubmit = {
      ...formData,
      dateDebut: formData.dateDebut instanceof Date ? formData.dateDebut : new Date(formData.dateDebut),
      dateFin: formData.dateFin instanceof Date ? formData.dateFin : new Date(formData.dateFin)
    };
    
    try {
      if (selectedFormation) {
        await dispatch(updateFormation({ id: selectedFormation._id, ...formDataToSubmit })).unwrap();
      } else {
        await dispatch(createFormation(formDataToSubmit)).unwrap();
      }
      setShowModal(false);
      setSelectedFormation(null);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setFormData({
        titre: '',
        description: '',
        dateDebut: today,
        dateFin: tomorrow,
        capaciteMax: '',
        duree: '',
        niveau: '',
        modalites: '',
        lieu: '',
        lienVisio: '',
        domaine: '',
        formateur: '',
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleEdit = (formation) => {
    setSelectedFormation(formation);
    // S'assurer que les dates sont des objets Date valides
    const formationWithDates = {
      ...formation,
      dateDebut: formation.dateDebut ? new Date(formation.dateDebut) : new Date(),
      dateFin: formation.dateFin ? new Date(formation.dateFin) : new Date()
    };
    setFormData(formationWithDates);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      dispatch(deleteFormation(id));
    }
  };

  const handleApprove = async (formation) => {
    try {
      await dispatch(updateFormation({ 
        id: formation._id, 
        ...formation,
        statut: 'approuve'
      })).unwrap();
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
    }
  };

  const handleRefuse = async (formation) => {
    setSelectedFormation(formation);
    setShowRefusModal(true);
  };

  const submitRefus = async () => {
    try {
      await dispatch(updateFormation({ 
        id: selectedFormation._id, 
        ...selectedFormation,
        statut: 'refuse',
        motifRefus
      })).unwrap();
      setShowRefusModal(false);
      setMotifRefus('');
      setSelectedFormation(null);
    } catch (error) {
      console.error('Erreur lors du refus:', error);
    }
  };

  // Filtrer les formations selon le terme de recherche
  const filteredFormations = formations.filter(formation =>
    formation.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formation.domaine?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formation.formateur?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculer les statistiques
  const stats = {
    total: formations.length,
    approuvees: formations.filter(f => f.statut === 'approuve').length,
    enAttente: formations.filter(f => f.statut === 'en_attente').length,
    refusees: formations.filter(f => f.statut === 'refuse').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div 
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Chargement des formations...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header avec gradient */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <AcademicCapIcon className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">Gestion des Formations</h1>
                  <p className="text-blue-100 text-lg">Gérez et supervisez toutes les formations de la plateforme</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedFormation(null);
                  setFormData({
                    titre: '',
                    description: '',
                    dateDebut: new Date(),
                    dateFin: new Date(),
                    capacite: '',
                    domaine: '',
                    formateur: '',
                  });
                  setShowModal(true);
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-xl hover:bg-white hover:bg-opacity-30 transition-all duration-300 border border-white border-opacity-30"
              >
                <PlusIcon className="h-5 w-5" />
                <span className="font-semibold">Nouvelle Formation</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Statistiques rapides */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <AcademicCapIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approuvées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approuvees}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.enAttente}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Refusées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.refusees}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Barre de recherche moderne */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Rechercher une formation, domaine ou formateur..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-6 py-4 pl-14 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg bg-white text-lg transition-all duration-200"
            />
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </motion.div>

        {/* Table des formations avec design moderne */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Liste des Formations ({filteredFormations.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Domaine
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Formateur
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFormations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <AcademicCapIcon className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-lg font-medium">Aucune formation trouvée</p>
                        <p className="text-sm">Commencez par créer une nouvelle formation</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filteredFormations.map((formation, index) => (
                      <motion.tr 
                        key={formation._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                            <span className="text-sm font-medium text-gray-900">{formation.titre}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {formation.domaine?.nom || 'Non spécifié'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <CalendarIcon className="h-4 w-4 mr-2 text-blue-500" />
                              <span>Début: {new Date(formation.dateDebut).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <CalendarIcon className="h-4 w-4 mr-2 text-purple-500" />
                              <span>Fin: {new Date(formation.dateFin).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 mr-2 text-green-500" />
                            <span className="text-sm text-gray-600">
                              {formation.formateur ? `${formation.formateur.nom} ${formation.formateur.prenom}` : 'Non assigné'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${formation.statut === 'approuve' ? 'bg-green-100 text-green-800' : 
                              formation.statut === 'refuse' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {formation.statut === 'approuve' ? 'Approuvé' : 
                             formation.statut === 'refuse' ? 'Refusé' : 
                             formation.statut === 'en_attente' ? 'En attente' : 
                             formation.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {formation.statut === 'en_attente' && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleApprove(formation)}
                                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
                                >
                                  <CheckIcon className="h-4 w-4" />
                                  <span>Approuver</span>
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleRefuse(formation)}
                                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                                >
                                  <ExclamationTriangleIcon className="h-4 w-4" />
                                  <span>Refuser</span>
                                </motion.button>
                              </>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEdit(formation)}
                              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
                            >
                              <PencilIcon className="h-4 w-4" />
                              <span>Modifier</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(formation._id)}
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
        </motion.div>

        {/* Modal moderne */}
        <AnimatePresence>
          {showModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                {/* Header du modal */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 sticky top-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      {selectedFormation ? 'Modifier la formation' : 'Nouvelle formation'}
                    </h3>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-white hover:text-gray-200 transition-colors duration-200"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Contenu du modal */}
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titre *
                        </label>
                        <input
                          type="text"
                          value={formData.titre}
                          onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                          placeholder="Titre de la formation"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Domaine *
                        </label>
                        <select
                          value={formData.domaine}
                          onChange={(e) => setFormData({ ...formData, domaine: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                        >
                          <option value="">Sélectionner un domaine</option>
                          {domaines && domaines.map((domaine) => (
                            <option key={domaine._id} value={domaine._id}>
                              {domaine.nom}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                        rows="3"
                        placeholder="Description détaillée de la formation..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de début *
                        </label>
                        <input
                          type="date"
                          value={formData.dateDebut && formData.dateDebut instanceof Date ? formData.dateDebut.toISOString().split('T')[0] : ''}
                          onChange={(e) => setFormData({ ...formData, dateDebut: new Date(e.target.value) })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de fin *
                        </label>
                        <input
                          type="date"
                          value={formData.dateFin && formData.dateFin instanceof Date ? formData.dateFin.toISOString().split('T')[0] : ''}
                          min={formData.dateDebut && formData.dateDebut instanceof Date ? formData.dateDebut.toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const selectedDate = new Date(e.target.value);
                            if (formData.dateDebut && selectedDate <= formData.dateDebut) {
                              const nextDay = new Date(formData.dateDebut);
                              nextDay.setDate(nextDay.getDate() + 1);
                              setFormData({ ...formData, dateFin: nextDay });
                            } else {
                              setFormData({ ...formData, dateFin: selectedDate });
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Capacité maximale *
                        </label>
                        <input
                          type="number"
                          value={formData.capaciteMax}
                          onChange={(e) => setFormData({ ...formData, capaciteMax: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                          placeholder="Nombre de participants"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Durée (heures) *
                        </label>
                        <input
                          type="number"
                          value={formData.duree}
                          onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                          placeholder="Durée en heures"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Niveau *
                        </label>
                        <select
                          value={formData.niveau}
                          onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                        >
                          <option value="">Sélectionner un niveau</option>
                          <option value="debutant">Débutant</option>
                          <option value="intermediaire">Intermédiaire</option>
                          <option value="avance">Avancé</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Modalités *
                        </label>
                        <select
                          value={formData.modalites}
                          onChange={(e) => setFormData({ ...formData, modalites: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                        >
                          <option value="">Sélectionner les modalités</option>
                          <option value="presentiel">Présentiel</option>
                          <option value="distanciel">Distanciel</option>
                          <option value="hybride">Hybride</option>
                        </select>
                      </div>
                    </div>

                    {formData.modalites && formData.modalites !== 'distanciel' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lieu *
                        </label>
                        <input
                          type="text"
                          value={formData.lieu}
                          onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                          placeholder="Adresse ou lieu de la formation"
                        />
                      </div>
                    )}

                    {formData.modalites && formData.modalites !== 'presentiel' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lien de visioconférence *
                        </label>
                        <input
                          type="url"
                          value={formData.lienVisio}
                          onChange={(e) => setFormData({ ...formData, lienVisio: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                          placeholder="https://..."
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Formateur
                      </label>
                      <select
                        value={formData.formateur}
                        onChange={(e) => setFormData({ ...formData, formateur: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Sélectionner un formateur</option>
                        {formateurs && formateurs.map((formateur) => (
                          <option key={formateur._id} value={formateur._id}>
                            {formateur.nom} {formateur.prenom}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowModal(false)}
                        className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                      >
                        Annuler
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                      >
                        {selectedFormation ? 'Modifier' : 'Créer'}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de refus moderne */}
        <AnimatePresence>
          {showRefusModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              >
                {/* Header du modal */}
                <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      Motif du refus
                    </h3>
                    <button
                      onClick={() => {
                        setShowRefusModal(false);
                        setMotifRefus('');
                        setSelectedFormation(null);
                      }}
                      className="text-white hover:text-gray-200 transition-colors duration-200"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Contenu du modal */}
                <div className="p-6">
                  <textarea
                    value={motifRefus}
                    onChange={(e) => setMotifRefus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="4"
                    placeholder="Veuillez indiquer le motif du refus..."
                    required
                  />
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowRefusModal(false);
                        setMotifRefus('');
                        setSelectedFormation(null);
                      }}
                      className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={submitRefus}
                      className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
                      disabled={!motifRefus.trim()}
                    >
                      Confirmer
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GestionFormations;
