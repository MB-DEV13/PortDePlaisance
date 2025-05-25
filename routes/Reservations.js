const express = require("express");
const router = express.Router();
const Reservation = require("../models/Reservation");

// GET /reservations — afficher toutes les réservations
router.get("/", async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.render("reservations", { reservations });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
});

// POST /reservations — créer une réservation
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

// PUT /reservations/:id — modifier une réservation
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

// DELETE /reservations/:id — supprimer une réservation
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
