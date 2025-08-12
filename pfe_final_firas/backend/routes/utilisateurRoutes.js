const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const handleUpload = require('../middleware/upload');
const {
  getUtilisateurs,
  getUtilisateur,
  updateUtilisateur,
  deleteUtilisateur,
  getProfile,
  updateProfile,
  updateMotDePasse,
  updateStatut,
  getParticipants,
  updatePhoto,
  getUserStats
} = require('../controllers/utilisateurController');

// Routes protégées
router.use(protect);

// Route pour obtenir tous les participants
router.get('/participants', getParticipants);

// Routes pour tous les utilisateurs authentifiés
router.get('/profile', getProfile);
router.put('/profile', handleUpload, updateProfile);
router.put('/profile/photo', handleUpload, updatePhoto);
router.put('/password', updateMotDePasse);
router.get('/stats', getUserStats);

// Routes pour les administrateurs uniquement
router
  .route('/')
  .get(authorize('administrateur'), getUtilisateurs);

router
  .route('/:id')
  .get(authorize('administrateur'), getUtilisateur)
  .put(authorize('administrateur'), updateUtilisateur)
  .delete(authorize('administrateur'), deleteUtilisateur);

// Route pour changer le statut d'un utilisateur
router.patch('/:id/statut', authorize('administrateur'), updateStatut);

module.exports = router;
