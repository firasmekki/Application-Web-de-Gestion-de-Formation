const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  creerDomaine,
  getDomaines,
  getDomaine,
  updateDomaine,
  deleteDomaine,
  getStatistiquesDomaines
} = require('../controllers/domaineController');

router.use(protect); // Protection de toutes les routes

router
  .route('/')
  .get(getDomaines)
  .post(authorize('administrateur'), creerDomaine);

router
  .route('/:id')
  .get(getDomaine)
  .put(authorize('administrateur'), updateDomaine)
  .delete(authorize('administrateur'), deleteDomaine);

router.get('/statistiques/global', authorize('administrateur'), getStatistiquesDomaines);

module.exports = router;
