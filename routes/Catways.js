const express = require("express");
const router = express.Router();
const Catway = require("../models/Catway");

// GET /catways - Lister tous les catways
router.get("/", async (req, res) => {
  try {
    const catways = await Catway.find();
    res.json(catways);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /catways/:id - Récupérer un catway par numéro
router.get("/:id", async (req, res) => {
  try {
    const catway = await Catway.findOne({
      catwayNumber: Number(req.params.id),
    });
    if (!catway) return res.status(404).json({ message: "Catway non trouvé" });
    res.json(catway);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /catways - Créer un nouveau catway
router.post("/", async (req, res) => {
  try {
    const { catwayNumber, catwayType, catwayState } = req.body;
    const newCatway = new Catway({ catwayNumber, catwayType, catwayState });
    await newCatway.save();
    res.status(201).json(newCatway);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /catways/:id - Modifier l'état d'un catway (seulement catwayState)
router.put("/:id", async (req, res) => {
  try {
    const { catwayState } = req.body;
    const updatedCatway = await Catway.findOneAndUpdate(
      { catwayNumber: Number(req.params.id) },
      { catwayState },
      { new: true }
    );
    if (!updatedCatway)
      return res.status(404).json({ message: "Catway non trouvé" });
    res.json(updatedCatway);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /catways/:id - Supprimer un catway
router.delete("/:id", async (req, res) => {
  try {
    const catway = await Catway.findOneAndDelete({
      catwayNumber: Number(req.params.id),
    });
    if (!catway) return res.status(404).json({ message: "Catway non trouvé" });
    res.json({ message: "Catway supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
