// package express
const express = require('express');

// création d'un routeur
const router = express.Router();

// contrôleur pour associer la route user
const userCtrl = require('../controllers/user');

// routes de l'API pour la gestion des utilisateurs
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

// on exporte le router pour l'authentification
module.exports = router;