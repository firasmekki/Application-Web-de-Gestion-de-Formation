const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Archive = require('../models/Archive');

router.use(protect);
router.use(authorize('administrateur')); // Only administrators have access to archives

// Get archived formations
router.get('/formations', async (req, res) => {
  try {
    const { type = 'tous', recherche = '', dateDebut, dateFin } = req.query;
    
    let query = { typeElement: 'formation' };
    
    if (type !== 'tous') {
      query.type = type;
    }
    
    if (recherche) {
      query.$or = [
        { 'donnees.titre': { $regex: recherche, $options: 'i' } },
        { 'donnees.description': { $regex: recherche, $options: 'i' } }
      ];
    }
    
    if (dateDebut || dateFin) {
      query.dateArchivage = {};
      if (dateDebut) query.dateArchivage.$gte = new Date(dateDebut);
      if (dateFin) query.dateArchivage.$lte = new Date(dateFin);
    }
    
    const archives = await Archive.find(query)
      .sort({ dateArchivage: -1 })
      .populate('archivePar', '-password');
      
    res.json({
      success: true,
      data: archives
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des archives',
      error: error.message
    });
  }
});

// Get archived users
router.get('/utilisateurs', async (req, res) => {
  try {
    const { type = 'tous', recherche = '', dateDebut, dateFin } = req.query;
    
    let query = { typeElement: 'utilisateur' };
    
    if (type !== 'tous') {
      query.type = type;
    }
    
    if (recherche) {
      query.$or = [
        { 'donnees.nom': { $regex: recherche, $options: 'i' } },
        { 'donnees.prenom': { $regex: recherche, $options: 'i' } },
        { 'donnees.email': { $regex: recherche, $options: 'i' } }
      ];
    }
    
    if (dateDebut || dateFin) {
      query.dateArchivage = {};
      if (dateDebut) query.dateArchivage.$gte = new Date(dateDebut);
      if (dateFin) query.dateArchivage.$lte = new Date(dateFin);
    }
    
    const archives = await Archive.find(query)
      .sort({ dateArchivage: -1 })
      .populate('archivePar', '-password');
      
    res.json({
      success: true,
      data: archives
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des archives',
      error: error.message
    });
  }
});

// Restore an archived item
router.put('/:type/:id/restore', async (req, res) => {
  try {
    const { type, id } = req.params;
    const archive = await Archive.findById(id);
    
    if (!archive) {
      return res.status(404).json({
        success: false,
        message: 'Archive non trouvée'
      });
    }
    
    if (type === 'formations') {
      await Formation.findByIdAndUpdate(archive.elementId, { statut: 'active' });
    } else if (type === 'utilisateurs') {
      await User.findByIdAndUpdate(archive.elementId, { statut: 'actif' });
    }
    
    await archive.remove();
    
    res.json({
      success: true,
      message: 'Élément restauré avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la restauration',
      error: error.message
    });
  }
});

// Delete an archived item permanently
router.delete('/:type/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const archive = await Archive.findById(id);
    
    if (!archive) {
      return res.status(404).json({
        success: false,
        message: 'Archive non trouvée'
      });
    }
    
    await archive.remove();
    
    res.json({
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
});

module.exports = router;
