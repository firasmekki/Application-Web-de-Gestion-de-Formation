const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Formation = require('../models/Formation');
const User = require('../models/User');
const Inscription = require('../models/Inscription');

// Middleware de protection
router.use(protect);

// Obtenir les inscriptions du participant
router.get('/inscriptions', async (req, res) => {
  try {
    const inscriptions = await Inscription.find({ participant: req.user._id })
      .populate('formation')
      .sort('-dateInscription');

    res.json({
      success: true,
      data: inscriptions
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des inscriptions',
      error: error.message
    });
  }
});

// Obtenir l'historique des formations
router.get('/historique', async (req, res) => {
  try {
    const inscriptions = await Inscription.find({
      participant: req.user._id,
      statut: 'terminee'
    })
      .populate('formation')
      .sort('-dateCompletion');

    res.json({
      success: true,
      data: inscriptions
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique',
      error: error.message
    });
  }
});

module.exports = router;
