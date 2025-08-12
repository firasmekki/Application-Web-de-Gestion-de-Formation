import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../redux/slices/authSlice';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const Connexion = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, error: authError, user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    motDePasse: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si déjà authentifié, rediriger vers le tableau de bord approprié
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'administrateur':
          navigate('/admin/tableau-de-bord', { replace: true });
          break;
        case 'formateur':
          navigate('/formateur/tableau-de-bord', { replace: true });
          break;
        case 'participant':
          navigate('/participant/tableau-de-bord', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Nettoyer les erreurs lors du démontage
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    // Afficher les erreurs d'authentification
    if (authError) {
      setError(authError);
      setLoading(false);
      toast.error(authError);
    }
  }, [authError]);

  const handleChange = (e) => {
    e.preventDefault(); // Empêcher le comportement par défaut
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Effacer les erreurs lors de la saisie
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêcher le comportement par défaut
    
    if (loading) {
      return; // Éviter les soumissions multiples
    }
    
    // Validation des champs
    if (!formData.email || !formData.motDePasse) {
      setError('Veuillez remplir tous les champs');
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      setError('');
      setLoading(true);

      const actionResult = await dispatch(login({
        email: formData.email,
        motDePasse: formData.motDePasse
      })).unwrap();

      console.log('Résultat de la connexion:', actionResult);
      
      if (actionResult.user.statut === 'inactif') {
        setError('Votre compte est en attente de validation par l\'administrateur');
        toast.warning('Votre compte est en attente de validation');
        setLoading(false);
        return;
      }

    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(err.message || 'Une erreur est survenue lors de la connexion');
      toast.error(err.message || 'Erreur de connexion');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <LockClosedIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Connexion
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Ou{' '}
            <RouterLink
              to="/inscription"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              créez un nouveau compte
            </RouterLink>
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Adresse e-mail"
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="motDePasse" className="sr-only">
                Mot de passe
              </label>
              <input
                id="motDePasse"
                name="motDePasse"
                type="password"
                required
                value={formData.motDePasse}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Mot de passe"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <RouterLink
                to="/reinitialisation-mot-de-passe"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Mot de passe oublié ?
              </RouterLink>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {loading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LockClosedIcon className="h-5 w-5 text-blue-500 group-hover:text-blue-400" aria-hidden="true" />
                </span>
              )}
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Connexion;
