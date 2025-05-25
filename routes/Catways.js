const express = require("express");
const { body, validationResult, param } = require("express-validator");
const router = express.Router();
const Catway = require("../models/Catway");
const authMiddleware = require("../middlewares/auth");

// Appliquer auth à toutes les routes catways
router.use(authMiddleware);

/**
 * Affiche la page EJS avec la liste des catways.
 * @route GET /catways
 * @group Catways
 * @returns {HTML} 200 - Page HTML rendue avec la liste des catways
 * @returns {Error} 500 - Erreur serveur
 */
router.get("/", async (req, res) => {
  try {
    const catways = await Catway.find();
    res.render("catways", { catways, title: "Gestion des Catways" });
  } catch (error) {
    res.status(500).send("Erreur serveur");
  }
});

/**
 * Récupère un catway par son numéro.
 * @route GET /catways/{id}
 * @group Catways
 * @param {number} id.path.required - Numéro du catway
 * @returns {object} 200 - Objet catway
 * @returns {Error} 400 - ID invalide
 * @returns {Error} 404 - Catway non trouvé
 * @returns {Error} 500 - Erreur serveur
 */
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

/**
 * Crée un nouveau catway.
 * @route POST /catways
 * @group Catways
 * @param {integer} catwayNumber.body.required - Numéro du catway
 * @param {string} catwayType.body.required - Type du catway (long, short)
 * @param {string} catwayState.body.required - État du catway
 * @returns {object} 201 - Objet catway créé
 * @returns {Error} 400 - Données invalides ou numéro déjà existant
 * @returns {Error} 500 - Erreur serveur
 */
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

/**
 * Met à jour l'état d’un catway existant.
 * @route PUT /catways/{id}
 * @group Catways
 * @param {number} id.path.required - Numéro du catway à modifier
 * @param {string} catwayState.body.required - Nouvel état du catway
 * @returns {object} 200 - Catway mis à jour
 * @returns {Error} 400 - Données invalides
 * @returns {Error} 404 - Catway non trouvé
 * @returns {Error} 500 - Erreur serveur
 */
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

/**
 * Supprime un catway.
 * @route DELETE /catways/{id}
 * @group Catways
 * @param {number} id.path.required - Numéro du catway à supprimer
 * @returns {object} 200 - Message de confirmation
 * @returns {Error} 400 - ID invalide
 * @returns {Error} 404 - Catway non trouvé
 * @returns {Error} 500 - Erreur serveur
 */
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
