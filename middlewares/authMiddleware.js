// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

/**
 * Middleware pour vérifier l'authentification via JWT.
 * Si le token est valide, ajoute les infos utilisateur à req.user,
 * sinon renvoie une erreur 401 Unauthorized.
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
