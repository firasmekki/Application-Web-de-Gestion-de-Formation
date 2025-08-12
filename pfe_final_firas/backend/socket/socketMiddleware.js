const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.log('No token provided');
      return next(new Error('Authentication error: No token provided'));
    }

    const tokenParts = token.split(' ');
    const actualToken = tokenParts[1] || tokenParts[0];

    try {
      const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
      if (!decoded || !decoded.id) {
        console.log('Invalid token payload:', decoded);
        return next(new Error('Invalid token'));
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        console.log('User not found for id:', decoded.id);
        return next(new Error('User not found'));
      }

      socket.userId = decoded.id;
      socket.user = {
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        photo: user.photo
      };

      next();
    } catch (jwtError) {
      console.log('JWT verification error:', jwtError);
      return next(new Error('Invalid token'));
    }
  } catch (error) {
    console.log('Socket middleware error:', error);
    return next(new Error('Authentication error'));
  }
};

module.exports = socketAuthMiddleware;
