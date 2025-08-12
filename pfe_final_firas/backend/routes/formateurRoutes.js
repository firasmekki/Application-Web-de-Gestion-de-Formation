const express = require('express');
const router = express.Router();
const { protect, formateurOnly } = require('../middleware/authMiddleware');
const {
    getFormations,
    createFormation,
    getFormationById,
    updateFormation,
    deleteFormation,
    updateProfile,
    getStatistics
} = require('../controllers/formateurController');

// Apply authentication middleware to all routes
router.use(protect);
router.use(formateurOnly);

// Formation routes
router.route('/formations')
    .get(getFormations)
    .post(createFormation);

router.route('/formations/:id')
    .get(getFormationById)
    .put(updateFormation)
    .delete(deleteFormation);

// Profile route
router.put('/profil', updateProfile);

// Statistics route
router.get('/statistics', getStatistics);

module.exports = router;
