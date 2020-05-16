// on charge le model pour les sauces
const Sauce = require('../models/sauce');

// système de fichiers
const fs = require('fs');

// création d'une nouvelle sauce
exports.createSauce = (req, res, next) => {
  // on traîte les données du coprs de la requête en objet JavaScript utilisable 
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  
  // on remplace les propriétés HTTP du coprs par une chaîne de caractères filtrée
  const sauceSanitized = {
    name: req.sanitize(sauceObject.name),
    manufacturer: req.sanitize(sauceObject.manufacturer),
    description: req.sanitize(sauceObject.description),
    mainPepper: req.sanitize(sauceObject.mainPepper)
  }

  const sauce = new Sauce({
    ...sauceSanitized,
    userId: sauceObject.userId,
    heat: sauceObject.heat,
    // on récupère le segment de l'URL où se trouve l'image (http/https, host, répertoire, nom du fichier)
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  // on sauvegarde la sauce dans la base de données
  sauce.save()
    .then(() => res.status(201).json({ message: 'La nouvelle sauce a été enregistrée !' }))
    .catch(error => res.status(400).json({ error }));
};

// modifie une sauce
exports.modifySauce = (req, res, next) => {
  let sauceObject
  let sauceSanitized
  let sauceModifiedObject

  // on contrôle s'il y a une nouvelle image
  if (req.file) {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        // on récupère le nom du fichier image
        const filename = sauce.imageUrl.split('/images/')[1];
        
        // on supprime l'ancienne image
        fs.unlink(`images/${filename}`, function (error) {
          if (error) throw error;
        });
    })
    .catch(error => res.status(500).json({ error }));

    // on récupère les informations sur l'objet qui est contenue dans cette partie de la requête
    sauceObject = JSON.parse(req.body.sauce);

    // on filtre les chaînes de caractères
    sauceSanitized = {
      name: req.sanitize(sauceObject.name),
      manufacturer: req.sanitize(sauceObject.manufacturer),
      description: req.sanitize(sauceObject.description),
      mainPepper: req.sanitize(sauceObject.mainPepper)
    }

    // on construit l'objet qui sera mis à jour avec la nouvelle image
    sauceModifiedObject = {
      ...sauceSanitized,
      heat: sauceObject.heat,
      userId: sauceObject.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    }
  } else {
    // on récupère les informations contenue dans la requête
    sauceObject = req.body;

    // on filtre les chaînes de caractères
    sauceSanitized = {
      name: req.sanitize(sauceObject.name),
      manufacturer: req.sanitize(sauceObject.manufacturer),
      description: req.sanitize(sauceObject.description),
      mainPepper: req.sanitize(sauceObject.mainPepper)
    }

    // on construit l'objet qui sera mis à jour avec la même image
    sauceModifiedObject = {
      ...sauceSanitized,
      heat: sauceObject.heat,
      userId: sauceObject.userId
    }
  }
 
  Sauce.updateOne({ _id: req.params.id }, { ...sauceModifiedObject, _id: req.params.id })
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

  // on vérifie si l'utilisateur a déjà noté la sauce
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