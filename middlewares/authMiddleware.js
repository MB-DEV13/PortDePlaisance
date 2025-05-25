const jwt = require("jsonwebtoken");

/**
 * Middleware Express pour vérifier l'authentification via un token JWT.
 *
 * Ce middleware récupère le token JWT soit depuis l'en-tête Authorization,
 * soit depuis un cookie nommé "token".
 * Si le token est présent et valide, les informations décodées sont ajoutées
 * à `req.user` et la requête continue avec `next()`.
 * Sinon, une réponse 401 Unauthorized est renvoyée.
 *
 * @function authMiddleware
 * @param {import('express').Request} req - Objet requête Express.
 * @param {import('express').Response} res - Objet réponse Express.
 * @param {import('express').NextFunction} next - Fonction middleware suivante.
 *
 * @returns {void} Ne retourne rien. Passe au middleware suivant ou renvoie une erreur 401.
 */
const authMiddleware = (req, res, next) => {
  // Récupère le token depuis l'en-tête Authorization ou depuis un cookie
  const authHeader = req.headers.authorization || req.cookies?.token;

  if (!authHeader) {
    return res.status(401).send("Accès non autorisé : token manquant");
  }

  // Supporte token au format "Bearer <token>"
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Stocke les données utilisateur dans req.user
    next();
  } catch (err) {
    return res.status(401).send("Accès non autorisé : token invalide");
  }
};

module.exports = authMiddleware;
