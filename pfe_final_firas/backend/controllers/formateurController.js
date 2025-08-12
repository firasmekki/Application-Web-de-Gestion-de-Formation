const asyncHandler = require('express-async-handler');
const Formation = require('../models/Formation');
const User = require('../models/User');

// @desc    Get all formations for a formateur
// @route   GET /api/formateur/formations
// @access  Private/Formateur
const getFormations = asyncHandler(async (req, res) => {
    try {
        const formations = await Formation.find({ formateur: req.user._id })
            .populate('participants', 'nom prenom email')
            .populate('formateur', 'nom prenom email')
            .populate('domaine', 'nom description')
            .sort('-createdAt');
        
        res.json({
            success: true,
            data: formations
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des formations:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la récupération des formations',
            error: error.message 
        });
    }
});

// @desc    Create a new formation
// @route   POST /api/formateur/formations
// @access  Private/Formateur
const createFormation = asyncHandler(async (req, res) => {
    console.log('createFormation: Données reçues:', req.body);
    const {
        titre,
        description,
        dateDebut,
        dateFin,
        duree,
        capaciteMax,
        domaine,
        niveau,
        prerequis,
        objectifs,
        contenu,
        modalites,
        lieu,
        lienVisio,
        evaluation
    } = req.body;

    const formation = await Formation.create({
        titre,
        description,
        dateDebut,
        dateFin,
        duree,
        capaciteMax,
        domaine,
        niveau,
        prerequis,
        objectifs,
        contenu,
        modalites,
        lieu,
        lienVisio,
        evaluation,
        formateur: req.user._id,
        statut: 'en_attente'
    });

    const populatedFormation = await formation.populate([
        { path: 'formateur', select: 'nom prenom email' },
        { path: 'participants', select: 'nom prenom email' }
    ]);

    res.status(201).json({
        success: true,
        data: populatedFormation
    });
});

// @desc    Get formation by ID
// @route   GET /api/formateur/formations/:id
// @access  Private/Formateur
const getFormationById = asyncHandler(async (req, res) => {
    console.log('getFormationById: ID demandé:', req.params.id);
    console.log('getFormationById: Utilisateur:', req.user._id);
    const formation = await Formation.findOne({
        _id: req.params.id,
        formateur: req.user._id
    })
    .populate('participants', 'nom prenom email')
    .populate('formateur', 'nom prenom email');

    if (!formation) {
        console.log('getFormationById: Formation non trouvée');
        res.status(404);
        throw new Error('Formation non trouvée');
    }

    console.log('getFormationById: Formation trouvée:', formation._id);
    res.json({
        success: true,
        data: formation
    });
});

// @desc    Update formation
// @route   PUT /api/formateur/formations/:id
// @access  Private/Formateur
const updateFormation = asyncHandler(async (req, res) => {
    const formation = await Formation.findOne({
        _id: req.params.id,
        formateur: req.user._id
    });

    if (!formation) {
        res.status(404);
        throw new Error('Formation non trouvée');
    }

    if (formation.statut === 'termine' || formation.statut === 'annule') {
        res.status(400);
        throw new Error('Impossible de modifier une formation terminée ou annulée');
    }

    const updatedFormation = await Formation.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true, runValidators: true }
    )
    .populate('participants', 'nom prenom email')
    .populate('formateur', 'nom prenom email');

    res.json({
        success: true,
        data: updatedFormation
    });
});

// @desc    Delete formation
// @route   DELETE /api/formateur/formations/:id
// @access  Private/Formateur
const deleteFormation = asyncHandler(async (req, res) => {
    const formation = await Formation.findOne({
        _id: req.params.id,
        formateur: req.user._id
    });

    if (!formation) {
        res.status(404);
        throw new Error('Formation non trouvée');
    }

    if (formation.statut === 'termine') {
        res.status(400);
        throw new Error('Impossible de supprimer une formation terminée');
    }

    // Update formation status to 'annule' instead of deleting
    formation.statut = 'annule';
    formation.motifAnnulation = req.body.motif;
    await formation.save();

    res.json({ 
        success: true,
        message: 'Formation annulée avec succès' 
    });
});

// @desc    Update formateur profile
// @route   PUT /api/formateur/profil
// @access  Private/Formateur
const updateProfile = asyncHandler(async (req, res) => {
    const {
        nom,
        prenom,
        telephone,
        expertise,
        certifications,
        biographie
    } = req.body;

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            nom,
            prenom,
            telephone,
            expertise,
            certifications,
            biographie,
            derniereMiseAJour: new Date()
        },
        { new: true, runValidators: true }
    );

    if (!updatedUser) {
        res.status(404);
        throw new Error('Utilisateur non trouvé');
    }

    res.json({
        success: true,
        data: updatedUser
    });
});

// @desc    Get formateur statistics
// @route   GET /api/formateur/statistics
// @access  Private/Formateur
const getStatistics = asyncHandler(async (req, res) => {
    const totalFormations = await Formation.countDocuments({ formateur: req.user._id });
    const formationsEnCours = await Formation.countDocuments({ 
        formateur: req.user._id,
        statut: 'en_cours'
    });
    const formationsTerminees = await Formation.countDocuments({ 
        formateur: req.user._id,
        statut: 'termine'
    });
    const formationsAVenir = await Formation.countDocuments({ 
        formateur: req.user._id,
        statut: 'approuve',
        dateDebut: { $gt: new Date() }
    });

    // Get total participants across all formations
    const formations = await Formation.find({ formateur: req.user._id });
    const totalParticipants = formations.reduce((acc, formation) => 
        acc + formation.participants.length, 0
    );

    // Calculate average rating
    const formationsAvecEvaluations = formations.filter(f => f.evaluations && f.evaluations.length > 0);
    const moyenneEvaluations = formationsAvecEvaluations.length > 0
        ? formationsAvecEvaluations.reduce((acc, f) => {
            const moyenneFormation = f.evaluations.reduce((sum, e) => sum + e.note, 0) / f.evaluations.length;
            return acc + moyenneFormation;
        }, 0) / formationsAvecEvaluations.length
        : 0;

    res.json({
        success: true,
        data: {
            totalFormations,
            formationsEnCours,
            formationsTerminees,
            formationsAVenir,
            totalParticipants,
            moyenneEvaluations: Math.round(moyenneEvaluations * 10) / 10
        }
    });
});

module.exports = {
    getFormations,
    createFormation,
    getFormationById,
    updateFormation,
    deleteFormation,
    updateProfile,
    getStatistics
};
