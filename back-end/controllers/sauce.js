// on charge le model pour les sauces
const Sauce = require('../models/sauce');

// système de fichiers
const fs = require('fs');

// création d'une nouvelle sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;

  const sauce = new Sauce({
    ...sauceObject,
    // on récupère le segment de l'URL où se trouve l'image (http/https, host, répertoire, nom du fichier)
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  });

  // on sauvegarde la sauce dans la base de données
  sauce.save()
    .then(() => res.status(201).json({ message: 'La nouvelle sauce a été enregistré !' }))
    .catch(error => res.status(400).json({ error }));
};

// modifie une sauce
exports.modifySauce = (req, res, next) => {
  // si l'utilisateur change l'image on efface l'ancienne
  if (req.file) {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        // on récupère le nom du fichier image
        const filename = sauce.imageUrl.split('/images/')[1];
        // supprime l'image
        fs.unlink(`images/${filename}`, function (error) {
          if (error) throw error;
        });
    })
    .catch(error => res.status(500).json({ error }));
  }

  // on remplace l'image de la sauce
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      // on récupère le segment de l'URL où se trouve l'image (http/https, host, répertoire, nom du fichier)
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifié !' }))
    .catch(error => res.status(400).json({ error }));
};

// supprime une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];

      // supprime l'image
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimé !' }))
          .catch(error => res.status(400).json({ error }));
      });
    })

    .catch(error => res.status(500).json({ error }));
};

// récupère une sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

// récupère toutes les sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};