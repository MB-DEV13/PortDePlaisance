const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/**
 * Schéma Mongoose représentant un utilisateur.
 *
 * @typedef {Object} User
 * @property {string} email - Email unique de l'utilisateur, stocké en minuscules.
 * @property {string} name - Nom complet de l'utilisateur.
 * @property {string} password - Mot de passe hashé de l'utilisateur.
 * @property {"admin"|"user"} role - Rôle de l'utilisateur, "user" par défaut.
 * @property {Date} createdAt - Date de création (automatique).
 * @property {Date} updatedAt - Date de dernière mise à jour (automatique).
 */
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true }
);

/**
 * Middleware Mongoose exécuté avant la sauvegarde d'un utilisateur.
 * Si le mot de passe est modifié, le hash avec bcrypt est généré.
 *
 * @param {function(Error=): void} next - Fonction callback pour passer au middleware suivant.
 * @returns {Promise<void>}
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Méthode d'instance pour comparer un mot de passe en clair avec le hash stocké.
 *
 * @param {string} candidatePassword - Mot de passe à vérifier.
 * @returns {Promise<boolean>} Retourne true si les mots de passe correspondent, false sinon.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Modèle Mongoose pour les utilisateurs.
 * @type {import("mongoose").Model<User>}
 */
module.exports = mongoose.model("User", userSchema);
