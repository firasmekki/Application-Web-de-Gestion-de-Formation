const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Chat = require('../models/Chat'); // Assuming Chat model is defined in a separate file
const path = require('path');
const fs = require('fs');

// Obtenir tous les utilisateurs
exports.getUtilisateurs = async (req, res) => {
  try {
    const utilisateurs = await User.find().select('-motDePasse');
    res.status(200).json({
      success: true,
      count: utilisateurs.length,
      data: utilisateurs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

// Obtenir un utilisateur spécifique
exports.getUtilisateur = async (req, res) => {
  try {
    const utilisateur = await User.findById(req.params.id).select('-motDePasse');
    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    res.status(200).json({
      success: true,
      data: utilisateur
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error.message
    });
  }
};

// Mettre à jour un utilisateur
exports.updateUtilisateur = async (req, res) => {
  try {
    const utilisateur = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-motDePasse');

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: utilisateur
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'utilisateur',
      error: error.message
    });
  }
};

// Supprimer un utilisateur
exports.deleteUtilisateur = async (req, res) => {
  try {
    const utilisateur = await User.findByIdAndDelete(req.params.id);

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: error.message
    });
  }
};

// Obtenir le profil de l'utilisateur connecté
exports.getProfile = async (req, res) => {
  try {
    const utilisateur = await User.findById(req.user._id).select('-motDePasse');
    res.status(200).json({
      success: true,
      data: utilisateur
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
};

// Mettre à jour le profil
exports.updateProfile = async (req, res) => {
  try {
    console.log('Update Profile Request Body:', req.body);
    console.log('Update Profile Request File:', req.file);
    
    // Extract fields explicitly
    const updateData = {
      nom: req.body.nom,
      prenom: req.body.prenom,
      email: req.body.email,
      telephone: req.body.telephone || '',
      adresse: req.body.adresse || ''
    };

    // Handle photo if it exists
    if (req.file) {
      // Delete old photo if it exists and is not the default photo
      const currentUser = await User.findById(req.user._id);
      if (currentUser.photo && currentUser.photo !== 'default.jpg') {
        const oldPhotoPath = path.join(__dirname, '..', 'uploads', currentUser.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      updateData.photo = req.file.filename;
    }

    console.log('Update Data to be applied:', updateData);

    const utilisateur = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).select('-motDePasse');

    console.log('Updated User:', utilisateur);

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: utilisateur
    });
  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message
    });
  }
};

// Mettre à jour la photo de profil
exports.updatePhoto = async (req, res) => {
  try {
    console.log('Update Photo Request:', req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucune photo n\'a été téléchargée'
      });
    }

    // Delete old photo if it exists and is not the default photo
    const currentUser = await User.findById(req.user._id);
    if (currentUser.photo && currentUser.photo !== 'default.jpg') {
      const oldPhotoPath = path.join(__dirname, '..', 'uploads', currentUser.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    const utilisateur = await User.findByIdAndUpdate(
      req.user._id,
      { photo: req.file.filename },
      {
        new: true,
        runValidators: true
      }
    ).select('-motDePasse');

    if (!utilisateur) {
      // Delete uploaded file if user not found
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: utilisateur
    });
  } catch (error) {
    console.error('Photo Update Error:', error);
    // Delete uploaded file if there's an error
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la photo',
      error: error.message
    });
  }
};

// Mettre à jour le mot de passe
exports.updateMotDePasse = async (req, res) => {
  try {
    const utilisateur = await User.findById(req.user._id).select('+motDePasse');
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    // Vérifier l'ancien mot de passe
    const isMatch = await bcrypt.compare(ancienMotDePasse, utilisateur.motDePasse);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    // Hasher et enregistrer le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    utilisateur.motDePasse = await bcrypt.hash(nouveauMotDePasse, salt);
    await utilisateur.save();

    res.status(200).json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour du mot de passe',
      error: error.message
    });
  }
};

// Obtenir la liste des participants
exports.getParticipants = async (req, res) => {
  try {
    console.log('Getting participants for user:', req.user._id);
    
    // Récupérer tous les participants sauf l'utilisateur courant
    const participants = await User.find({ 
      _id: { $ne: req.user._id },
      role: 'participant'
    })
    .select('nom prenom email photo isOnline lastSeen')
    .lean();

    console.log('Found participants:', participants.length);

    // Récupérer les chats existants pour l'utilisateur
    const chats = await Chat.find({
      participants: req.user._id,
      type: 'individuel'
    })
    .select('participants messages')
    .lean();

    console.log('Found chats:', chats.length);

    // Ajouter les informations de dernier message pour chaque participant
    const participantsWithInfo = participants.map(participant => {
      // Trouver le chat avec ce participant
      const chat = chats.find(c => 
        c.participants.some(p => p.toString() === participant._id.toString())
      );

      // Récupérer le dernier message s'il existe
      const lastMessage = chat?.messages?.length > 0 
        ? chat.messages[chat.messages.length - 1]
        : null;

      return {
        ...participant,
        isOnline: participant.isOnline || false,
        lastMessage: lastMessage ? {
          contenu: lastMessage.contenu,
          dateCreation: lastMessage.dateCreation,
          isOwnMessage: lastMessage.expediteur.toString() === req.user._id.toString()
        } : null
      };
    });

    console.log('Final participants:', participantsWithInfo.length);

    res.status(200).json({
      success: true,
      data: participantsWithInfo
    });
  } catch (error) {
    console.error('Error getting participants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des participants',
      error: error.message
    });
  }
};

// Obtenir les statistiques de l'utilisateur
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vous pouvez personnaliser les statistiques selon vos besoins
    const stats = {
      dateInscription: user.dateCreation,
      dernièreConnexion: user.lastSeen,
      estEnLigne: user.isOnline,
      role: user.role,
      // Ajoutez d'autres statistiques selon vos besoins
    };

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

// Mettre à jour le statut d'un utilisateur
exports.updateStatut = async (req, res) => {
  try {
    const { statut } = req.body;

    // Vérifier que le statut est valide
    if (!['actif', 'inactif', 'en_attente'].includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    const utilisateur = await User.findByIdAndUpdate(
      req.params.id,
      { statut },
      {
        new: true,
        runValidators: true
      }
    ).select('-motDePasse');

    if (!utilisateur) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: utilisateur
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors du changement de statut',
      error: error.message
    });
  }
};
