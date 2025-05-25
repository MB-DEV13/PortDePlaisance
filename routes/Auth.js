const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

/**
 * Authentifie un utilisateur à partir de son email et mot de passe.
 * @route POST /login
 * @group Authentification
 * @param {string} email.body.required - L'adresse email de l'utilisateur
 * @param {string} password.body.required - Le mot de passe de l'utilisateur
 * @returns {object} 200 - Un message de succès et les informations de l'utilisateur
 * @returns {object} 400 - Erreurs de validation du formulaire
 * @returns {object} 401 - Identifiants invalides
 * @returns {object} 500 - Erreur serveur
 * @example request - Exemple de body
 * {
 *   "email": "admin@port.com",
 *   "password": "motdepasse"
 * }
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email invalide"),
    body("password").notEmpty().withMessage("Le mot de passe est requis"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res
          .status(401)
          .json({ message: "Email ou mot de passe incorrect" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Email ou mot de passe incorrect" });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600000,
      });

      res.json({
        message: "Connexion réussie",
        user: { email: user.email, name: user.name, role: user.role },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * Déconnecte l'utilisateur en supprimant le cookie contenant le token JWT.
 * @route GET /logout
 * @group Authentification
 * @returns {object} 200 - Message de déconnexion réussie
 */
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Déconnexion réussie" });
});

module.exports = router;
