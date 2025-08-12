import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHistorique } from '../../redux/slices/participantSlice';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  AcademicCapIcon,
  CalendarIcon,
  ClockIcon,
  ChartBarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const FilterBadge = ({ label, onRemove }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2">
    {label}
    <button
      onClick={onRemove}
      className="ml-2 inline-flex items-center justify-center hover:bg-blue-200 rounded-full p-0.5"
    >
      <XMarkIcon className="h-4 w-4" />
    </button>
  </span>
);

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white rounded-xl shadow-sm p-4 flex items-center space-x-4">
    <div className="p-3 bg-blue-100 rounded-lg">
      <Icon className="h-6 w-6 text-blue-600" />
    </div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const HistoriqueFormations = () => {
  const dispatch = useDispatch();
  const [filtres, setFiltres] = useState({
    recherche: '',
    domaine: '',
    niveau: '',
    evaluation: '',
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  const { historique, loading } = useSelector((state) => ({
    historique: state.participant?.historique || [],
    loading: state.participant?.loading || false
  }));

  useEffect(() => {
    dispatch(fetchHistorique());
  }, [dispatch]);

  const handleFiltreChange = (e) => {
    const { name, value } = e.target;
    setFiltres((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFiltres = () => {
    setFiltres({
      recherche: '',
      domaine: '',
      niveau: '',
      evaluation: '',
    });
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formationsFiltrees = useMemo(() => {
    let filtered = historique.filter((inscription) => {
      const formation = inscription?.formation;
      if (!formation) return false;

      const matchRecherche =
        !filtres.recherche ||
        formation.titre.toLowerCase().includes(filtres.recherche.toLowerCase()) ||
        formation.description.toLowerCase().includes(filtres.recherche.toLowerCase());

      const matchDomaine =
        !filtres.domaine || formation.domaine === filtres.domaine;

      const matchNiveau =
        !filtres.niveau || formation.niveau === filtres.niveau;

      const matchEvaluation =
        !filtres.evaluation ||
        (inscription.evaluation &&
          inscription.evaluation.note.toString() === filtres.evaluation);

      return matchRecherche && matchDomaine && matchNiveau && matchEvaluation;
    });

    filtered.sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      
      switch (sortBy) {
        case 'titre':
          return multiplier * a.formation.titre.localeCompare(b.formation.titre);
        case 'evaluation':
          const evalA = a.evaluation?.note || 0;
          const evalB = b.evaluation?.note || 0;
          return multiplier * (evalB - evalA);
        case 'date':
        default:
          return multiplier * (new Date(b.dateInscription) - new Date(a.dateInscription));
      }
    });

    return filtered;
  }, [historique, filtres, sortBy, sortOrder]);

  const stats = useMemo(() => ({
    total: historique.length,
    completed: historique.filter(i => i.status === 'terminé').length,
    avgRating: historique.reduce((acc, curr) => acc + (curr.evaluation?.note || 0), 0) / 
               historique.filter(i => i.evaluation).length || 0
  }), [historique]);

  const activeFilters = Object.entries(filtres).filter(([_, value]) => value !== '');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Chargement de votre historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-8">
        {/* Header avec stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Historique des Formations</h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>{showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon={AcademicCapIcon}
              label="Total des formations"
              value={stats.total}
            />
            <StatCard
              icon={ChartBarIcon}
              label="Formations terminées"
              value={stats.completed}
            />
            <StatCard
              icon={StarIcon}
              label="Note moyenne"
              value={`${stats.avgRating.toFixed(1)}/5`}
            />
          </div>
        </div>

        {/* Filtres */}
        <div 
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            showFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <input
                  type="text"
                  name="recherche"
                  value={filtres.recherche}
                  onChange={handleFiltreChange}
                  placeholder="Rechercher une formation..."
                  className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>

              <div className="relative">
                <select
                  name="domaine"
                  value={filtres.domaine}
                  onChange={handleFiltreChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-xl appearance-none bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tous les domaines</option>
                  <option value="informatique">Informatique</option>
                  <option value="management">Management</option>
                  <option value="langues">Langues</option>
                </select>
                <FunnelIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>

              <div className="relative">
                <select
                  name="niveau"
                  value={filtres.niveau}
                  onChange={handleFiltreChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-xl appearance-none bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tous les niveaux</option>
                  <option value="debutant">Débutant</option>
                  <option value="intermediaire">Intermédiaire</option>
                  <option value="avance">Avancé</option>
                </select>
                <AcademicCapIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>

              <div className="relative">
                <select
                  name="evaluation"
                  value={filtres.evaluation}
                  onChange={handleFiltreChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-xl appearance-none bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Toutes les évaluations</option>
                  <option value="5">5 étoiles</option>
                  <option value="4">4 étoiles</option>
                  <option value="3">3 étoiles</option>
                  <option value="2">2 étoiles</option>
                  <option value="1">1 étoile</option>
                </select>
                <StarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap items-center">
                  {activeFilters.map(([key, value]) => (
                    <FilterBadge
                      key={key}
                      label={`${key}: ${value}`}
                      onRemove={() => handleFiltreChange({ target: { name: key, value: '' } })}
                    />
                  ))}
                  <button
                    onClick={resetFiltres}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors duration-200"
                  >
                    Réinitialiser tous les filtres
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Options de tri */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-600">
            {formationsFiltrees.length} formation{formationsFiltrees.length !== 1 ? 's' : ''} trouvée{formationsFiltrees.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => toggleSort('date')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors duration-200 ${
                sortBy === 'date' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              <span>Date</span>
            </button>
            <button
              onClick={() => toggleSort('titre')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors duration-200 ${
                sortBy === 'titre' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <AcademicCapIcon className="h-4 w-4" />
              <span>Titre</span>
            </button>
            <button
              onClick={() => toggleSort('evaluation')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors duration-200 ${
                sortBy === 'evaluation' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <StarIcon className="h-4 w-4" />
              <span>Évaluation</span>
            </button>
          </div>
        </div>

        {/* Liste des formations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formationsFiltrees.length > 0 ? (
            formationsFiltrees.map((inscription) => (
              <div
                key={inscription._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] opacity-0 animate-fade-in"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200">
                      {inscription.formation.titre}
                    </h3>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      inscription.status === 'terminé' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {inscription.status === 'terminé' ? 'Terminé' : 'En cours'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {inscription.formation.description}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>Inscrit le {new Date(inscription.dateInscription).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">
                        {inscription.formation.duree} heures
                      </span>
                    </div>
                    {inscription.evaluation && (
                      <div className="flex items-center">
                        {[...Array(5)].map((_, index) => (
                          <span key={index}>
                            {index < inscription.evaluation.note ? (
                              <StarIconSolid className="h-5 w-5 text-yellow-400" />
                            ) : (
                              <StarIcon className="h-5 w-5 text-gray-300" />
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
              <FunnelIcon className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium mb-2">Aucune formation trouvée</p>
              <p className="text-sm">Essayez de modifier vos filtres de recherche</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoriqueFormations;
