const mongoose = require("mongoose");

/**
 * Schéma Mongoose représentant un Catway (quai ou poste d'amarrage).
 *
 * @typedef {Object} Catway
 * @property {Number} catwayNumber - Numéro unique du catway.
 * @property {"long"|"short"} catwayType - Type du catway (long ou court).
 * @property {String} catwayState - État actuel du catway.
 * @property {Date} createdAt - Date de création (générée automatiquement).
 * @property {Date} updatedAt - Date de dernière mise à jour (générée automatiquement).
 */
const catwaySchema = new mongoose.Schema(
  {
    catwayNumber: { type: Number, required: true, unique: true },
    catwayType: { type: String, enum: ["long", "short"], required: true },
    catwayState: { type: String, required: true },
  },
  { timestamps: true }
);

/**
 * Modèle Mongoose pour les catways.
 * @type {import("mongoose").Model<Catway>}
 */
module.exports = mongoose.model("Catway", catwaySchema);
