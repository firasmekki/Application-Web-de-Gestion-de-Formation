const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getFormations,
  getFormation,
  creerFormation,
  updateFormation,
  deleteFormation,
  inscrireParticipant,
  desinscrireParticipant,
  validerFormation,
  refuserFormation,
  getFormationsParFormateur,
  getFormationsParParticipant
} = require('../controllers/formationController');

// Protéger toutes les routes
router.use(protect);

// Routes publiques (pour utilisateurs authentifiés)
router.route('/').get(getFormations);
router.route('/:id').get(getFormation);

// Routes pour les participants
router.route('/:id/inscription').post(authorize('participant'), inscrireParticipant);
router.route('/:id/desinscription').post(authorize('participant'), desinscrireParticipant);
router.get('/participant/mes-formations', authorize('participant'), getFormationsParParticipant);

// Routes pour les formateurs
router.get('/formateur/mes-formations', authorize('formateur'), getFormationsParFormateur);
router
  .route('/')
  .post(authorize('formateur', 'administrateur'), creerFormation);

router
  .route('/:id')
  .put(authorize('formateur', 'administrateur'), updateFormation)
  .delete(authorize('formateur', 'administrateur'), deleteFormation);

// Routes pour les administrateurs
router.route('/:id/valider').put(authorize('administrateur'), validerFormation);
router.route('/:id/refuser').put(authorize('administrateur'), refuserFormation);

module.exports = router;
