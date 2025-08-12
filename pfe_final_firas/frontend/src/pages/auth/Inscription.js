import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { register } from '../../redux/slices/authSlice';
import { UserPlusIcon } from '@heroicons/react/24/outline';

const Inscription = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    confirmationMotDePasse: '',
    role: 'participant',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.motDePasse !== formData.confirmationMotDePasse) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.motDePasse.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await dispatch(register(formData)).unwrap();
      setSuccess('Inscription réussie ! Votre compte est en attente de validation par l\'administrateur.');
      setTimeout(() => {
        navigate('/connexion');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <UserPlusIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Inscription
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{success}</div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <input
                type="text"
                name="prenom"
                id="prenom"
                autoComplete="given-name"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={formData.prenom}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <input
                type="text"
                name="nom"
                id="nom"
                autoComplete="family-name"
                required
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={formData.nom}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Adresse email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              required
              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              type="password"
              name="motDePasse"
              id="motDePasse"
              autoComplete="new-password"
              required
              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={formData.motDePasse}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="confirmationMotDePasse" className="block text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              name="confirmationMotDePasse"
              id="confirmationMotDePasse"
              autoComplete="new-password"
              required
              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={formData.confirmationMotDePasse}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Type de compte
            </label>
            <select
              name="role"
              id="role"
              required
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="participant">Participant</option>
              <option value="formateur">Formateur</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              S'inscrire
            </button>
          </div>
        </form>

        <div className="text-sm text-center">
          <RouterLink to="/connexion" className="font-medium text-blue-600 hover:text-blue-500">
            Déjà inscrit ? Connectez-vous
          </RouterLink>
        </div>
      </div>
    </div>
  );
};

export default Inscription;
