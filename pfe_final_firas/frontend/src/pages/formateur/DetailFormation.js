import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getFormation } from '../../redux/slices/formationSlice';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import {
  ArrowLeftIcon,
  PencilIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  MapPinIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  BookOpenIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  StarIcon,
  VideoCameraIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

const DetailFormation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [showStats, setShowStats] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const formation = useSelector((state) => state.formations.currentFormation);
  const loading = useSelector((state) => state.formations.loading);
  const error = useSelector((state) => state.formations.error);

  useEffect(() => {
    console.log('DetailFormation: ID reçu:', id);
    if (id) {
      dispatch(getFormation(id));
    }
  }, [dispatch, id]);

  // Debug: afficher l'état de la formation
  useEffect(() => {
    console.log('DetailFormation: État de la formation:', { formation, loading, error });
  }, [formation, loading, error]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Lien copié dans le presse-papier!');
    setShowShare(false);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Configuration du style
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    
    // Titre de la formation
    doc.text('Détails de la Formation', 20, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    // Informations principales
    doc.text(`Titre: ${formation.titre}`, 20, 40);
    doc.text(`Statut: ${getStatusLabel(formation.statut)}`, 20, 50);
    doc.text(`Date de début: ${formatDate(formation.dateDebut)}`, 20, 60);
    doc.text(`Durée: ${formation.duree}h`, 20, 70);
    doc.text(`Lieu: ${formation.lieu || 'Non spécifié'}`, 20, 80);
    doc.text(`Modalité: ${formation.modalites || 'Non spécifié'}`, 20, 90);
    doc.text(`Participants: ${formation.nombreParticipants || 0}/${formation.capaciteMax}`, 20, 100);
    
    // Description
    if (formation.description) {
      doc.setFont('helvetica', 'bold');
      doc.text('Description:', 20, 120);
      doc.setFont('helvetica', 'normal');
      
      // Wrap text pour la description
      const splitDescription = doc.splitTextToSize(formation.description, 170);
      doc.text(splitDescription, 20, 130);
    }
    
    // Objectifs
    if (formation.objectifs?.length > 0) {
      let yPos = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 160;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Objectifs:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      
      formation.objectifs.forEach((objectif, index) => {
        yPos += 10;
        doc.text(`• ${objectif}`, 25, yPos);
      });
    }
    
    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} sur ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Génération du nom de fichier
    const fileName = `Formation_${formation.titre.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    
    // Sauvegarde du PDF
    doc.save(fileName);
    toast.success('PDF téléchargé avec succès!');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      'en_attente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'approuve': 'bg-green-100 text-green-800 border-green-200',
      'en_cours': 'bg-blue-100 text-blue-800 border-blue-200',
      'termine': 'bg-gray-100 text-gray-800 border-gray-200',
      'annule': 'bg-red-100 text-red-800 border-red-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'en_attente': 'En attente',
      'approuve': 'Approuvé',
      'en_cours': 'En cours',
      'termine': 'Terminé',
      'annule': 'Annulé'
    };
    return labels[status] || status;
  };

  const getNiveauLabel = (niveau) => {
    const labels = {
      'debutant': 'Débutant',
      'intermediaire': 'Intermédiaire',
      'avance': 'Avancé'
    };
    return labels[niveau] || niveau;
  };

  const getModaliteLabel = (modalite) => {
    const labels = {
      'presentiel': 'Présentiel',
      'distanciel': 'Distanciel',
      'hybride': 'Hybride'
    };
    return labels[modalite] || modalite;
  };

  // Fonction pour formater la durée
  const formatDuree = (minutes) => {
    const heures = Math.floor(minutes / 60);
    const minutesRestantes = minutes % 60;
    return minutesRestantes > 0 ? `${heures}h${minutesRestantes}` : `${heures}h`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
          <p className="flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-xl shadow-sm">
          <p className="flex items-center">
            <span className="mr-2">ℹ️</span>
            Formation non trouvée
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header avec actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <button
              onClick={() => navigate('/formateur/formations')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Retour aux formations
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowShare(true)}
                className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 shadow-sm border border-gray-200"
              >
                <ShareIcon className="h-5 w-5 mr-2" />
                Partager
              </button>
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 shadow-sm border border-gray-200"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                PDF
              </button>
              <button
                onClick={() => setShowStats(true)}
                className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 shadow-sm border border-gray-200"
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Statistiques
              </button>
              {formation.statut !== 'termine' && formation.statut !== 'annule' && (
                <button
                  onClick={() => navigate(`/formateur/formation/modifier/${formation._id}`)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Modifier
                </button>
              )}
            </div>
          </div>

          {/* En-tête de la formation */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{formation.titre}</h1>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(formation.statut)}`}>
                    {getStatusLabel(formation.statut)}
                  </span>
                  {formation.domaine?.nom && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {formation.domaine.nom}
                    </span>
                  )}
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {getNiveauLabel(formation.niveau)}
                  </span>
                </div>
                {(formation.motifRefus || formation.motifAnnulation) && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center text-red-700 mb-2">
                      <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                      <span className="font-medium">
                        {formation.motifRefus ? 'Motif de refus' : 'Motif d\'annulation'}
                      </span>
                    </div>
                    <p className="text-red-600">
                      {formation.motifRefus || formation.motifAnnulation}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{formation.nombreParticipants || 0}</p>
                  <p className="text-sm text-gray-500">Participants</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{formatDuree(formation.duree)}</p>
                  <p className="text-sm text-gray-500">Durée</p>
                </div>
                {formation.moyenneEvaluations > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {formation.moyenneEvaluations.toFixed(1)}
                      <span className="text-yellow-400 ml-1">★</span>
                    </p>
                    <p className="text-sm text-gray-500">Note moyenne</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Grille d'informations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Période</p>
                  <p className="text-gray-900">Du {formatDate(formation.dateDebut)}</p>
                  <p className="text-gray-900">Au {formatDate(formation.dateFin)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center space-x-3">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Modalité</p>
                  <p className="text-gray-900">{getModaliteLabel(formation.modalites)}</p>
                  {formation.modalites !== 'distanciel' && formation.lieu && (
                    <p className="text-sm text-gray-500 mt-1">{formation.lieu}</p>
                  )}
                  {formation.modalites !== 'presentiel' && formation.lienVisio && (
                    <a
                      href={formation.lienVisio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-flex items-center"
                    >
                      <VideoCameraIcon className="h-4 w-4 mr-1" />
                      Lien visioconférence
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Formateur</p>
                  <p className="text-gray-900">
                    {formation.formateur?.nom} {formation.formateur?.prenom}
                  </p>
                  <p className="text-sm text-gray-500">{formation.formateur?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description et Objectifs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {formation.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center mb-4">
                  <DocumentTextIcon className="h-6 w-6 text-blue-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                </div>
                <p className="text-gray-600 whitespace-pre-line">{formation.description}</p>
              </div>
            )}

            {formation.objectifs?.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center mb-4">
                  <CheckCircleIcon className="h-6 w-6 text-blue-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Objectifs</h2>
                </div>
                <ul className="space-y-2">
                  {formation.objectifs.map((objectif, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-gray-600">{objectif}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Prérequis */}
          {formation.prerequis?.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 mb-8">
              <div className="flex items-center mb-4">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Prérequis</h2>
              </div>
              <ul className="space-y-2">
                {formation.prerequis.map((prerequis, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-600">{prerequis}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Programme */}
          {formation.contenu?.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 mb-8">
              <div className="flex items-center mb-6">
                <BookOpenIcon className="h-6 w-6 text-blue-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Programme</h2>
              </div>
              <div className="space-y-6">
                {formation.contenu.map((section, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-blue-200 pl-4 hover:border-blue-500 transition-colors duration-200"
                  >
                    <h3 className="font-medium text-gray-900 mb-2">{section.titre}</h3>
                    <p className="text-gray-600">{section.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Évaluations */}
          {formation.evaluations?.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <StarIcon className="h-6 w-6 text-blue-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Évaluations ({formation.evaluations.length})
                  </h2>
                </div>
                <div className="text-yellow-500 flex items-center">
                  <span className="text-xl font-bold mr-1">{formation.moyenneEvaluations.toFixed(1)}</span>
                  <StarIcon className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-6">
                {formation.evaluations.map((evaluation, index) => (
                  <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">
                          {evaluation.participant?.nom} {evaluation.participant?.prenom}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-yellow-500 font-medium mr-1">{evaluation.note}</span>
                        <StarIcon className="h-4 w-4 text-yellow-500" />
                      </div>
                    </div>
                    {evaluation.commentaire && (
                      <div className="flex items-start mt-2">
                        <ChatBubbleLeftIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                        <p className="text-gray-600">{evaluation.commentaire}</p>
                      </div>
                    )}
                    <p className="text-sm text-gray-400 mt-2">
                      {new Date(evaluation.dateEvaluation).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de partage */}
      <Transition appear show={showShare} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowShare(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Partager la formation
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Copier le lien pour partager cette formation avec d'autres personnes.
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={handleShare}
                    >
                      Copier le lien
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal des statistiques */}
      <Transition appear show={showStats} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowStats(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Statistiques de la formation
                  </Dialog.Title>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {formation.nombreParticipants || 0}
                      </p>
                      <p className="text-sm text-gray-500">Participants inscrits</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {((formation.nombreParticipants || 0) / formation.capaciteMax * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-500">Taux de remplissage</p>
                    </div>
                    {formation.evaluations?.length > 0 && (
                      <>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <p className="text-2xl font-bold text-yellow-600">
                            {formation.moyenneEvaluations.toFixed(1)}
                          </p>
                          <p className="text-sm text-gray-500">Note moyenne</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">
                            {formation.evaluations.length}
                          </p>
                          <p className="text-sm text-gray-500">Évaluations reçues</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-6">
                    <p className="text-sm text-gray-500">
                      Dernière mise à jour : {formatDate(formation.derniereMiseAJour)}
                    </p>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default DetailFormation;
