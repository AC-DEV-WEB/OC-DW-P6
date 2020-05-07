// package pour la gestion des images
const multer = require('multer');

// dictionnaire des extensions d'images
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// configuration de multer
const storage = multer.diskStorage({
  // on configure la destination des images qui seront enregistrés
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  // on configure les extensions d'images acceptés
  filename: (req, file, callback) => {
    // on supprime les espaces contenue dans le nom des fichiers
    const name = file.originalname.split(' ').join('_');
    // on applique l'extension au fichier
    const extension = MIME_TYPES[file.mimetype];
    // on génère un nom de fichier avec la suppression des espaces + la date du jour et l'extension du fichier
    callback(null, name + Date.now() + '.' + extension);
  }
});

// on exporte le middleware en spécifiant qu'il s'agit d'un fichier image et unique à multer
module.exports = multer({ storage }).single('image');