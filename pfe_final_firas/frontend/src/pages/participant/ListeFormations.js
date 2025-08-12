import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { obtenirFormations, inscrireFormation } from '../../redux/slices/formationSlice';
import { fetchInscriptions } from '../../redux/slices/participantSlice';
import { getDomaines } from '../../redux/slices/domaineSlice';
import {
  Squares2X2Icon,
  ListBulletIcon,
  ExclamationTriangleIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

// Composants
import SearchBar from '../../components/formations/SearchBar';
import AdvancedFilters from '../../components/formations/AdvancedFilters';
import FilterBadge from '../../components/formations/FilterBadge';
import FormationCard from '../../components/formations/FormationCard';
import FormationStats from '../../components/formations/FormationStats';
import SortOptions from '../../components/formations/SortOptions';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ErrorModal, ConfirmModal, SuccessModal } from '../../components/formations/FormationModals';

const ListeFormations = () => {
  const dispatch = useDispatch();
  
  // États locaux
  const [filtres, setFiltres] = useState({
    recherche: '',
    domaine: '',
    niveau: '',
    modalites: '',
  });
  const [sortBy, setSortBy] = useState('dateDebut');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Sélecteurs Redux
  const { formations, loading: formationsLoading, error: formationsError } = useSelector((state) => state.formations);
  const { inscriptions = [], loading: inscriptionsLoading } = useSelector((state) => state.participant || { inscriptions: [], loading: false });
  const { items: domaines, loading: domainesLoading } = useSelector((state) => state.domaines);

  // Effets
  useEffect(() => {
    dispatch(obtenirFormations(filtres));
    dispatch(fetchInscriptions());
    dispatch(getDomaines());
  }, [dispatch, filtres]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fonctions utilitaires
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  const handleInscription = async (formationId) => {
    try {
      setLoading(true);
      setError(null);
      const resultAction = await dispatch(inscrireFormation(formationId));
      if (inscrireFormation.fulfilled.match(resultAction)) {
        dispatch(fetchInscriptions());
        setShowSuccessModal(true);
      } else {
        throw new Error(resultAction.error.message);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'inscription');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  // Formations triées et filtrées
  const formationsTriees = useMemo(() => {
    if (!formations) return [];
    
    return [...formations].sort((a, b) => {
      const modifier = sortOrder === 'asc' ? 1 : -1;
      
      switch (sortBy) {
        case 'titre':
          return modifier * a.titre.localeCompare(b.titre);
        case 'dateDebut':
          return modifier * (new Date(a.dateDebut) - new Date(b.dateDebut));
        case 'duree':
          return modifier * (a.duree - b.duree);
        case 'participants':
          return modifier * ((a.participants?.length || 0) - (b.participants?.length || 0));
        default:
          return 0;
      }
    });
  }, [formations, sortBy, sortOrder]);

  if (formationsLoading || inscriptionsLoading || domainesLoading) {
    return <LoadingSpinner message="Chargement des formations..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-8">
        {/* En-tête avec statistiques */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Catalogue des Formations</h1>
              <p className="text-gray-600 mt-1">
                {formationsTriees.length} formation{formationsTriees.length !== 1 ? 's' : ''} disponible{formationsTriees.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <SortOptions
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
              />
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Vue grille"
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Vue liste"
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <FormationStats formations={formations} />
        </div>

        {/* Barre de recherche et filtres */}
        <div className="space-y-4">
          <SearchBar
            searchQuery={filtres.recherche}
            onSearchChange={(value) => setFiltres(prev => ({ ...prev, recherche: value }))}
            showFilters={showFilters}
            toggleFilters={() => setShowFilters(!showFilters)}
          />

          <AnimatePresence>
            {showFilters && (
              <AdvancedFilters
                filters={filtres}
                onChange={(e) => setFiltres(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                onReset={() => setFiltres({ recherche: '', domaine: '', niveau: '', modalites: '' })}
                domaines={domaines}
                loading={domainesLoading}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {Object.entries(filtres).some(([_, value]) => value) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-wrap items-center gap-2"
              >
                {Object.entries(filtres).map(([key, value]) => 
                  value ? (
                    <FilterBadge
                      key={key}
                      label={`${key}: ${value}`}
                      onRemove={() => setFiltres(prev => ({ ...prev, [key]: '' }))}
                    />
                  ) : null
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Liste des formations */}
        <div className={`grid ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        } gap-6`}>
          <AnimatePresence>
            {formationsTriees.map((formation, index) => (
              <motion.div
                key={formation._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <FormationCard
                  formation={formation}
                  inscriptionStatus={
                    inscriptions.some(i => i.formation === formation._id)
                      ? "Déjà inscrit"
                      : inscriptions.length > 0
                      ? "Déjà inscrit à une formation"
                      : null
                  }
                  loading={loading}
                  initiateInscription={() => {
                    setSelectedFormation(formation);
                    setShowConfirmModal(true);
                  }}
                  viewMode={viewMode}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {formationsTriees.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full flex flex-col items-center justify-center py-12"
            >
              <img
                src="/empty-state.svg"
                alt="Aucune formation"
                className="w-48 h-48 mb-4 opacity-50"
              />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune formation trouvée
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                Aucune formation ne correspond à vos critères de recherche.
                Essayez de modifier vos filtres ou revenez plus tard.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bouton retour en haut */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 bg-white rounded-full shadow-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200"
          >
            <ChevronUpIcon className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modales */}
      <ErrorModal 
        isOpen={showErrorModal} 
        onClose={() => setShowErrorModal(false)} 
        error={error} 
      />
      <ConfirmModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => handleInscription(selectedFormation?._id)}
        formation={selectedFormation}
      />
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
};

export default ListeFormations;
