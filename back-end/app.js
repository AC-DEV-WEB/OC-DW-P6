// package express
const express = require('express');

// package body-parser
const bodyParser = require('body-parser');

// package express-sanitizer
const expressSanitizer = require('express-sanitizer');

// package mongoose
const mongoose = require('mongoose');

// accès aux répertoires
const path = require('path');

// déclaration des routes pour les sauces et l'authentification
const saucesRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

// fix collection.ensureIndex (https://stackoverflow.com/questions/51960171/node63208-deprecationwarning-collection-ensureindex-is-deprecated-use-creat)
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// connection à la base de données MongoDB
mongoose.connect('mongodb+srv://ac-dev-web:jk3xvksPO4NEyJAl@openclassrooms-mcasp.mongodb.net/piquante?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connection to MongoDB successful!'))
  .catch(() => console.log('Connection to MongoDB failed!'));

// on créé l'appilcation express
const app = express();

// middleware qui permet l'accès à toutes les origines d'accéder à l'API (CORS) 
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// middleware qui traîte les données du coprs de la requête en objet JavaScript utilisable
app.use(bodyParser.json());

// middleware qui filtre les chaînes de caractères pour empêcher l’exécution de code JavaScript (XSS)
app.use(expressSanitizer());

// middleware qui définit le chemin static du répertoire des images 
app.use('/images', express.static(path.join(__dirname, 'images')));

// middleware qui définit la route des sauces
app.use('/api/sauces', saucesRoutes);

// middleware qui définit la route pour l'authentification
app.use('/api/auth', userRoutes);

// on exporte express
module.exports = app;