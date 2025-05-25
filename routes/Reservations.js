const express = require("express");
const router = express.Router();
const Reservation = require("../models/Reservation");

/**
 * Affiche toutes les réservations sous forme de page EJS.
 * @route GET /reservations
 * @group Réservations
 * @returns {HTML} 200 - Page HTML contenant toutes les réservations
 * @returns {Error} 500 - Erreur serveur
 */
router.get("/", async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.render("reservations", { reservations });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
});

/**
 * Crée une nouvelle réservation.
 * @route POST /reservations
 * @group Réservations
 * @param {number} catwayNumber.body.required - Numéro du catway réservé
 * @param {string} clientName.body.required - Nom du client
 * @param {string} boatName.body.required - Nom du bateau
 * @param {string} startDate.body.required - Date de début de la réservation
 * @param {string} endDate.body.required - Date de fin de la réservation
 * @returns {object} 201 - Réservation créée
 * @returns {Error} 400 - Données invalides ou erreur de création
 */
router.post("/", async (req, res) => {
  try {
    const { catwayNumber, clientName, boatName, startDate, endDate } = req.body;
    console.log("Données reçues pour création:", req.body);
    const newReservation = new Reservation({
      catwayNumber,
      clientName,
      boatName,
      startDate,
      endDate,
    });
    await newReservation.save();
    res.status(201).json(newReservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Met à jour une réservation existante par son ID.
 * @route PUT /reservations/{id}
 * @group Réservations
 * @param {string} id.path.required - ID MongoDB de la réservation à modifier
 * @param {number} catwayNumber.body.optional - Nouveau numéro de catway
 * @param {string} clientName.body.optional - Nouveau nom du client
 * @param {string} boatName.body.optional - Nouveau nom du bateau
 * @param {string} startDate.body.optional - Nouvelle date de début
 * @param {string} endDate.body.optional - Nouvelle date de fin
 * @returns {object} 200 - Réservation mise à jour
 * @returns {Error} 400 - Données invalides
 * @returns {Error} 404 - Réservation non trouvée
 */
router.put("/:id", async (req, res) => {
  try {
    const { catwayNumber, clientName, boatName, startDate, endDate } = req.body;
    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { catwayNumber, clientName, boatName, startDate, endDate },
      { new: true }
    );
    if (!updatedReservation)
      return res.status(404).json({ error: "Réservation non trouvée" });
    res.json(updatedReservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Supprime une réservation par son ID.
 * @route DELETE /reservations/{id}
 * @group Réservations
 * @param {string} id.path.required - ID MongoDB de la réservation à supprimer
 * @returns {object} 200 - Message de confirmation de suppression
 * @returns {Error} 404 - Réservation non trouvée
 * @returns {Error} 500 - Erreur serveur
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Reservation.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ error: "Réservation non trouvée" });
    res.json({ message: "Réservation supprimée" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
