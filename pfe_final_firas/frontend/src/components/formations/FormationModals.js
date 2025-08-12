import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  CheckCircleIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const ModalWrapper = ({ isOpen, onClose, children }) => (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
      </Transition.Child>

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);

export const ErrorModal = ({ isOpen, onClose, error }) => (
  <ModalWrapper isOpen={isOpen} onClose={onClose}>
    <div className="flex items-center justify-between">
      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
        Erreur
      </Dialog.Title>
      <button
        onClick={onClose}
        className="rounded-full p-1 hover:bg-gray-100 transition-colors duration-200"
      >
        <XMarkIcon className="h-5 w-5 text-gray-500" />
      </button>
    </div>
    <div className="mt-4 flex items-start gap-3">
      <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
      <p className="text-sm text-gray-600">
        {error || "Une erreur s'est produite. Veuillez réessayer plus tard."}
      </p>
    </div>
    <div className="mt-6">
      <button
        onClick={onClose}
        className="w-full rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors duration-200"
      >
        Fermer
      </button>
    </div>
  </ModalWrapper>
);

export const ConfirmModal = ({ isOpen, onClose, onConfirm, formation }) => (
  <ModalWrapper isOpen={isOpen} onClose={onClose}>
    <div className="flex items-center justify-between">
      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
        Confirmer l'inscription
      </Dialog.Title>
      <button
        onClick={onClose}
        className="rounded-full p-1 hover:bg-gray-100 transition-colors duration-200"
      >
        <XMarkIcon className="h-5 w-5 text-gray-500" />
      </button>
    </div>

    {formation && (
      <div className="mt-4">
        <h4 className="font-medium text-gray-900">{formation.titre}</h4>
        <div className="mt-3 space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
            <span>
              Du {new Date(formation.dateDebut).toLocaleDateString()} au{' '}
              {new Date(formation.dateFin).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
            <span>{formation.duree}h de formation</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-5 w-5 mr-2 text-gray-400" />
            <span>{formation.lieu || 'Lieu à définir'}</span>
          </div>
        </div>
      </div>
    )}

    <div className="mt-6 flex gap-3">
      <button
        onClick={onClose}
        className="flex-1 rounded-lg bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
      >
        Annuler
      </button>
      <button
        onClick={onConfirm}
        className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors duration-200"
      >
        Confirmer
      </button>
    </div>
  </ModalWrapper>
);

export const SuccessModal = ({ isOpen, onClose }) => (
  <ModalWrapper isOpen={isOpen} onClose={onClose}>
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <div className="rounded-full bg-green-50 p-3">
          <CheckCircleIcon className="h-8 w-8 text-green-500" />
        </div>
      </motion.div>

      <Dialog.Title as="h3" className="mt-4 text-lg font-semibold text-gray-900">
        Inscription réussie !
      </Dialog.Title>

      <p className="mt-2 text-sm text-gray-600">
        Votre inscription a été enregistrée avec succès. Vous recevrez bientôt un email de confirmation.
      </p>

      <div className="mt-6 w-full">
        <button
          onClick={onClose}
          className="w-full rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors duration-200"
        >
          Fermer
        </button>
      </div>
    </div>
  </ModalWrapper>
);
