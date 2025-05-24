const express = require("express");
const { body, validationResult, param } = require("express-validator");
const router = express.Router();
const Catway = require("../models/Catway");
const authMiddleware = require("../middlewares/auth");

// Appliquer auth à toutes les routes catways
router.use(authMiddleware);

// GET /catways - Liste tous les catways
router.get("/", async (req, res) => {
  try {
    const catways = await Catway.find();
    res.json(catways);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /catways/:id - Récupérer un catway par son numéro
router.get(
  "/:id",
  param("id").isInt({ min: 1 }).withMessage("L'id doit être un entier positif"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const catway = await Catway.findOne({
        catwayNumber: Number(req.params.id),
      });
      if (!catway) {
        return res.status(404).json({ message: "Catway non trouvé" });
      }
      res.json(catway);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// POST /catways - Créer un nouveau catway
router.post(
  "/",
  [
    body("catwayNumber")
      .isInt({ min: 1 })
      .withMessage("Le numéro de catway doit être un entier positif"),
    body("catwayType")
      .notEmpty()
      .withMessage("Le type de catway est requis")
      .isIn(["long", "short"])
      .withMessage("Le type doit être 'long' ou 'short'"),
    body("catwayState").notEmpty().withMessage("L'état du catway est requis"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      // Vérifier unicité du numéro
      const exists = await Catway.findOne({
        catwayNumber: req.body.catwayNumber,
      });
      if (exists) {
        return res
          .status(400)
          .json({ message: "Un catway avec ce numéro existe déjà" });
      }

      const newCatway = new Catway({
        catwayNumber: req.body.catwayNumber,
        catwayType: req.body.catwayType,
        catwayState: req.body.catwayState,
      });

      await newCatway.save();
      res.status(201).json(newCatway);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// PUT /catways/:id - Modifier uniquement l'état du catway (numéro et type non modifiables)
router.put(
  "/:id",
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("L'id doit être un entier positif"),
    body("catwayState").notEmpty().withMessage("L'état du catway est requis"),
    body("catwayNumber")
      .optional()
      .custom(() => {
        throw new Error("La modification du numéro de catway est interdite");
      }),
    body("catwayType")
      .optional()
      .custom(() => {
        throw new Error("La modification du type de catway est interdite");
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const catway = await Catway.findOne({
        catwayNumber: Number(req.params.id),
      });
      if (!catway) {
        return res.status(404).json({ message: "Catway non trouvé" });
      }

      catway.catwayState = req.body.catwayState;
      await catway.save();
      res.json(catway);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// DELETE /catways/:id - Supprimer un catway
router.delete(
  "/:id",
  param("id").isInt({ min: 1 }).withMessage("L'id doit être un entier positif"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const catway = await Catway.findOneAndDelete({
        catwayNumber: Number(req.params.id),
      });
      if (!catway) {
        return res.status(404).json({ message: "Catway non trouvé" });
      }
      res.json({ message: "Catway supprimé avec succès" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
