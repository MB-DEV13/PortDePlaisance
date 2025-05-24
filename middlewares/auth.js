const jwt = require("jsonwebtoken");

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
