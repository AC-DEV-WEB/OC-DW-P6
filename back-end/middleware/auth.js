// package pour la gestion des tokens
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // on récupère le token dans le header authorization
    const token = req.headers.authorization.split(' ')[1];
    // on décode le token avec la clé secrète
    const decodedToken = jwt.verify(token, 'FBAE9915A729A8A6895CE25C13BBE');
    // on récupère l'user ID décodé
    const userId = decodedToken.userId;

    // on vérifie si l'user ID est différent du coprs de la requête
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Identifiant non valable !';
    } else {
      next();
    }
  } catch (error) {
    res.status(401).json({ error: error | 'Requête non authentifiée !' });
  }
};