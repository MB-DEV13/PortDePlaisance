const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

/**
 * Affiche tous les utilisateurs (hors mot de passe).
 * @route GET /users
 * @group Utilisateurs
 * @returns {HTML} 200 - Page HTML contenant la liste des utilisateurs
 * @returns {Error} 500 - Erreur serveur
 */
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.render("users", { users });
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
});

/**
 * Crée un nouvel utilisateur.
 * @route POST /users
 * @group Utilisateurs
 * @param {string} name.body.required - Nom de l'utilisateur
 * @param {string} email.body.required - Email de l'utilisateur (doit être unique)
 * @param {string} password.body.required - Mot de passe à hasher
 * @returns {object} 201 - Utilisateur créé (hors mot de passe)
 * @returns {Error} 400 - Erreur de validation ou email déjà utilisé
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ error: "Email déjà utilisé" });

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

/**
 * Met à jour un utilisateur (hors mot de passe).
 * @route PUT /users/{id}
 * @group Utilisateurs
 * @param {string} id.path.required - ID de l'utilisateur
 * @param {string} name.body.required - Nouveau nom
 * @param {string} email.body.required - Nouvel email
 * @returns {object} 200 - Utilisateur mis à jour
 * @returns {Error} 400 - Erreur de validation
 * @returns {Error} 404 - Utilisateur non trouvé
 */
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

/**
 * Supprime un utilisateur par ID.
 * @route DELETE /users/{id}
 * @group Utilisateurs
 * @param {string} id.path.required - ID de l'utilisateur à supprimer
 * @returns {object} 200 - Message de confirmation
 * @returns {Error} 404 - Utilisateur non trouvé
 * @returns {Error} 500 - Erreur serveur
 */
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
