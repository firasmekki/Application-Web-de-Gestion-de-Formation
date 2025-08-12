import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { obtenirStatistiquesFormateur } from '../../redux/slices/formateurSlice';
import {
  AcademicCapIcon,
  UserGroupIcon,
  StarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const TableauBord = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { statistiques } = useSelector((state) => state.formateur);
  const { utilisateur } = useSelector((state) => state.auth);

  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        await dispatch(obtenirStatistiquesFormateur()).unwrap();
      } catch (err) {
        setError('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    chargerDonnees();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* En-tête */}
      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenue, {utilisateur.prenom} !
            </h1>
            <p className="text-gray-500">
              Tableau de bord formateur
            </p>
          </div>
          <button
            onClick={() => navigate('/formateur/formations/creation')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouvelle Formation
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <AcademicCapIcon className="h-10 w-10 text-blue-600 mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Formations actives
            </h2>
            <p className="text-3xl font-bold text-blue-600">
              {statistiques.formationsEnCours}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <UserGroupIcon className="h-10 w-10 text-purple-600 mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Total participants
            </h2>
            <p className="text-3xl font-bold text-purple-600">
              {statistiques.totalParticipants}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <StarIcon className="h-10 w-10 text-yellow-400 mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Note moyenne
            </h2>
            <p className="text-3xl font-bold text-yellow-400">
              {statistiques.moyenneEvaluations.toFixed(1)}/5
            </p>
          </div>
        </div>

        {/* Formations récentes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Formations récentes
            </h2>
            <div className="divide-y divide-gray-200">
              {statistiques.formationsRecentes?.map((formation) => (
                <div key={formation._id} className="py-4 flex items-center">
                  <div className="flex-shrink-0">
                    <AcademicCapIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {formation.titre}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formation.participants.length} participants | Statut: {formation.statut}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/formateur/formations/${formation._id}`)}
                    className="ml-4 inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Gérer
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => navigate('/formateur/formations')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Voir toutes les formations
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableauBord;
