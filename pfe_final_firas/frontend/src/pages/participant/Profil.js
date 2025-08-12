import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon, 
  PencilIcon, 
  KeyIcon, 
  CameraIcon,
  PhoneIcon,
  MapPinIcon,
  EnvelopeIcon,
  UserIcon,
  ClockIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  DocumentIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';
import axios from 'axios';
import { toast } from 'react-toastify';
import { updateUser, loadUser } from '../../redux/slices/authSlice';
import ChangePasswordModal from '../../components/ChangePasswordModal';

const Profil = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [lastActive, setLastActive] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    photo: null
  });

  const [showTooltip, setShowTooltip] = useState('');
  const [isPhotoHovered, setIsPhotoHovered] = useState(false);
  const [userStats, setUserStats] = useState({
    totalMessages: 0,
    totalDocuments: 0,
    lastActivity: null
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Initialiser avec des chaînes vides pour les valeurs undefined
      const initialFormData = {
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        adresse: user.adresse || '',
        photo: null
      };

      setFormData(initialFormData);

      // Log pour déboguer
      console.log('Données du formulaire initialisées:', initialFormData);

      if (user.photo && user.photo !== 'default.jpg') {
        setPreviewImage(`${process.env.REACT_APP_API_URL}/uploads/${user.photo}`);
      }
      setLastActive(user.lastActive || new Date());
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token'); // Récupérer le token
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/utilisateurs/stats`,
        { 
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}` // Ajouter le token dans les headers
          }
        }
      );
      if (response.data.success) {
        setUserStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      if (error.response?.status === 401) {
        // Rediriger vers la page de login si non authentifié
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      // Créer une URL temporaire pour l'aperçu
      const previewURL = URL.createObjectURL(file);
      setPreviewImage(previewURL);
      setImageError(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Ajouter les champs de base
      formDataToSend.append('nom', formData.nom || '');
      formDataToSend.append('prenom', formData.prenom || '');
      formDataToSend.append('email', formData.email || '');
      formDataToSend.append('telephone', formData.telephone || '');
      formDataToSend.append('adresse', formData.adresse || '');

      // Ajouter la photo si elle existe
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      console.log('Données envoyées:', {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        hasPhoto: !!formData.photo
      });

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/utilisateurs/profile`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        const updatedUser = response.data.data;
        dispatch(updateUser(updatedUser));
        
        // Mettre à jour l'aperçu de la photo si nécessaire
        if (updatedUser.photo && updatedUser.photo !== 'default.jpg') {
          setPreviewImage(`${process.env.REACT_APP_API_URL}/uploads/${updatedUser.photo}`);
        }
        
        setIsEditing(false);
        toast.success('Profil mis à jour avec succès');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error('Erreur lors de la mise à jour du profil');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setPreviewImage(`${process.env.REACT_APP_API_URL}/uploads/default.jpg`);
  };

  const getTimeAgo = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) {
      return 'il y a quelques secondes';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `il y a ${diffInMonths} mois`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `il y a ${diffInYears} an${diffInYears > 1 ? 's' : ''}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('fr-FR', options);
  };

  const Tooltip = ({ text, show, children }) => (
    <div className="relative group">
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-sm text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );

  const StatsCard = ({ icon: Icon, title, value, tooltip }) => (
    <Tooltip text={tooltip} show={true}>
      <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-help">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-lg font-semibold">{value}</p>
          </div>
        </div>
      </div>
    </Tooltip>
  );

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await fetchUserStats();
      toast.success('Statistiques mises à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="relative group">
                {imageLoading ? (
                  <div className="w-36 h-36 rounded-full bg-blue-400 animate-pulse" />
                ) : imageError || !previewImage ? (
                  <div className="w-36 h-36 rounded-full bg-blue-400 flex items-center justify-center">
                    <UserCircleIcon className="w-28 h-28 text-white" />
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105"
                      onError={handleImageError}
                    />
                    <div className="absolute bottom-2 right-2">
                      <div className={`w-5 h-5 rounded-full border-2 border-white ${user?.isOnline ? 'bg-green-500' : 'bg-gray-400'} shadow-lg`}>
                        <span className="relative flex h-full w-full">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${user?.isOnline ? 'bg-green-400' : 'bg-gray-300'}`}></span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-3 cursor-pointer hover:bg-blue-600 transition-colors duration-200 shadow-lg group-hover:scale-110">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <CameraIcon className="h-5 w-5 text-white" />
                  </label>
                )}
              </div>

              <div className="text-center sm:text-left flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {user?.nom} {user?.prenom}
                </h1>
                <div className="flex flex-col space-y-2 text-blue-100">
                  <div className="flex items-center justify-center sm:justify-start">
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start">
                    <UserIcon className="h-5 w-5 mr-2" />
                    <span className="capitalize">{user?.role}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    <span>{user?.isOnline ? 'En ligne' : `Dernière connexion ${getTimeAgo(lastActive)}`}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span>Membre depuis {formatDate(user?.dateCreation)}</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-3">
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Modifier le profil
                    </button>
                  )}
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105"
                  >
                    <KeyIcon className="h-4 w-4 mr-2" />
                    Changer le mot de passe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Statistiques</h2>
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
              disabled={isLoading}
            >
              <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : 'hover:rotate-180 transition-transform duration-500'}`} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatsCard
              icon={ChatBubbleLeftIcon}
              title="Messages"
              value={userStats.totalMessages}
              tooltip="Nombre total de messages envoyés"
            />
            <StatsCard
              icon={DocumentIcon}
              title="Documents"
              value={userStats.totalDocuments}
              tooltip="Nombre total de documents partagés"
            />
            <StatsCard
              icon={ClockIcon}
              title="Dernière activité"
              value={formatDate(userStats.lastActivity)}
              tooltip="Date de votre dernière activité sur la plateforme"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sécurité</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-medium">Mot de passe</p>
                  <p className="text-sm text-gray-500">Dernière modification: {formatDate(user?.lastPasswordChange) || 'Jamais'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsChangingPassword(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                  Nom
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`mt-1 block w-full rounded-lg ${
                      isEditing
                        ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-blue-300'
                        : 'border-transparent bg-gray-100'
                    } shadow-sm transition-all duration-200 ${
                      errors.nom ? 'border-red-500' : ''
                    } pl-10`}
                  />
                  <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 group-hover:text-blue-500 transition-colors duration-200" />
                </div>
                {errors.nom && (
                  <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.nom}</p>
                )}
              </div>

              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                  Prénom
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`mt-1 block w-full rounded-lg ${
                      isEditing
                        ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-blue-300'
                        : 'border-transparent bg-gray-100'
                    } shadow-sm transition-all duration-200 ${
                      errors.prenom ? 'border-red-500' : ''
                    } pl-10`}
                  />
                  <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 group-hover:text-blue-500 transition-colors duration-200" />
                </div>
                {errors.prenom && (
                  <p className="mt-1 text-sm text-red-600 animate-fadeIn">{errors.prenom}</p>
                )}
              </div>

              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled={true}
                    className="mt-1 block w-full rounded-lg border-transparent bg-gray-100 shadow-sm pl-10 cursor-not-allowed"
                  />
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 group-hover:text-blue-500 transition-colors duration-200" />
                </div>
                <p className="mt-1 text-xs text-gray-500">L'email ne peut pas être modifié</p>
              </div>

              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                  Téléphone
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`mt-1 block w-full rounded-lg ${
                      isEditing
                        ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-blue-300'
                        : 'border-transparent bg-gray-100'
                    } shadow-sm transition-all duration-200 pl-10`}
                  />
                  <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 group-hover:text-blue-500 transition-colors duration-200" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                  Adresse
                </label>
                <div className="relative">
                  <textarea
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows="3"
                    className={`mt-1 block w-full rounded-lg ${
                      isEditing
                        ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 hover:border-blue-300'
                        : 'border-transparent bg-gray-100'
                    } shadow-sm transition-all duration-200 pl-10`}
                  />
                  <MapPinIcon className="h-5 w-5 text-gray-400 absolute left-3 top-4 group-hover:text-blue-500 transition-colors duration-200" />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setErrors({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105 hover:shadow-md"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {isChangingPassword && (
        <ChangePasswordModal
          isOpen={isChangingPassword}
          onClose={() => setIsChangingPassword(false)}
        />
      )}
    </div>
  );
};

export default Profil;
