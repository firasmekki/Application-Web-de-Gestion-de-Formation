const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  creerNotification,
  getNotificationsUtilisateur,
  getNotificationsNonLues,
  marquerCommeLue,
  marquerToutesCommeLues,
  supprimerNotification
} = require('../controllers/notificationController');

router.use(protect);

router
  .route('/')
  .get(getNotificationsUtilisateur)
  .post(creerNotification);

router.get('/non-lues', getNotificationsNonLues);
router.put('/marquer-toutes-comme-lues', marquerToutesCommeLues);

router
  .route('/:id')
  .put(marquerCommeLue)
  .delete(supprimerNotification);

module.exports = router;
