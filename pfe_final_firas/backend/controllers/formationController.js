const Formation = require('../models/Formation');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Obtenir toutes les formations
exports.getFormations = async (req, res) => {
  try {
    const { recherche, domaine, niveau } = req.query;
    
    // Construire le filtre
    const filter = {};
    
    // Filtre par recherche (titre ou description)
    if (recherche) {
      filter.$or = [
        { titre: { $regex: recherche, $options: 'i' } },
        { description: { $regex: recherche, $options: 'i' } }
      ];
    }
    
    // Filtre par domaine
    if (domaine) {
      filter.domaine = domaine;
    }
    
    // Filtre par niveau
    if (niveau) {
      filter.niveau = niveau;
    }

    const formations = await Formation.find(filter)
      .populate('formateur', 'nom prenom email')
      .populate('domaine', 'nom')
      .sort({ dateDebut: -1 }); // Tri par date de début décroissante

    res.status(200).json({
      success: true,
      count: formations.length,
      data: formations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des formations',
      error: error.message
    });
  }
};

// Obtenir une formation spécifique
exports.getFormation = async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id)
      .populate('formateur', 'nom prenom email')
      .populate('domaine', 'nom')
      .populate('participants', 'nom prenom email');

    if (!formation) {
      return res.status(404).json({
        success: false,
        message: 'Formation non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: formation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la formation',
      error: error.message
    });
  }
};

// Créer une nouvelle formation
exports.creerFormation = async (req, res) => {
  try {
    // Si l'utilisateur est un admin, il peut spécifier un formateur
    // Sinon, utiliser l'utilisateur connecté comme formateur
    if (req.user.role !== 'administrateur') {
      req.body.formateur = req.user._id;
    }
    
    // Vérifier que le formateur est spécifié
    if (!req.body.formateur) {
      return res.status(400).json({
        success: false,
        message: 'Le formateur est requis'
      });
    }

    const formation = await Formation.create(req.body);

    // Trouver l'administrateur
    const admin = await User.findOne({ role: 'administrateur' });
    
    if (admin) {
      // Créer une notification pour l'administrateur
      await Notification.creerNotification({
        destinataire: admin._id,
        titre: 'Nouvelle formation créée',
        message: `Une nouvelle formation "${formation.titre}" a été créée par ${req.user.nom} ${req.user.prenom}`,
        type: 'formation',
        donnees: {
          formationId: formation._id
        }
      });
    }

    res.status(201).json({
      success: true,
      data: formation
    });
  } catch (error) {
    console.error('Erreur création formation:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création de la formation',
      error: error.message
    });
  }
};

// Mettre à jour une formation
exports.updateFormation = async (req, res) => {
  try {
    let formation = await Formation.findById(req.params.id);

    if (!formation) {
      return res.status(404).json({
        success: false,
        message: 'Formation non trouvée'
      });
    }

    // Vérifier si l'utilisateur est le formateur de la formation ou un administrateur
    if (formation.formateur.toString() !== req.user._id && req.user.role !== 'administrateur') {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à modifier cette formation'
      });
    }

    formation = await Formation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: formation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la formation',
      error: error.message
    });
  }
};

// Supprimer une formation
exports.deleteFormation = async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id);

    if (!formation) {
      return res.status(404).json({
        success: false,
        message: 'Formation non trouvée'
      });
    }

    // Vérifier si l'utilisateur est le formateur de la formation ou un administrateur
    if (formation.formateur.toString() !== req.user._id && req.user.role !== 'administrateur') {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé à supprimer cette formation'
      });
    }

    await Formation.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: req.params.id,
      message: 'Formation supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la formation',
      error: error.message
    });
  }
};

// Inscrire un participant à une formation
exports.inscrireParticipant = async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id);

    if (!formation) {
      return res.status(404).json({
        success: false,
        message: 'Formation non trouvée'
      });
    }

    // Vérifier si le participant est déjà inscrit
    if (formation.participants.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Vous êtes déjà inscrit à cette formation'
      });
    }

    formation.participants.push(req.user._id);
    await formation.save();

    // Créer une notification pour le formateur
    await Notification.creerNotification({
      destinataire: formation.formateur,
      titre: 'Nouvelle inscription',
      message: `${req.user.nom} ${req.user.prenom} s'est inscrit à votre formation "${formation.titre}"`,
      type: 'formation'
    });

    res.status(200).json({
      success: true,
      message: 'Inscription réussie',
      data: formation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
};

// Désinscrire un participant d'une formation
exports.desinscrireParticipant = async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id);

    if (!formation) {
      return res.status(404).json({
        success: false,
        message: 'Formation non trouvée'
      });
    }

    // Vérifier si le participant est inscrit
    if (!formation.participants.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Vous n\'êtes pas inscrit à cette formation'
      });
    }

    formation.participants = formation.participants.filter(
      id => id.toString() !== req.user._id
    );
    await formation.save();

    res.status(200).json({
      success: true,
      message: 'Désinscription réussie',
      data: formation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la désinscription',
      error: error.message
    });
  }
};

// Valider une formation (admin)
exports.validerFormation = async (req, res) => {
  try {
    const formation = await Formation.findByIdAndUpdate(
      req.params.id,
      { statut: 'validee' },
      {
        new: true,
        runValidators: true
      }
    );

    if (!formation) {
      return res.status(404).json({
        success: false,
        message: 'Formation non trouvée'
      });
    }

    // Créer une notification pour le formateur
    await Notification.creerNotification({
      destinataire: formation.formateur,
      titre: 'Formation validée',
      message: `Votre formation "${formation.titre}" a été validée par l'administrateur`,
      type: 'formation'
    });

    res.status(200).json({
      success: true,
      data: formation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation de la formation',
      error: error.message
    });
  }
};

// Refuser une formation (admin)
exports.refuserFormation = async (req, res) => {
  try {
    const formation = await Formation.findByIdAndUpdate(
      req.params.id,
      { 
        statut: 'refusee',
        raisonRefus: req.body.raisonRefus 
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!formation) {
      return res.status(404).json({
        success: false,
        message: 'Formation non trouvée'
      });
    }

    // Créer une notification pour le formateur
    await Notification.creerNotification({
      destinataire: formation.formateur,
      titre: 'Formation refusée',
      message: `Votre formation "${formation.titre}" a été refusée. Raison: ${req.body.raisonRefus}`,
      type: 'formation'
    });

    res.status(200).json({
      success: true,
      data: formation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du refus de la formation',
      error: error.message
    });
  }
};

// Obtenir les formations d'un formateur
exports.getFormationsParFormateur = async (req, res) => {
  try {
    const formations = await Formation.find({ formateur: req.user._id })
      .populate('domaine', 'nom description')
      .populate('formateur', 'nom prenom email')
      .populate('participants', 'nom prenom email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: formations.length,
      data: formations
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des formations du formateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des formations',
      error: error.message
    });
  }
};

// Obtenir les formations d'un participant
exports.getFormationsParParticipant = async (req, res) => {
  try {
    const formations = await Formation.find({ participants: req.user._id })
      .populate('formateur', 'nom prenom email')
      .populate('domaine', 'nom');

    res.status(200).json({
      success: true,
      count: formations.length,
      data: formations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des formations',
      error: error.message
    });
  }
};
