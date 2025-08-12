const Formation = require('../models/Formation');
const User = require('../models/User');
const Domaine = require('../models/Domaine');

// Obtenir les statistiques globales
exports.getStatistiquesGlobales = async (req, res) => {
  try {
    console.log('Fetching global statistics...');
    
    // Statistiques globales
    const totalInscriptions = await User.countDocuments({ role: 'participant' });
    console.log('Total inscriptions:', totalInscriptions);
    
    // Inscriptions du mois en cours
    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);
    const inscriptionsMois = await User.countDocuments({
      role: 'participant',
      dateCreation: { $gte: debutMois }
    });
    console.log('Inscriptions this month:', inscriptionsMois);

    const result = {
      success: true,
      data: {
        totalInscriptions,
        inscriptionsMois
      }
    };
    console.log('Sending global statistics:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Erreur statistiques globales:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques globales',
      error: error.message
    });
  }
};

// Obtenir les statistiques des formations
exports.getStatistiquesFormations = async (req, res) => {
  try {
    console.log('Fetching formation statistics...');
    const maintenant = new Date();
    
    // Statistiques de base
    const total = await Formation.countDocuments();
    console.log('Total formations:', total);
    
    // Formations approuvées qui sont en cours (date actuelle entre dateDebut et dateFin)
    const active = await Formation.countDocuments({
      statut: 'approuve',
      dateDebut: { $lte: maintenant },
      dateFin: { $gte: maintenant }
    });
    console.log('Formations actives (en cours):', active);
    
    // Formations terminées (dateFin passée)
    const archived = await Formation.countDocuments({
      dateFin: { $lt: maintenant }
    });
    console.log('Formations terminées:', archived);
    
    // Formations en attente d'approbation
    const inactive = await Formation.countDocuments({
      statut: 'en_attente'
    });
    console.log('Formations en attente:', inactive);
    
    // Formations approuvées à venir (dateDebut future)
    const aVenir = await Formation.countDocuments({
      statut: 'approuve',
      dateDebut: { $gt: maintenant }
    });
    console.log('Formations à venir:', aVenir);

    // Timeline des formations par mois (30 derniers jours)
    const trenteJoursAvant = new Date();
    trenteJoursAvant.setDate(trenteJoursAvant.getDate() - 30);
    trenteJoursAvant.setHours(0, 0, 0, 0);

    // Données des formations créées par jour
    const formationsParJour = await Formation.aggregate([
      {
        $match: {
          dateCreation: { $gte: trenteJoursAvant }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$dateCreation" },
            month: { $month: "$dateCreation" },
            day: { $dayOfMonth: "$dateCreation" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);

    // Données des inscriptions par jour
    const inscriptionsParJour = await Formation.aggregate([
      {
        $match: {
          dateCreation: { $gte: trenteJoursAvant }
        }
      },
      {
        $unwind: "$participants"
      },
      {
        $group: {
          _id: {
            year: { $year: "$dateCreation" },
            month: { $month: "$dateCreation" },
            day: { $dayOfMonth: "$dateCreation" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);

    // Créer un tableau de 30 jours avec les données
    const timelineData = [];
    const timelineLabels = [];
    const formationsData = [];
    const inscriptionsData = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dateStr = date.toLocaleDateString('fr-FR', { 
        month: 'short', 
        day: 'numeric' 
      });
      timelineLabels.push(dateStr);
      
      // Trouver les données pour cette date
      const formationData = formationsParJour.find(item => 
        item._id.year === date.getFullYear() &&
        item._id.month === date.getMonth() + 1 &&
        item._id.day === date.getDate()
      );
      
      const inscriptionData = inscriptionsParJour.find(item => 
        item._id.year === date.getFullYear() &&
        item._id.month === date.getMonth() + 1 &&
        item._id.day === date.getDate()
      );
      
      formationsData.push(formationData ? formationData.count : 0);
      inscriptionsData.push(inscriptionData ? inscriptionData.count : 0);
    }

    const result = {
      success: true,
      data: {
        summary: {
          total,
          active,
          archived,
          inactive,
          aVenir
        },
        monthly: {
          labels: timelineLabels,
          formations: formationsData,
          inscriptions: inscriptionsData
        }
      }
    };
    console.log('Sending formation statistics:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Erreur statistiques formations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques des formations',
      error: error.message
    });
  }
};

// Obtenir les statistiques des formateurs
exports.getStatistiquesFormateurs = async (req, res) => {
  try {
    console.log('Fetching trainer statistics...');
    
    const total = await User.countDocuments({ role: 'formateur' });
    console.log('Total formateurs:', total);
    
    const active = await User.countDocuments({ 
      role: 'formateur',
      statut: 'actif'
    });
    console.log('Formateurs actifs:', active);

    const inactive = await User.countDocuments({ 
      role: 'formateur',
      statut: 'inactif'
    });

    // Timeline des formateurs par mois
    const sixMoisAvant = new Date();
    sixMoisAvant.setMonth(sixMoisAvant.getMonth() - 5);
    sixMoisAvant.setDate(1);
    sixMoisAvant.setHours(0, 0, 0, 0);

    const timeline = await User.aggregate([
      {
        $match: {
          role: 'formateur',
          dateCreation: { $gte: sixMoisAvant }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$dateCreation" },
            month: { $month: "$dateCreation" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Convertir le timeline en tableau de 6 mois
    const timelineData = new Array(6).fill(0);
    const timelineLabels = [];
    const moisActuel = new Date().getMonth();
    
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(moisActuel - i);
      timelineLabels.unshift(date.toLocaleString('fr-FR', { month: 'short' }));
    }

    timeline.forEach(item => {
      const moisIndex = (item._id.month - 1 - moisActuel + 12) % 12;
      if (moisIndex >= 0 && moisIndex < 6) {
        timelineData[moisIndex] = item.count;
      }
    });

    const result = {
      success: true,
      data: {
        summary: {
          total,
          active,
          inactive
        },
        monthly: {
          labels: timelineLabels,
          data: timelineData
        }
      }
    };
    console.log('Sending trainer statistics:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Erreur statistiques formateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques des formateurs',
      error: error.message
    });
  }
};

// Obtenir les statistiques des participants
exports.getStatistiquesParticipants = async (req, res) => {
  try {
    console.log('Fetching participant statistics...');
    
    const total = await User.countDocuments({ role: 'participant' });
    console.log('Total participants:', total);
    
    const active = await User.countDocuments({ 
      role: 'participant',
      statut: 'actif'
    });
    console.log('Participants actifs:', active);

    const inactive = await User.countDocuments({ 
      role: 'participant',
      statut: 'inactif'
    });

    // Timeline des participants par mois
    const sixMoisAvant = new Date();
    sixMoisAvant.setMonth(sixMoisAvant.getMonth() - 5);
    sixMoisAvant.setDate(1);
    sixMoisAvant.setHours(0, 0, 0, 0);

    const timeline = await User.aggregate([
      {
        $match: {
          role: 'participant',
          dateCreation: { $gte: sixMoisAvant }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$dateCreation" },
            month: { $month: "$dateCreation" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Convertir le timeline en tableau de 6 mois
    const timelineData = new Array(6).fill(0);
    const timelineLabels = [];
    const moisActuel = new Date().getMonth();
    
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(moisActuel - i);
      timelineLabels.unshift(date.toLocaleString('fr-FR', { month: 'short' }));
    }

    timeline.forEach(item => {
      const moisIndex = (item._id.month - 1 - moisActuel + 12) % 12;
      if (moisIndex >= 0 && moisIndex < 6) {
        timelineData[moisIndex] = item.count;
      }
    });

    const result = {
      success: true,
      data: {
        summary: {
          total,
          active,
          inactive
        },
        monthly: {
          labels: timelineLabels,
          data: timelineData
        }
      }
    };
    console.log('Sending participant statistics:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Erreur statistiques participants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques des participants',
      error: error.message
    });
  }
};
