const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-motDePasse');

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

// Admin only middleware
const adminOnly = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.role === 'administrateur') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as an admin');
    }
});

// Formateur only middleware
const formateurOnly = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.role === 'formateur') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as a formateur');
    }
});

// Participant only middleware
const participantOnly = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.role === 'participant') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as a participant');
    }
});

// Admin or Formateur middleware
const adminOrFormateur = asyncHandler(async (req, res, next) => {
    if (req.user && (req.user.role === 'administrateur' || req.user.role === 'formateur')) {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized');
    }
});

module.exports = {
    protect,
    adminOnly,
    formateurOnly,
    participantOnly,
    adminOrFormateur
};
