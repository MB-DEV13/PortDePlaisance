const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

// POST /login - authentification utilisateur et génération du token JWT
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

      // Générer un token JWT (validité 1h)
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Stocker le token dans un cookie HTTPOnly (et Secure en prod)
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // en prod seulement
        sameSite: "strict",
        maxAge: 3600000, // 1h en ms
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

router.get("/logout", (req, res) => {
  // Supprimer le cookie token côté serveur
  res.clearCookie("token");
  res.json({ message: "Déconnexion réussie" });
});

module.exports = router;
