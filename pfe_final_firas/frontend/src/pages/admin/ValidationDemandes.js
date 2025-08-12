import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardDocumentListIcon, 
  CheckIcon, 
  XMarkIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
  AcademicCapIcon,
  CalendarIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

const ValidationDemandes = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  // Fonction pour récupérer les demandes
  const fetchDemandes = async () => {
    try {
      const response = await axios.get(`${API_URL}/demandes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Demandes reçues:', response.data);
      setDemandes(response.data.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
      toast.error('Erreur lors de la récupération des demandes');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour traiter une demande
  const traiterDemande = async (id, statut) => {
    try {
      console.log('Traitement demande:', { id, statut });
      const response = await axios.put(
        `${API_URL}/demandes/${id}`,
        { statut },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Réponse traitement:', response.data);
      
      toast.success(`Demande ${statut === 'acceptee' ? 'acceptée' : 'refusée'} avec succès`);
      fetchDemandes(); // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur lors du traitement de la demande:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Erreur lors du traitement de la demande');
    }
  };

  useEffect(() => {
    if (user?.role !== 'administrateur') {
      return;
    }
    fetchDemandes();
  }, [user]);

  // Calculer les statistiques
  const stats = {
    total: demandes.length,
    enAttente: demandes.filter(d => d.statut === 'en_attente').length,
    acceptees: demandes.filter(d => d.statut === 'acceptee').length,
    refusees: demandes.filter(d => d.statut === 'refusee').length
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

  if (!user || user.role !== 'administrateur') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
            <span className="font-medium">Accès non autorisé</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl shadow-2xl mb-8 overflow-hidden">
          <div className="px-8 py-12 relative">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <ClipboardDocumentListIcon className="w-full h-full" />
            </div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-white mb-4 flex items-center">
                <ClipboardDocumentListIcon className="h-10 w-10 mr-4" />
                Validation des Demandes
              </h1>
              <p className="text-orange-100 text-lg">
                Gérez et validez toutes les demandes de votre plateforme
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
                <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Demandes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
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

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Acceptées</p>
                <p className="text-3xl font-bold text-gray-900">{stats.acceptees}</p>
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
                <p className="text-sm font-medium text-gray-600">Refusées</p>
                <p className="text-3xl font-bold text-gray-900">{stats.refusees}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Liste des demandes */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Demandes en cours</h3>
          </div>
          
          {demandes.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <div className="flex flex-col items-center">
                <ClipboardDocumentListIcon className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium">Aucune demande en attente</p>
                <p className="text-sm">Toutes les demandes ont été traitées</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid gap-6">
                <AnimatePresence>
                  {demandes.map((demande, index) => (
                    <motion.div 
                      key={demande._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1 space-y-4">
                          {/* En-tête de la demande */}
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {demande.detailsDemande?.nom?.charAt(0)}{demande.detailsDemande?.prenom?.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                                {demande.detailsDemande?.nom} {demande.detailsDemande?.prenom}
                                <span className={`ml-3 px-3 py-1 text-xs font-semibold rounded-full ${
                                  demande.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                                  demande.statut === 'acceptee' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {demande.statut === 'en_attente' ? 'En attente' :
                                   demande.statut === 'acceptee' ? 'Acceptée' :
                                   'Refusée'}
                                </span>
                              </h3>
                              <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <EnvelopeIcon className="h-4 w-4 mr-2 text-blue-500" />
                                  <span>{demande.detailsDemande?.email}</span>
                                </div>
                                <div className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 mr-2 text-purple-500" />
                                  <span>Demande: {new Date(demande.dateCreation).toLocaleDateString('fr-FR')}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Détails de la demande */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                {demande.type === 'inscription' ? (
                                  <UserIcon className="h-5 w-5 text-blue-600" />
                                ) : (
                                  <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-blue-900">Type de demande</p>
                                <p className="text-sm text-blue-700">
                                  {demande.type === 'inscription' ? 'Inscription' : 'Formation'}
                                </p>
                              </div>
                            </div>

                            {demande.detailsDemande?.telephone && (
                              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <UserIcon className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-green-900">Téléphone</p>
                                  <p className="text-sm text-green-700">{demande.detailsDemande.telephone}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Description ou détails supplémentaires */}
                          {demande.description && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Description:</span> {demande.description}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {demande.statut === 'en_attente' && (
                          <div className="flex flex-col space-y-3 lg:ml-6">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => traiterDemande(demande._id, 'acceptee')}
                              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg"
                            >
                              <CheckIcon className="h-5 w-5" />
                              <span>Accepter</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => traiterDemande(demande._id, 'refusee')}
                              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
                            >
                              <XMarkIcon className="h-5 w-5" />
                              <span>Refuser</span>
                            </motion.button>
                          </div>
                        )}

                        {/* Statut traité */}
                        {demande.statut !== 'en_attente' && (
                          <div className="lg:ml-6">
                            <div className={`px-4 py-2 rounded-lg text-center ${
                              demande.statut === 'acceptee' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              <span className="font-medium">
                                {demande.statut === 'acceptee' ? 'Demande acceptée' : 'Demande refusée'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationDemandes;
