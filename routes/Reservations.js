const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router({ mergeParams: true }); // pour récupérer :id catway
const Reservation = require("../models/Reservation");
const Catway = require("../models/Catway");
const authMiddleware = require("../middleware/auth"); // middleware d'authentification

// Appliquer auth à toutes les routes
router.use(authMiddleware);

// GET /catways/:id/reservations - Liste toutes les réservations pour un catway donné
router.get("/", async (req, res) => {
  try {
    const catwayNumber = Number(req.params.id);
    const catwayExists = await Catway.findOne({ catwayNumber });
    if (!catwayExists) {
      return res.status(404).json({ message: "Catway non trouvé" });
    }

    const reservations = await Reservation.find({ catwayNumber });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /catways/:id/reservations/:idReservation - Récupérer une réservation précise
router.get("/:idReservation", async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.idReservation);
    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }
    // Vérifier que la réservation appartient bien au catway demandé
    if (reservation.catwayNumber !== Number(req.params.id)) {
      return res
        .status(400)
        .json({ message: "Réservation ne correspond pas au catway" });
    }
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /catways/:id/reservations - Créer une réservation
router.post(
  "/",
  [
    body("userName").notEmpty().withMessage("Le nom d'utilisateur est requis"),
    body("boatName").notEmpty().withMessage("Le nom du bateau est requis"),
    body("startDate")
      .notEmpty()
      .withMessage("La date de début est requise")
      .isISO8601()
      .toDate()
      .withMessage("La date de début est invalide"),
    body("endDate")
      .notEmpty()
      .withMessage("La date de fin est requise")
      .isISO8601()
      .toDate()
      .withMessage("La date de fin est invalide"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const catwayNumber = Number(req.params.id);
      const catwayExists = await Catway.findOne({ catwayNumber });
      if (!catwayExists) {
        return res.status(404).json({ message: "Catway non trouvé" });
      }

      const { userName, startDate, endDate, boatName } = req.body;

      if (startDate >= endDate) {
        return res.status(400).json({
          message: "La date de début doit être antérieure à la date de fin.",
        });
      }

      const newReservation = new Reservation({
        catwayNumber,
        userName,
        startDate,
        endDate,
        boatName,
      });
      await newReservation.save();

      res.status(201).json(newReservation);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// PUT /catways/:id/reservations/:idReservation - Modifier une réservation
router.put(
  "/:idReservation",
  [
    body("userName")
      .optional()
      .notEmpty()
      .withMessage("Le nom d'utilisateur ne peut pas être vide"),
    body("boatName")
      .optional()
      .notEmpty()
      .withMessage("Le nom du bateau ne peut pas être vide"),
    body("startDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("La date de début est invalide"),
    body("endDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("La date de fin est invalide"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const catwayNumber = Number(req.params.id);
      const catwayExists = await Catway.findOne({ catwayNumber });
      if (!catwayExists) {
        return res.status(404).json({ message: "Catway non trouvé" });
      }

      // Vérifier que la réservation existe et appartient au catway
      const reservation = await Reservation.findById(req.params.idReservation);
      if (!reservation) {
        return res.status(404).json({ message: "Réservation non trouvée" });
      }
      if (reservation.catwayNumber !== catwayNumber) {
        return res
          .status(400)
          .json({ message: "Réservation ne correspond pas au catway" });
      }

      // Si startDate et endDate présents, vérifier startDate < endDate
      if (req.body.startDate && req.body.endDate) {
        if (req.body.startDate >= req.body.endDate) {
          return res.status(400).json({
            message: "La date de début doit être antérieure à la date de fin.",
          });
        }
      }

      // Mettre à jour
      Object.assign(reservation, req.body);
      await reservation.save();

      res.json(reservation);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// DELETE /catways/:id/reservations/:idReservation - Supprimer une réservation
router.delete("/:idReservation", async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.idReservation);
    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }
    if (reservation.catwayNumber !== Number(req.params.id)) {
      return res
        .status(400)
        .json({ message: "Réservation ne correspond pas au catway" });
    }

    await reservation.remove();
    res.json({ message: "Réservation supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
