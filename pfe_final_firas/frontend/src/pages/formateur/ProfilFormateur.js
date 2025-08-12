import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../redux/slices/authSlice';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  StarIcon,
  CalendarIcon,
  MapPinIcon,
  GlobeAltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const ProfilFormateur = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    expertise: '',
    certifications: '',
    biographie: '',
    adresse: '',
    siteWeb: '',
    linkedin: '',
    github: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        expertise: user.expertise || '',
        certifications: user.certifications || '',
        biographie: user.biographie || '',
        adresse: user.adresse || '',
        siteWeb: user.siteWeb || '',
        linkedin: user.linkedin || '',
        github: user.github || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await axios.put('/formateur/profil', formData);
      dispatch(updateUser(response.data));
      setMessage('Profil mis à jour avec succès !');
      setMessageType('success');
      setIsEditing(false);
    } catch (error) {
      setMessage('Erreur lors de la mise à jour du profil');
      setMessageType('error');
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        expertise: user.expertise || '',
        certifications: user.certifications || '',
        biographie: user.biographie || '',
        adresse: user.adresse || '',
        siteWeb: user.siteWeb || '',
        linkedin: user.linkedin || '',
        github: user.github || ''
      });
    }
    setIsEditing(false);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
              <p className="text-gray-600">Gérez vos informations personnelles et professionnelles</p>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200 ${
                  isEditing 
                    ? 'bg-gray-500 text-white hover:bg-gray-600' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                }`}
              >
                {isEditing ? (
                  <>
                    <XMarkIcon className="h-5 w-5 mr-2" />
                    Annuler
                  </>
                ) : (
                  <>
                    <PencilIcon className="h-5 w-5 mr-2" />
                    Modifier
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Message de notification */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-center ${
              messageType === 'success' 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}
          >
            {messageType === 'success' ? (
              <CheckIcon className="h-5 w-5 mr-2" />
            ) : (
              <XMarkIcon className="h-5 w-5 mr-2" />
            )}
            {message}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Carte de profil */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden mx-auto mb-4">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-4xl font-semibold">
                        {user?.prenom?.[0]}{user?.nom?.[0]}
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                    >
                      <CameraIcon className="h-5 w-5 text-gray-600" />
                    </motion.button>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {user?.prenom} {user?.nom}
                </h2>
                <p className="text-gray-600 mb-2">Formateur</p>
                <div className="flex items-center justify-center space-x-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4" />
                  ))}
                  <span className="text-gray-600 ml-2 text-sm">5.0</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                {user?.telephone && (
                  <div className="flex items-center text-gray-600">
                    <PhoneIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="text-sm">{user.telephone}</span>
                  </div>
                )}
                {user?.adresse && (
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="text-sm">{user.adresse}</span>
                  </div>
                )}
                {user?.siteWeb && (
                  <div className="flex items-center text-gray-600">
                    <GlobeAltIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="text-sm">{user.siteWeb}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistiques</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-gray-600">Formations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">156</div>
                    <div className="text-sm text-gray-600">Participants</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Formulaire de profil */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations personnelles */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Informations personnelles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        id="prenom"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          isEditing
                            ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                            : 'border-gray-200 bg-gray-50 text-gray-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          isEditing
                            ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                            : 'border-gray-200 bg-gray-50 text-gray-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <EnvelopeIcon className="h-5 w-5 mr-2 text-green-500" />
                    Informations de contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          isEditing
                            ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                            : 'border-gray-200 bg-gray-50 text-gray-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        id="telephone"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          isEditing
                            ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                            : 'border-gray-200 bg-gray-50 text-gray-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Adresse */}
                <div>
                  <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    id="adresse"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      isEditing
                        ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}
                  />
                </div>

                {/* Informations professionnelles */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AcademicCapIcon className="h-5 w-5 mr-2 text-purple-500" />
                    Informations professionnelles
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-2">
                        Domaines d'expertise
                      </label>
                      <textarea
                        id="expertise"
                        name="expertise"
                        value={formData.expertise}
                        onChange={handleChange}
                        disabled={!isEditing}
                        rows={3}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          isEditing
                            ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                            : 'border-gray-200 bg-gray-50 text-gray-500'
                        }`}
                        placeholder="Ex: Développement web, Intelligence artificielle, Data Science..."
                      />
                    </div>
                    <div>
                      <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-2">
                        Certifications
                      </label>
                      <textarea
                        id="certifications"
                        name="certifications"
                        value={formData.certifications}
                        onChange={handleChange}
                        disabled={!isEditing}
                        rows={3}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          isEditing
                            ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                            : 'border-gray-200 bg-gray-50 text-gray-500'
                        }`}
                        placeholder="Listez vos certifications et diplômes..."
                      />
                    </div>
                  </div>
                </div>

                {/* Biographie */}
                <div>
                  <label htmlFor="biographie" className="block text-sm font-medium text-gray-700 mb-2">
                    Biographie
                  </label>
                  <textarea
                    id="biographie"
                    name="biographie"
                    value={formData.biographie}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      isEditing
                        ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                        : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}
                    placeholder="Parlez-nous de votre parcours et de votre expérience..."
                  />
                </div>

                {/* Réseaux sociaux */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <GlobeAltIcon className="h-5 w-5 mr-2 text-indigo-500" />
                    Réseaux sociaux
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="siteWeb" className="block text-sm font-medium text-gray-700 mb-2">
                        Site web
                      </label>
                      <input
                        type="url"
                        id="siteWeb"
                        name="siteWeb"
                        value={formData.siteWeb}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          isEditing
                            ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                            : 'border-gray-200 bg-gray-50 text-gray-500'
                        }`}
                        placeholder="https://votre-site.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        id="linkedin"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                          isEditing
                            ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                            : 'border-gray-200 bg-gray-50 text-gray-500'
                        }`}
                        placeholder="https://linkedin.com/in/votre-profil"
                      />
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex space-x-4 pt-6 border-t border-gray-200"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <CheckIcon className="h-5 w-5 mr-2" />
                      )}
                      Sauvegarder
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
                    >
                      <XMarkIcon className="h-5 w-5 mr-2" />
                      Annuler
                    </motion.button>
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilFormateur;
