// package express
const express = require('express');

// création d'un routeur
const router = express.Router();

// importations des middleware d'authentification et de gestion des images
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// contrôleur pour associer la route sauce
const sauceCtrl = require('../controllers/sauce');

// routes de l'API pour les sauces avec les middlewares en vérifiant d'abord l'authentification
router.post('/', auth, multer, sauceCtrl.createSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.get('/', auth, sauceCtrl.getAllSauces);
router.post('/:id/like', auth, sauceCtrl.likeOneSauce);

// on exporte le router pour les sauces
module.exports = router;