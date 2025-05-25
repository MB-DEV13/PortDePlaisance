const jwt = require("jsonwebtoken");

/**
 * Middleware Express pour vérifier la présence et la validité d'un token JWT dans les cookies.
 *
 * @function
 * @param {import('express').Request} req - L'objet requête Express.
 * @param {import('express').Response} res - L'objet réponse Express.
 * @param {import('express').NextFunction} next - La fonction middleware suivante.
 *
 * @returns {void} - Soit passe la main au middleware suivant, soit renvoie une erreur 401.
 *
 * @description
 * Ce middleware récupère le token JWT dans le cookie nommé "token".
 * Si le token est absent, il renvoie une réponse 401 (Unauthorized).
 * Si le token est présent, il le vérifie avec la clé secrète définie dans les variables d'environnement.
 * Si la vérification réussit, il attache les données décodées à `req.user` et appelle `next()`.
 * Sinon, il renvoie une erreur 401 avec un message d'erreur.
 */
module.exports = function (req, res, next) {
  const token = req.cookies.token; // récupère le token dans le cookie

  if (!token) return res.status(401).json({ message: "Token manquant" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // userId, email, role dispo ici
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalide ou expiré" });
  }
};
