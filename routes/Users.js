const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET /users — afficher tous les utilisateurs
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // ne pas envoyer le mot de passe
    res.render("users", { users });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
});

// POST /users — créer un utilisateur
router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ error: "Email déjà utilisé" });

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res
      .status(201)
      .json({ _id: newUser._id, name: newUser.name, email: newUser.email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /users/:id — modifier un utilisateur (sans modifier mot de passe ici)
router.put("/:id", async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    user.name = name;
    user.email = email;

    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /users/:id — supprimer un utilisateur
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
