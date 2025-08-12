const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Formation = require('../models/Formation');
const User = require('../models/User');

router.use(protect);
router.use(authorize('administrateur', 'formateur')); // Only admins and trainers have access to statistics

// Get global statistics
router.get('/global', async (req, res) => {
  try {
    // Get total inscriptions (only participants)
    const totalInscriptions = await User.countDocuments({ role: 'participant' });
    const activeInscriptions = await User.countDocuments({ role: 'participant', statut: 'actif' });
    
    // Calculate start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    // Calculate start of current week (Sunday)
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Get new inscriptions this month (only participants)
    const inscriptionsMois = await User.countDocuments({
      role: 'participant',
      createdAt: { $gte: startOfMonth }
    });
    
    // Get new inscriptions this week (only participants)
    const inscriptionsSemaine = await User.countDocuments({
      role: 'participant',
      createdAt: { $gte: startOfWeek }
    });

    res.json({
      success: true,
      data: {
        totalInscriptions,
        activeInscriptions,
        inscriptionsMois,
        inscriptionsSemaine
      }
    });
  } catch (error) {
    console.error('Error fetching global statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques globales',
      error: error.message
    });
  }
});

// Get formations statistics
router.get('/formations', async (req, res) => {
  try {
    const totalFormations = await Formation.countDocuments();
    const activeFormations = await Formation.countDocuments({ statut: 'active' });
    const inactiveFormations = await Formation.countDocuments({ statut: 'inactive' });
    const archivedFormations = await Formation.countDocuments({ statut: 'archive' });

    // Get formations by month
    const monthlyStats = await Formation.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = monthlyStats.map(stat => months[stat._id - 1]);
    const data = monthlyStats.map(stat => stat.count);

    res.json({
      success: true,
      data: {
        summary: {
          total: totalFormations,
          active: activeFormations,
          inactive: inactiveFormations,
          archived: archivedFormations
        },
        monthly: {
          labels,
          data
        }
      }
    });
  } catch (error) {
    console.error('Error fetching formations statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques des formations',
      error: error.message
    });
  }
});

// Get trainers statistics
router.get('/formateurs', async (req, res) => {
  try {
    const totalFormateurs = await User.countDocuments({ role: 'formateur' });
    const activeFormateurs = await User.countDocuments({ role: 'formateur', statut: 'actif' });
    const inactiveFormateurs = await User.countDocuments({ role: 'formateur', statut: 'inactif' });

    // Get formateurs by month
    const monthlyStats = await User.aggregate([
      {
        $match: { role: 'formateur' }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = monthlyStats.map(stat => months[stat._id - 1]);
    const data = monthlyStats.map(stat => stat.count);

    res.json({
      success: true,
      data: {
        summary: {
          total: totalFormateurs,
          active: activeFormateurs,
          inactive: inactiveFormateurs
        },
        monthly: {
          labels,
          data
        }
      }
    });
  } catch (error) {
    console.error('Error fetching trainers statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques des formateurs',
      error: error.message
    });
  }
});

// Get participants statistics
router.get('/participants', async (req, res) => {
  try {
    const totalParticipants = await User.countDocuments({ role: 'participant' });
    const activeParticipants = await User.countDocuments({ role: 'participant', statut: 'actif' });
    const inactiveParticipants = await User.countDocuments({ role: 'participant', statut: 'inactif' });

    // Get participants by month
    const monthlyStats = await User.aggregate([
      {
        $match: { role: 'participant' }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = monthlyStats.map(stat => months[stat._id - 1]);
    const data = monthlyStats.map(stat => stat.count);

    res.json({
      success: true,
      data: {
        summary: {
          total: totalParticipants,
          active: activeParticipants,
          inactive: inactiveParticipants
        },
        monthly: {
          labels,
          data
        }
      }
    });
  } catch (error) {
    console.error('Error fetching participants statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques des participants',
      error: error.message
    });
  }
});

// Get statistics based on period (for charts)
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, period } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get formations statistics
    const formationsCount = await Formation.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    const activeFormations = await Formation.countDocuments({
      statut: 'active',
      createdAt: { $gte: start, $lte: end }
    });

    // Get users statistics
    const usersCount = await User.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    const activeUsers = await User.countDocuments({
      statut: 'actif',
      createdAt: { $gte: start, $lte: end }
    });

    // Get monthly statistics
    const monthlyStats = await Formation.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = monthlyStats.map(stat => months[stat._id - 1]);
    const data = monthlyStats.map(stat => stat.count);

    res.json({
      success: true,
      data: {
        summary: {
          formations: formationsCount,
          activeFormations,
          users: usersCount,
          activeUsers
        },
        monthly: {
          labels,
          datasets: [
            {
              label: 'Formations',
              data,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
            }
          ]
        }
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message 
    });
  }
});

module.exports = router;
