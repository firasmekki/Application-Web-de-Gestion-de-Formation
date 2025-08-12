const Domaine = require('../models/Domaine');
const Formation = require('../models/Formation');

// Créer un nouveau domaine
exports.creerDomaine = async (req, res) => {
  try {
    const domaine = new Domaine(req.body);
    await domaine.save();
    res.status(201).json({
      success: true,
      message: 'Domaine créé avec succès',
      data: domaine
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création du domaine',
      error: error.message
    });
  }
};

// Obtenir tous les domaines
exports.getDomaines = async (req, res) => {
  try {
    const domaines = await Domaine.find();
    res.status(200).json({
      success: true,
      count: domaines.length,
      data: domaines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des domaines',
      error: error.message
    });
  }
};

// Obtenir un domaine spécifique
exports.getDomaine = async (req, res) => {
  try {
    const domaine = await Domaine.findById(req.params.id);
    if (!domaine) {
      return res.status(404).json({
        success: false,
        message: 'Domaine non trouvé'
      });
    }
    res.status(200).json({
      success: true,
      data: domaine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du domaine',
      error: error.message
    });
  }
};

// Mettre à jour un domaine
exports.updateDomaine = async (req, res) => {
  try {
    const domaine = await Domaine.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!domaine) {
      return res.status(404).json({
        success: false,
        message: 'Domaine non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Domaine mis à jour avec succès',
      data: domaine
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour du domaine',
      error: error.message
    });
  }
};

// Supprimer un domaine
exports.deleteDomaine = async (req, res) => {
  try {
    // Vérifier si des formations sont associées à ce domaine
    const formationsAssociees = await Formation.exists({ domaine: req.params.id });
    
    if (formationsAssociees) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer le domaine car des formations y sont associées'
      });
    }

    const domaine = await Domaine.findByIdAndDelete(req.params.id);

    if (!domaine) {
      return res.status(404).json({
        success: false,
        message: 'Domaine non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Domaine supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du domaine',
      error: error.message
    });
  }
};

// Obtenir les statistiques des domaines
exports.getStatistiquesDomaines = async (req, res) => {
  try {
    const stats = await Formation.aggregate([
      {
        $group: {
          _id: '$domaine',
          nombreFormations: { $sum: 1 },
          nombreParticipants: { $sum: { $size: '$participants' } }
        }
      },
      {
        $lookup: {
          from: 'domaines',
          localField: '_id',
          foreignField: '_id',
          as: 'domaineInfo'
        }
      },
      {
        $unwind: '$domaineInfo'
      },
      {
        $project: {
          nomDomaine: '$domaineInfo.nom',
          nombreFormations: 1,
          nombreParticipants: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};
