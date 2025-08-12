import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDomaines, ajouterDomaine, supprimerDomaine, modifierDomaine } from '../../redux/slices/domaineSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AcademicCapIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const GestionDomaines = () => {
  const dispatch = useDispatch();
  const domaines = useSelector((state) => state.domaines.items);
  const [nouveauDomaine, setNouveauDomaine] = useState({ nom: '', description: '' });
  const [domaineAModifier, setDomaineAModifier] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(getDomaines());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (domaineAModifier) {
      dispatch(modifierDomaine({ 
        id: domaineAModifier._id, 
        nom: nouveauDomaine.nom,
        description: nouveauDomaine.description 
      }));
      setDomaineAModifier(null);
    } else {
      dispatch(ajouterDomaine(nouveauDomaine));
    }
    setNouveauDomaine({ nom: '', description: '' });
    setShowModal(false);
  };

  const handleModifier = (domaine) => {
    setDomaineAModifier(domaine);
    setNouveauDomaine({ 
      nom: domaine.nom,
      description: domaine.description || ''
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNouveauDomaine(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSupprimer = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce domaine ?')) {
      dispatch(supprimerDomaine(id));
    }
  };

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
                  <h1 className="text-3xl font-bold mb-2">Gestion des Domaines</h1>
                  <p className="text-blue-100 text-lg">Organisez et gérez vos domaines de formation</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setDomaineAModifier(null);
                  setNouveauDomaine({ nom: '', description: '' });
                  setShowModal(true);
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-xl hover:bg-white hover:bg-opacity-30 transition-all duration-300 border border-white border-opacity-30"
              >
                <PlusIcon className="h-5 w-5" />
                <span className="font-semibold">Ajouter un domaine</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Statistiques rapides */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <AcademicCapIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Domaines</p>
                <p className="text-2xl font-bold text-gray-900">{domaines.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{domaines.filter(d => d.nom && d.description).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <PencilIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">À compléter</p>
                <p className="text-2xl font-bold text-gray-900">{domaines.filter(d => !d.description).length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Liste des domaines avec design moderne */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Liste des Domaines</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Nom du domaine
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {domaines.map((domaine, index) => (
                    <motion.tr 
                      key={domaine._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                          <span className="text-sm font-medium text-gray-900">{domaine.nom}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 max-w-xs truncate block">
                          {domaine.description || 'Aucune description'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleModifier(domaine)}
                            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
                          >
                            <PencilIcon className="h-4 w-4" />
                            <span>Modifier</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSupprimer(domaine._id)}
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
              </tbody>
            </table>
          </div>
          
          {domaines.length === 0 && (
            <div className="text-center py-12">
              <AcademicCapIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun domaine trouvé</p>
              <p className="text-gray-400">Commencez par ajouter votre premier domaine</p>
            </div>
          )}
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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              >
                {/* Header du modal */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      {domaineAModifier ? 'Modifier le domaine' : 'Ajouter un domaine'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setNouveauDomaine({ nom: '', description: '' });
                        setDomaineAModifier(null);
                      }}
                      className="text-white hover:text-gray-200 transition-colors duration-200"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Contenu du modal */}
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du domaine *
                      </label>
                      <input
                        type="text"
                        name="nom"
                        id="nom"
                        value={nouveauDomaine.nom}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Ex: Développement Web"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        value={nouveauDomaine.description}
                        onChange={handleChange}
                        required
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                        placeholder="Décrivez ce domaine de formation..."
                      />
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowModal(false);
                          setNouveauDomaine({ nom: '', description: '' });
                          setDomaineAModifier(null);
                        }}
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
                        {domaineAModifier ? 'Modifier' : 'Ajouter'}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GestionDomaines;
