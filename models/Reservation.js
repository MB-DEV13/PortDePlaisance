const mongoose = require("mongoose");

/**
 * Schéma Mongoose représentant une réservation d'un catway.
 *
 * @typedef {Object} Reservation
 * @property {Number} catwayNumber - Numéro du catway réservé.
 * @property {String} clientName - Nom du client qui réserve.
 * @property {Date} startDate - Date de début de la réservation.
 * @property {Date} endDate - Date de fin de la réservation.
 * @property {String} [boatName] - Nom du bateau (optionnel).
 * @property {Date} createdAt - Date de création (automatique).
 * @property {Date} updatedAt - Date de dernière mise à jour (automatique).
 */
const reservationSchema = new mongoose.Schema(
  {
    catwayNumber: { type: Number, required: true },
    clientName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    boatName: { type: String },
  },
  { timestamps: true }
);

/**
 * Modèle Mongoose pour les réservations.
 * @type {import("mongoose").Model<Reservation>}
 */
module.exports = mongoose.model("Reservation", reservationSchema);
