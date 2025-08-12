const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// Routes publiques
router.post('/inscription', authController.inscription);
router.post('/connexion', authController.connexion);
router.post('/deconnexion', protect, authController.deconnexion);
router.post('/reinitialisation-mot-de-passe', authController.demandeReinitialisationMotDePasse);
router.put('/reinitialisation-mot-de-passe/:token', authController.reinitialisationMotDePasse);

// Routes protégées
router.get('/me', protect, async (req, res) => {
  try {
    // Exclure le mot de passe de la réponse
    const user = await User.findById(req.user._id).select('-motDePasse');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erreur /me:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données utilisateur'
    });
  }
});

module.exports = router;
