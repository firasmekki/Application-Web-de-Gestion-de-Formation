const Notification = require('../models/Notification');

// Créer une nouvelle notification
exports.creerNotification = async (req, res) => {
  try {
    const notification = await Notification.creerNotification(req.body);
    res.status(201).json({
      success: true,
      message: 'Notification créée avec succès',
      data: notification
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création de la notification',
      error: error.message
    });
  }
};

// Obtenir les notifications d'un utilisateur
exports.getNotificationsUtilisateur = async (req, res) => {
  try {
    const notifications = await Notification.find({ destinataire: req.user._id })
      .sort({ dateCreation: -1 })
      .limit(parseInt(req.query.limit) || 50);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications',
      error: error.message
    });
  }
};

// Obtenir les notifications non lues d'un utilisateur
exports.getNotificationsNonLues = async (req, res) => {
  try {
    const notifications = await Notification.getNonLues(req.user._id);
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications non lues',
      error: error.message
    });
  }
};

// Marquer une notification comme lue
exports.marquerCommeLue = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        destinataire: req.user._id
      },
      { lu: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marquée comme lue',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la notification',
      error: error.message
    });
  }
};

// Marquer toutes les notifications comme lues
exports.marquerToutesCommeLues = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        destinataire: req.user._id,
        lu: false
      },
      { lu: true }
    );

    res.status(200).json({
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des notifications',
      error: error.message
    });
  }
};

// Supprimer une notification
exports.supprimerNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      destinataire: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la notification',
      error: error.message
    });
  }
};
