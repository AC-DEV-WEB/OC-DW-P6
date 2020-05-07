// package mongoose
const mongoose = require('mongoose');

// package mongoose-unique-validator
const uniqueValidator = require('mongoose-unique-validator');

// schéma contenant l'objet pour la base de données des utilisateurs
const userSchema = mongoose.Schema({
  // l'argument <unique> va s'assurer que les utilisateurs ne peuvent pas partager la même adresse email
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// on applique le plugin de la validation unique au schéma
userSchema.plugin(uniqueValidator);

// on exporte le model avec le nom du model et le schéma utilisé
module.exports = mongoose.model('User', userSchema);