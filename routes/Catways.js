const express = require("express");
const router = express.Router();
const Catway = require("../models/Catway");

// GET /catways - récupérer tous les catways
router.get("/", async (req, res) => {
  try {
    const catways = await Catway.find();
    res.json(catways);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
