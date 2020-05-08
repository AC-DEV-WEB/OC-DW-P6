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
    usersLiked: new Array(),
    usersDisliked: new Array()
  });

  // on sauvegarde la sauce dans la base de données
  sauce.save()
    .then(() => res.status(201).json({ message: 'La nouvelle sauce a été enregistrée !' }))
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
    .then(() => res.status(200).json({ message: 'La sauce a été modifié !' }))
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
          .then(() => res.status(200).json({ message: 'La sauce a été supprimée !' }))
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

// like/dislike d'une sauce
exports.likeOneSauce = (req, res, next) => {
  const userId = req.body.userId;
  const like = req.body.like;

  // on vérifie si l'utilisateur à déjà noté la sauce
  if (like === 0) {
    Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // on retire le like
      if (sauce.usersLiked.find(user => user === userId)) {
        Sauce.updateOne({ _id: req.params.id }, {
          $inc: { likes: -1 },
          $pull: { usersLiked: userId },
          _id: req.params.id
        })

        .then(() => res.status(201).json({ message: 'L\'utilisateur à retiré son like !' }))
        .catch(error => res.status(400).json({ error }));
      }

      // on retire le dislike
      if (sauce.usersDisliked.find(user => user === userId)) {
        Sauce.updateOne({ _id: req.params.id }, {
          $inc: { dislikes: -1 },
          $pull: { usersDisliked: userId },
          _id: req.params.id
        })

        .then(() => res.status(201).json({ message: 'L\'utilisateur à retirer son dislike !' }))
        .catch(error => res.status(400).json({ error }));
      }
    })

    .catch(error => res.status(500).json({ error }));

  // on vérifie si l'utilisateur like la sauce
  } else if (like === 1) {
    Sauce.updateOne({ _id: req.params.id }, {
      $inc: { likes: 1 },
      $push: { usersLiked: userId },
      _id: req.params.id
    })

    .then(() => res.status(201).json({ message: 'L\'utilisateur à aimé la sauce !' }))
    .catch(error => res.status(400).json({ error }));

  // on vérifie si l'utilisateur dislike la sauce
  } else if (like === -1) {
    Sauce.updateOne({ _id: req.params.id }, {
      $inc: { dislikes: 1 },
      $push: { usersDisliked: userId },
      _id: req.params.id
    })

    .then(() => res.status(201).json({ message: 'L\'utilisateur n\'a pas aimé la sauce !' }))
    .catch(error => res.status(400).json({ error }));
  };
};