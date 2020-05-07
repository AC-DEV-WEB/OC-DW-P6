// package de cryptage
const bcrypt = require('bcrypt');

// on charge le model pour les utilisateurs
const User = require('../models/user');

// package pour la gestion des tokens
const jwt = require('jsonwebtoken');

// enregistrement des nouveaux utilisateurs
exports.signup = (req, res, next) => {
  // on hash le mot de passe et on le sale 10 fois
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      
      // on sauvegarde l'utilisateur
      user.save()
      .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
      .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

// connexion des utilisateurs existant
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }

      // on compare l'utilisateur déjà enregistré avec celui qui se connecte
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          // si ce n'est pas valable on retourne une erreur
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }

          // sinon on renvoie l'utilisateur avec son token d'authentification
          res.status(200).json({
            userId: user._id,
            // on encode les données à l'intérieur du token avec une clé secrète
            token: jwt.sign(
              { userId: user._id },
              'FBAE9915A729A8A6895CE25C13BBE',
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};