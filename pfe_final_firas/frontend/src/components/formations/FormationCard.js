import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const FormationCard = ({
  formation,
  inscriptionStatus,
  loading,
  initiateInscription,
  viewMode = 'grid',
}) => {
  const {
    _id,
    titre,
    description,
    dateDebut,
    dateFin,
    duree,
    lieu,
    domaine,
    niveau,
    modalites,
    participants = [],
    capaciteMax,
  } = formation;

  const isGridView = viewMode === 'grid';
  const participantsCount = participants.length;
  const placesRestantes = capaciteMax - participantsCount;
  const tauxRemplissage = (participantsCount / capaciteMax) * 100;

  const CardWrapper = ({ children }) => (
    <motion.div
      whileHover={{ y: -4 }}
      className={`
        bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden
        ${isGridView ? 'h-full' : 'flex gap-6'}
      `}
    >
      {children}
    </motion.div>
  );

  const InfoBadge = ({ icon: Icon, text, color = 'gray' }) => (
    <div className={`flex items-center gap-1.5 text-${color}-600 text-sm`}>
      <Icon className="h-4 w-4" />
      <span>{text}</span>
    </div>
  );

  return (
    <CardWrapper>
      {/* Image de couverture */}
      <div
        className={`
          relative bg-gradient-to-br from-blue-500 to-blue-600
          ${isGridView ? 'h-48' : 'w-48 shrink-0'}
        `}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <AcademicCapIcon className="h-16 w-16 text-white/80" />
        </div>
        {domaine && (
          <span className="absolute top-4 left-4 px-2.5 py-1 bg-white/90 rounded-full text-xs font-medium text-blue-600">
            {typeof domaine === 'object' ? domaine.nom : domaine}
          </span>
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 p-6">
        <div className="space-y-4">
          {/* En-tête */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {titre}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {description}
            </p>
          </div>

          {/* Informations */}
          <div className="grid grid-cols-2 gap-3">
            <InfoBadge
              icon={CalendarIcon}
              text={new Date(dateDebut).toLocaleDateString()}
            />
            <InfoBadge
              icon={ClockIcon}
              text={`${duree}h`}
            />
            <InfoBadge
              icon={MapPinIcon}
              text={lieu || 'À définir'}
            />
            <InfoBadge
              icon={UserGroupIcon}
              text={`${participantsCount}/${capaciteMax}`}
              color={tauxRemplissage >= 80 ? 'orange' : 'gray'}
            />
          </div>

          {/* Barre de progression */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Places restantes</span>
              <span className="font-medium text-gray-900">{placesRestantes}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${tauxRemplissage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  tauxRemplissage >= 80
                    ? 'bg-orange-500'
                    : tauxRemplissage >= 50
                    ? 'bg-blue-500'
                    : 'bg-green-500'
                }`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <Link
              to={`/participant/formations/${_id}`}
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Voir les détails
              <ArrowRightIcon className="h-4 w-4" />
            </Link>

            <button
              onClick={() => initiateInscription(formation)}
              disabled={loading || inscriptionStatus}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  inscriptionStatus
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : loading
                    ? 'bg-blue-100 text-blue-400 cursor-wait'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              {inscriptionStatus || (loading ? 'Chargement...' : "S'inscrire")}
            </button>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};

export default FormationCard;
