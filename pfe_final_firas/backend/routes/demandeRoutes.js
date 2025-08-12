const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Demande = require('../models/Demande');
const User = require('../models/User');
const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');

// Configuration email
const envoyerEmail = async (destinataire, sujet, contenu) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    const mailOptions = {
      from: {
        name: 'Formation Platforme',
        address: process.env.EMAIL_USER
      },
      to: destinataire,
      subject: sujet,
      html: contenu
    };

    await transporter.sendMail(mailOptions);
    console.log('Email de confirmation envoyé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
  }
};

// Protect all routes
router.use(protect);
router.use(authorize('administrateur'));

// Get all demandes
router.get('/', async (req, res) => {
  try {
    const demandes = await Demande.find()
      .populate('utilisateur', 'nom prenom email')
      .sort('-dateCreation');
    
    res.json({
      success: true,
      data: demandes
    });
  } catch (error) {
    console.error('Erreur GET /demandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des demandes',
      error: error.message
    });
  }
});

// Traiter une demande (accepter/refuser)
router.put('/:id', async (req, res) => {
  try {
    console.log('Traitement demande - ID:', req.params.id);
    console.log('Body reçu:', req.body);

    const { statut } = req.body;
    if (!statut || !['acceptee', 'refusee'].includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide. Doit être "acceptee" ou "refusee"'
      });
    }

    console.log('Recherche de la demande...');
    const demande = await Demande.findById(req.params.id);
    console.log('Demande trouvée:', demande);

    if (!demande) {
      return res.status(404).json({
        success: false,
        message: 'Demande non trouvée'
      });
    }

    console.log('Recherche de l\'utilisateur...');
    const user = await User.findById(demande.utilisateur);
    console.log('Utilisateur trouvé:', user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur associé non trouvé'
      });
    }

    // Mise à jour de la demande
    demande.statut = statut;
    demande.dateTraitement = Date.now();
    console.log('Sauvegarde de la demande...');
    await demande.save();

    if (statut === 'acceptee') {
      console.log('Mise à jour du statut utilisateur...');
      await User.findByIdAndUpdate(user._id, {
        statut: 'actif'
      });

      console.log('Création de la notification...');
      await Notification.create({
        utilisateur: user._id,
        type: 'demande_acceptee',
        message: 'Votre demande d\'inscription a été acceptée',
        lue: false
      });

      // Email de confirmation
      const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4A90E2; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 10px 20px; background-color: #4A90E2; color: white; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue sur Formation Platforme</h1>
            </div>
            <div class="content">
              <h2>Félicitations ${user.prenom} ${user.nom} !</h2>
              <p>Votre demande d'inscription a été acceptée. Vous pouvez maintenant accéder à votre compte sur Formation Platforme.</p>
              <p>Connectez-vous dès maintenant pour :</p>
              <ul>
                <li>Explorer notre catalogue de formations</li>
                <li>Vous inscrire à des sessions</li>
                <li>Suivre votre progression</li>
              </ul>
              <p style="text-align: center; margin-top: 20px;">
                <a href="${process.env.FRONTEND_URL}/connexion" class="button">Se connecter</a>
              </p>
            </div>
            <div class="footer">
              <p>Cordialement,<br>L'équipe Formation Platforme</p>
            </div>
          </div>
        </body>
        </html>
      `;

      console.log('Envoi de l\'email de confirmation...');
      await envoyerEmail(
        user.email,
        'Votre compte Formation Platforme est activé !',
        emailContent
      );
    } else if (statut === 'refusee') {
      const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4A90E2; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Formation Platforme</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${user.prenom} ${user.nom},</h2>
              <p>Nous avons examiné votre demande d'inscription à Formation Platforme.</p>
              <p>Malheureusement, nous ne pouvons pas donner suite à votre demande pour le moment.</p>
              <p>Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez plus d'informations, n'hésitez pas à nous contacter.</p>
            </div>
            <div class="footer">
              <p>Cordialement,<br>L'équipe Formation Platforme</p>
            </div>
          </div>
        </body>
        </html>
      `;

      console.log('Envoi de l\'email de refus...');
      await envoyerEmail(
        user.email,
        'Mise à jour de votre demande d\'inscription',
        emailContent
      );
    }

    console.log('Opération terminée avec succès');
    res.json({
      success: true,
      message: `Demande ${statut === 'acceptee' ? 'acceptée' : 'refusée'} avec succès`,
      data: demande
    });
  } catch (error) {
    console.error('Erreur détaillée:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement de la demande',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
