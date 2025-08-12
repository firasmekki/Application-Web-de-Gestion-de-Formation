const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log pour le développeur
  console.log(err);

  // Erreur MongoDB - Mauvais ObjectId
  if (err.name === 'CastError') {
    const message = `Ressource non trouvée`;
    error = { message, statusCode: 404 };
  }

  // Erreur MongoDB - Champ requis
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  // Erreur MongoDB - Doublon
  if (err.code === 11000) {
    const message = 'Valeur en doublon entrée';
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erreur serveur'
  });
};

module.exports = errorHandler;
