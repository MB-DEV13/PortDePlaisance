const express = require("express");
const { body, validationResult, param } = require("express-validator");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

// Appliquer l'authentification à toutes les routes sauf POST /users (création utilisateur)
router.use((req, res, next) => {
  if (req.method === "POST" && req.path === "/") {
    // création utilisateur accessible sans token (tu peux changer selon besoin)
    return next();
  }
  authMiddleware(req, res, next);
});

// GET /users/ - Lister tous les utilisateurs (sans mot de passe)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /users/:email - Récupérer un utilisateur par email (sans mot de passe)
router.get(
  "/:email",
  param("email").isEmail().withMessage("Email invalide"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const user = await User.findOne({
        email: req.params.email.toLowerCase(),
      }).select("-password");
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// POST /users/ - Créer un utilisateur
router.post(
  "/",
  [
    body("email").isEmail().withMessage("Email invalide"),
    body("name").notEmpty().withMessage("Le nom est requis"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Le mot de passe doit faire au moins 6 caractères"),
    body("role")
      .optional()
      .isIn(["admin", "user"])
      .withMessage("Role invalide"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { email, name, password, role } = req.body;
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) {
        return res
          .status(400)
          .json({ message: "Un utilisateur avec cet email existe déjà" });
      }

      // Création et hash du password fait dans le modèle via pre-save hook
      const newUser = new User({
        email: email.toLowerCase(),
        name,
        password,
        role: role || "user",
      });

      await newUser.save();

      // Ne pas renvoyer le mot de passe
      const userToReturn = newUser.toObject();
      delete userToReturn.password;

      res.status(201).json(userToReturn);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// PUT /users/:email - Modifier un utilisateur (nom, mot de passe, rôle possible)
router.put(
  "/:email",
  [
    param("email").isEmail().withMessage("Email invalide"),
    body("name")
      .optional()
      .notEmpty()
      .withMessage("Le nom ne peut pas être vide"),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Le mot de passe doit faire au moins 6 caractères"),
    body("role")
      .optional()
      .isIn(["admin", "user"])
      .withMessage("Role invalide"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const emailParam = req.params.email.toLowerCase();
      const user = await User.findOne({ email: emailParam });
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      if (req.body.name !== undefined) user.name = req.body.name;
      if (req.body.role !== undefined) user.role = req.body.role;
      if (req.body.password !== undefined) user.password = req.body.password; // sera hashé via pre-save hook

      await user.save();

      const userToReturn = user.toObject();
      delete userToReturn.password;

      res.json(userToReturn);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// DELETE /users/:email - Supprimer un utilisateur
router.delete(
  "/:email",
  param("email").isEmail().withMessage("Email invalide"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const emailParam = req.params.email.toLowerCase();
      const user = await User.findOneAndDelete({ email: emailParam });
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
