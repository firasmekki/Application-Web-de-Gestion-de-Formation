const Archive = require('../models/Archive');
const Formation = require('../models/Formation');
const User = require('../models/User');

// Archiver un élément (formation ou utilisateur)
exports.archiverElement = async (req, res) => {
  try {
    const { typeElement, elementId, raisonArchivage } = req.body;
    let donnees;

    // Récupérer les données de l'élément à archiver
    if (typeElement === 'formation') {
      donnees = await Formation.findById(elementId);
    } else if (typeElement === 'utilisateur') {
      donnees = await User.findById(elementId);
    }

    if (!donnees) {
      return res.status(404).json({
        success: false,
        message: 'Élément non trouvé'
      });
    }

    // Créer l'archive
    const archive = await Archive.archiverElement({
      typeElement,
      elementId,
      donnees: donnees.toObject(),
      raisonArchivage,
      archivePar: req.user._id
    });

    // Désactiver l'élément original
    if (typeElement === 'formation') {
      await Formation.findByIdAndUpdate(elementId, { statut: 'archive' });
    } else if (typeElement === 'utilisateur') {
      await User.findByIdAndUpdate(elementId, { statut: 'inactif' });
    }

    res.status(201).json({
      success: true,
      message: 'Élément archivé avec succès',
      data: archive
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de l\'archivage',
      error: error.message
    });
  }
};

// Restaurer un élément archivé
exports.restaurerElement = async (req, res) => {
  try {
    const archive = await Archive.findById(req.params.id);
    
    if (!archive) {
      return res.status(404).json({
        success: false,
        message: 'Archive non trouvée'
      });
    }

    if (archive.restaure) {
      return res.status(400).json({
        success: false,
        message: 'Cet élément a déjà été restauré'
      });
    }

    // Restaurer l'élément original
    if (archive.typeElement === 'formation') {
      await Formation.findByIdAndUpdate(archive.elementId, { 
        statut: 'actif',
        ...archive.donnees
      });
    } else if (archive.typeElement === 'utilisateur') {
      await User.findByIdAndUpdate(archive.elementId, { 
        statut: 'actif',
        ...archive.donnees
      });
    }

    // Mettre à jour l'archive
    const archiveRestauree = await Archive.restaurerElement(
      archive._id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: 'Élément restauré avec succès',
      data: archiveRestauree
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la restauration',
      error: error.message
    });
  }
};

// Obtenir l'historique des archives
exports.getHistorique = async (req, res) => {
  try {
    const { type, dateDebut, dateFin } = req.query;
    const filters = {};

    if (type) {
      filters.typeElement = type;
    }

    if (dateDebut || dateFin) {
      filters.dateArchivage = {};
      if (dateDebut) filters.dateArchivage.$gte = new Date(dateDebut);
      if (dateFin) filters.dateArchivage.$lte = new Date(dateFin);
    }

    const archives = await Archive.getHistorique(filters);

    res.status(200).json({
      success: true,
      count: archives.length,
      data: archives
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique',
      error: error.message
    });
  }
};

// Supprimer définitivement un élément archivé
exports.supprimerArchive = async (req, res) => {
  try {
    const archive = await Archive.findById(req.params.id);
    
    if (!archive) {
      return res.status(404).json({
        success: false,
        message: 'Archive non trouvée'
      });
    }

    // Supprimer l'élément original
    if (archive.typeElement === 'formation') {
      await Formation.findByIdAndDelete(archive.elementId);
    } else if (archive.typeElement === 'utilisateur') {
      await User.findByIdAndDelete(archive.elementId);
    }

    // Supprimer l'archive
    await Archive.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Archive supprimée définitivement'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};
