import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getFormation, clearCurrentFormation } from '../../redux/slices/formationSlice';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  MapPinIcon, 
  BookOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
  VideoCameraIcon,
  ClipboardDocumentListIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const DetailFormation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentFormation: formation, loading, error } = useSelector((state) => state.formations);
  const [activeTab, setActiveTab] = useState('apercu');

  useEffect(() => {
    if (id) {
      dispatch(getFormation(id));
    }
    return () => {
      dispatch(clearCurrentFormation());
    };
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!formation) {
    return null;
  }

  const tabs = [
    { id: 'apercu', label: 'Aperçu', icon: ClipboardDocumentListIcon },
    { id: 'contenu', label: 'Contenu', icon: BookOpenIcon },
    { id: 'participants', label: 'Participants', icon: UserGroupIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/participant/formations')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Retour à la liste
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{formation.titre}</h1>
              <p className="text-gray-600 mb-4">{formation.description}</p>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  formation.statut === 'approuve' ? 'bg-green-100 text-green-800' :
                  formation.statut === 'refuse' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {formation.statut === 'approuve' ? (
                    <CheckCircleIcon className="h-5 w-5 inline mr-1" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 inline mr-1" />
                  )}
                  {formation.statut.charAt(0).toUpperCase() + formation.statut.slice(1).replace('_', ' ')}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {formation.modalites.charAt(0).toUpperCase() + formation.modalites.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informations clés */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <CalendarIcon className="h-6 w-6 text-blue-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Dates</h3>
            </div>
            <p className="text-gray-600">
              Du {new Date(formation.dateDebut).toLocaleDateString()} au {new Date(formation.dateFin).toLocaleDateString()}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <ClockIcon className="h-6 w-6 text-blue-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Durée</h3>
            </div>
            <p className="text-gray-600">{formation.duree}h</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <UserGroupIcon className="h-6 w-6 text-blue-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Participants</h3>
            </div>
            <p className="text-gray-600">
              {formation.participants?.length || 0}/{formation.capaciteMax} places
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <AcademicCapIcon className="h-6 w-6 text-blue-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Niveau</h3>
            </div>
            <p className="text-gray-600 capitalize">{formation.niveau}</p>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'apercu' && (
              <div className="space-y-8">
                {/* Formateur */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Formateur</h3>
                  <div className="flex items-center">
                    <div className="bg-gray-100 rounded-full p-3">
                      <UserGroupIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-900 font-medium">
                        {formation.formateur ? `${formation.formateur.nom} ${formation.formateur.prenom}` : 'Non assigné'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lieu et modalités */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Lieu et modalités</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formation.modalites !== 'distanciel' && (
                      <div className="flex items-start">
                        <MapPinIcon className="h-6 w-6 text-gray-400 mr-3" />
                        <div>
                          <p className="text-gray-900 font-medium mb-1">Lieu</p>
                          <p className="text-gray-600">{formation.lieu || 'Non spécifié'}</p>
                        </div>
                      </div>
                    )}
                    {formation.modalites !== 'presentiel' && (
                      <div className="flex items-start">
                        <VideoCameraIcon className="h-6 w-6 text-gray-400 mr-3" />
                        <div>
                          <p className="text-gray-900 font-medium mb-1">Lien visioconférence</p>
                          <p className="text-gray-600">{formation.lienVisio || 'Non spécifié'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prérequis */}
                {formation.prerequis && formation.prerequis.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Prérequis</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      {formation.prerequis.map((prerequis, index) => (
                        <li key={index}>{prerequis}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Objectifs */}
                {formation.objectifs && formation.objectifs.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Objectifs</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      {formation.objectifs.map((objectif, index) => (
                        <li key={index}>{objectif}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'contenu' && (
              <div className="space-y-6">
                {formation.contenu && formation.contenu.map((section, index) => (
                  <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{section.titre}</h3>
                    <p className="text-gray-600">{section.description}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'participants' && (
              <div>
                {formation.participants && formation.participants.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {formation.participants.map((participant, index) => (
                      <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <div className="bg-gray-200 rounded-full p-3">
                          <UserGroupIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-gray-900 font-medium">
                            {participant.nom} {participant.prenom}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun participant inscrit pour le moment</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailFormation;
