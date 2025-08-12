import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createFormation } from '../../redux/slices/formationSlice';
import { getDomaines } from '../../redux/slices/domaineSlice';
import { 
  PlusIcon, 
  XMarkIcon, 
  ArrowLeftIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  MapPinIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const CreationFormation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const domaines = useSelector(state => state.domaines.items);
  const domainesLoading = useSelector(state => state.domaines.loading);
  
  // Debug: afficher l'état des domaines
  useEffect(() => {
    console.log('CreationFormation: État des domaines:', { domaines, domainesLoading });
  }, [domaines, domainesLoading]);
  
  const { user } = useSelector(state => state.auth);
  
  // Debug: afficher l'état de l'authentification
  useEffect(() => {
    console.log('CreationFormation: État de l\'authentification:', { user });
  }, [user]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    duree: '',
    capaciteMax: '',
    domaine: '',
    niveau: 'debutant',
    prerequis: [],
    objectifs: [],
    contenu: [],
    modalites: 'presentiel',
    lieu: '',
    lienVisio: '',
    currentPrereq: '',
    currentObjectif: '',
    currentContenuTitre: '',
    currentContenuDesc: ''
  });

  useEffect(() => {
    console.log('CreationFormation: Chargement des domaines...');
    dispatch(getDomaines());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => {
      const newState = {
        ...prevState,
        [name]: value
      };
      
      // Validation en temps réel pour les dates
      if (name === 'dateDebut' && value && newState.dateFin) {
        const dateDebut = new Date(value);
        const dateFin = new Date(newState.dateFin);
        if (dateFin <= dateDebut) {
          setError('La date de fin doit être postérieure à la date de début');
        } else {
          setError(null);
        }
      }
      
      if (name === 'dateFin' && value && newState.dateDebut) {
        const dateDebut = new Date(newState.dateDebut);
        const dateFin = new Date(value);
        if (dateFin <= dateDebut) {
          setError('La date de fin doit être postérieure à la date de début');
        } else {
          setError(null);
        }
      }
      
      return newState;
    });
  };

  const handleArrayInput = (type, e) => {
    if (e.key === 'Enter' && formData[`current${type}`].trim()) {
      e.preventDefault();
      const value = formData[`current${type}`].trim();
      const field = type === 'Prereq' ? 'prerequis' : 'objectifs';
      
      if (!formData[field].includes(value)) {
        setFormData(prevState => ({
          ...prevState,
          [field]: [...prevState[field], value],
          [`current${type}`]: ''
        }));
      }
    }
  };

  const removeArrayItem = (type, item) => {
    const field = type === 'Prereq' ? 'prerequis' : 'objectifs';
    setFormData(prevState => ({
      ...prevState,
      [field]: prevState[field].filter(i => i !== item)
    }));
  };

  const addContenu = () => {
    if (formData.currentContenuTitre.trim() && formData.currentContenuDesc.trim()) {
      setFormData(prevState => ({
        ...prevState,
        contenu: [
          ...prevState.contenu,
          {
            titre: prevState.currentContenuTitre.trim(),
            description: prevState.currentContenuDesc.trim()
          }
        ],
        currentContenuTitre: '',
        currentContenuDesc: ''
      }));
    }
  };

  const removeContenu = (index) => {
    setFormData(prevState => ({
      ...prevState,
      contenu: prevState.contenu.filter((_, i) => i !== index)
    }));
  };

  const calculateDateFin = () => {
    if (formData.dateDebut && formData.duree) {
      const debut = new Date(formData.dateDebut);
      const fin = new Date(debut);
      fin.setHours(fin.getHours() + parseInt(formData.duree));
      
      // Si la date de fin est le même jour que la date de début, 
      // on ajoute au moins 1 jour pour éviter les problèmes de validation
      if (fin.toDateString() === debut.toDateString()) {
        fin.setDate(fin.getDate() + 1);
      }
      
      return fin.toISOString().split('T')[0];
    }
    return '';
  };

  useEffect(() => {
    const dateFin = calculateDateFin();
    if (dateFin) {
      setFormData(prev => ({ ...prev, dateFin }));
    }
  }, [formData.dateDebut, formData.duree]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validation du contenu
    const contenuValide = formData.contenu.every(item => 
      item.titre && item.titre.trim() !== '' && 
      item.description && item.description.trim() !== ''
    );

    if (!contenuValide) {
      setError('Chaque section de contenu doit avoir un titre et une description');
      setIsSubmitting(false);
      return;
    }

    const formationData = {
      titre: formData.titre.trim(),
      description: formData.description.trim(),
      dateDebut: new Date(formData.dateDebut).toISOString(),
      dateFin: new Date(formData.dateFin).toISOString(),
      duree: parseInt(formData.duree),
      capaciteMax: parseInt(formData.capaciteMax),
      domaine: formData.domaine,
      niveau: formData.niveau,
      prerequis: formData.prerequis || [],
      objectifs: formData.objectifs || [],
      contenu: formData.contenu.map(item => ({
        titre: item.titre.trim(),
        description: item.description.trim()
      })),
      modalites: formData.modalites,
      statut: 'en_attente'
    };

    // Ajouter les champs conditionnels
    if (formData.modalites !== 'distanciel') {
      formationData.lieu = formData.lieu.trim();
    }
    
    if (formData.modalites !== 'presentiel') {
      formationData.lienVisio = formData.lienVisio.trim();
    }

    // Validation des dates
    const dateDebut = new Date(formData.dateDebut);
    const dateFin = new Date(formData.dateFin);
    const maintenant = new Date();
    maintenant.setHours(0, 0, 0, 0); // Réinitialiser l'heure pour comparer seulement les dates

    if (dateDebut < maintenant) {
      setError('La date de début doit être postérieure ou égale à aujourd\'hui');
      setIsSubmitting(false);
      return;
    }

    if (dateFin <= dateDebut) {
      setError('La date de fin doit être strictement postérieure à la date de début');
      setIsSubmitting(false);
      return;
    }

    // Validation supplémentaire
    if (!formationData.contenu.length) {
      setError('Veuillez ajouter au moins une section de contenu');
      setIsSubmitting(false);
      return;
    }

    if (formationData.modalites === 'presentiel' && !formationData.lieu) {
      setError('Le lieu est requis pour une formation en présentiel');
      setIsSubmitting(false);
      return;
    }

    if (formationData.modalites === 'distanciel' && !formationData.lienVisio) {
      setError('Le lien de visioconférence est requis pour une formation à distance');
      setIsSubmitting(false);
      return;
    }

    if (formationData.modalites === 'hybride' && (!formationData.lieu || !formationData.lienVisio)) {
      setError('Le lieu et le lien de visioconférence sont requis pour une formation hybride');
      setIsSubmitting(false);
      return;
    }

    console.log('Données du formulaire avant envoi:', formationData);
    console.log('Niveau:', formationData.niveau);
    console.log('Modalités:', formationData.modalites);
    console.log('Lieu:', formationData.lieu);

    try {
      const result = await dispatch(createFormation(formationData)).unwrap();
      console.log('Réponse du serveur:', result);
      
      // Si la formation a été créée avec succès
      if (result) {
        toast.success('Formation créée avec succès ! En attente de validation par l\'administrateur.');
        navigate('/formateur/formations');
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      
      // Si l'erreur est une chaîne de caractères
      if (typeof error === 'string') {
        setError(error);
        toast.error(error);
      } 
      // Si l'erreur est un objet avec un message
      else if (error?.message) {
        setError(error.message);
        toast.error(error.message);
      }
      // Message d'erreur par défaut
      else {
        setError('Une erreur est survenue lors de la création de la formation');
        toast.error('Une erreur est survenue lors de la création de la formation');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Informations générales', icon: DocumentTextIcon },
    { number: 2, title: 'Contenu et prérequis', icon: AcademicCapIcon },
    { number: 3, title: 'Modalités et planification', icon: CalendarIcon },
  ];

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.titre && formData.description && formData.domaine;
      case 2:
        // On exige au moins un élément de contenu, les prérequis et objectifs sont optionnels
        return formData.contenu.length > 0;
      case 3:
        return formData.dateDebut && formData.duree && formData.capaciteMax && 
               ((formData.modalites === 'presentiel' && formData.lieu) || 
                (formData.modalites === 'distanciel' && formData.lienVisio) || 
                (formData.modalites === 'hybride' && formData.lieu && formData.lienVisio));
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/formateur/formations')}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-500" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Créer une nouvelle formation</h1>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                      ${currentStep === step.number 
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : currentStep > step.number
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 bg-white text-gray-500'}`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="ml-4 hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{step.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4 h-0.5 bg-gray-200">
                    <div
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: currentStep > step.number ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center text-red-700">
            <XMarkIcon className="h-5 w-5 text-red-400 mr-3" />
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-8">
            {/* Step 1: Informations générales */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="titre" className="block text-sm font-medium text-gray-700">
                    Titre de la formation *
                  </label>
                  <input
                    type="text"
                    name="titre"
                    id="titre"
                    value={formData.titre}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Ex: Introduction à React.js"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    maxLength={500}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Décrivez le contenu et les points clés de votre formation..."
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="domaine" className="block text-sm font-medium text-gray-700">
                    Domaine *
                  </label>
                  <select
                    id="domaine"
                    name="domaine"
                    value={formData.domaine}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    disabled={domainesLoading}
                  >
                    <option value="">Sélectionnez un domaine</option>
                    {domaines.map((domaine) => (
                      <option key={domaine._id} value={domaine._id}>
                        {domaine.nom}
                      </option>
                    ))}
                  </select>
                  {domainesLoading && (
                    <p className="mt-1 text-sm text-gray-500">
                      Chargement des domaines...
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="niveau" className="block text-sm font-medium text-gray-700">
                    Niveau *
                  </label>
                  <select
                    name="niveau"
                    id="niveau"
                    value={formData.niveau}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="debutant">Débutant</option>
                    <option value="intermediaire">Intermédiaire</option>
                    <option value="avance">Avancé</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Contenu et prérequis */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prérequis * (Appuyez sur Entrée pour ajouter)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.prerequis.map((prereq, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                      >
                        {prereq}
                        <button
                          type="button"
                          onClick={() => removeArrayItem('Prereq', prereq)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formData.currentPrereq}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPrereq: e.target.value }))}
                    onKeyPress={(e) => handleArrayInput('Prereq', e)}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Ajouter un prérequis..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objectifs * (Appuyez sur Entrée pour ajouter)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.objectifs.map((objectif, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700"
                      >
                        {objectif}
                        <button
                          type="button"
                          onClick={() => removeArrayItem('Objectif', objectif)}
                          className="ml-2 text-green-500 hover:text-green-700"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formData.currentObjectif}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentObjectif: e.target.value }))}
                    onKeyPress={(e) => handleArrayInput('Objectif', e)}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Ajouter un objectif..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Contenu de la formation *
                  </label>
                  <div className="space-y-4">
                    {formData.contenu.map((item, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg relative">
                        <button
                          type="button"
                          onClick={() => removeContenu(index)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                        <h4 className="font-medium">{item.titre}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                    ))}
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={formData.currentContenuTitre}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentContenuTitre: e.target.value }))}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Titre de la section"
                      />
                      <textarea
                        value={formData.currentContenuDesc}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentContenuDesc: e.target.value }))}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Description de la section"
                        rows="2"
                      />
                      <button
                        type="button"
                        onClick={addContenu}
                        className="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Ajouter une section
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Modalités et planification */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Modalité de formation *
                  </label>
                  <div className="mt-2 grid grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, modalites: 'presentiel' }))}
                      className={`p-4 border rounded-lg flex items-center justify-center ${
                        formData.modalites === 'presentiel'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <UserGroupIcon className="h-5 w-5 mr-2" />
                      Présentiel
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, modalites: 'distanciel' }))}
                      className={`p-4 border rounded-lg flex items-center justify-center ${
                        formData.modalites === 'distanciel'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <VideoCameraIcon className="h-5 w-5 mr-2" />
                      À distance
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, modalites: 'hybride' }))}
                      className={`p-4 border rounded-lg flex items-center justify-center ${
                        formData.modalites === 'hybride'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <AcademicCapIcon className="h-5 w-5 mr-2" />
                      Hybride
                    </button>
                  </div>
                </div>

                {(formData.modalites === 'presentiel' || formData.modalites === 'hybride') && (
                  <div>
                    <label htmlFor="lieu" className="block text-sm font-medium text-gray-700">
                      Lieu *
                    </label>
                    <div className="mt-1 relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPinIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="lieu"
                        id="lieu"
                        value={formData.lieu}
                        onChange={handleChange}
                        required={formData.modalites !== 'distanciel'}
                        className="block w-full pl-10 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Adresse du lieu de formation"
                      />
                    </div>
                  </div>
                )}

                {(formData.modalites === 'distanciel' || formData.modalites === 'hybride') && (
                  <div>
                    <label htmlFor="lienVisio" className="block text-sm font-medium text-gray-700">
                      Lien de visioconférence *
                    </label>
                    <div className="mt-1 relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <VideoCameraIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        name="lienVisio"
                        id="lienVisio"
                        value={formData.lienVisio}
                        onChange={handleChange}
                        required={formData.modalites !== 'presentiel'}
                        className="block w-full pl-10 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Lien de la visioconférence"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700">
                      Date de début *
                    </label>
                    <input
                      type="date"
                      name="dateDebut"
                      id="dateDebut"
                      value={formData.dateDebut}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="duree" className="block text-sm font-medium text-gray-700">
                      Durée (heures) *
                    </label>
                    <input
                      type="number"
                      name="duree"
                      id="duree"
                      value={formData.duree}
                      onChange={handleChange}
                      required
                      min="1"
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700">
                      Date de fin *
                    </label>
                    <input
                      type="date"
                      name="dateFin"
                      id="dateFin"
                      value={formData.dateFin}
                      onChange={handleChange}
                      required
                      min={formData.dateDebut || new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Calculée automatiquement ou modifiable
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="capaciteMax" className="block text-sm font-medium text-gray-700">
                    Capacité maximale *
                  </label>
                  <input
                    type="number"
                    name="capaciteMax"
                    id="capaciteMax"
                    value={formData.capaciteMax}
                    onChange={handleChange}
                    required
                    min="1"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Nombre maximum de participants pouvant s'inscrire à la formation
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="px-8 py-4 bg-gray-50 flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-4 py-2 rounded-lg flex items-center ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Précédent
            </button>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate('/formateur/formations')}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    validateStep(currentStep)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Suivant
                  <CheckCircleIcon className="h-5 w-5 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !validateStep(currentStep)}
                  className={`px-6 py-2 rounded-lg flex items-center ${
                    isSubmitting || !validateStep(currentStep)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      Créer la formation
                      <PlusIcon className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreationFormation;
