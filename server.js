require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// Import du middleware d'authentification
const authMiddleware = require("./middlewares/auth");

// Import des modèles nécessaires
const User = require("./models/User");
const Reservation = require("./models/Reservation"); // adapte si besoin

// Configurations
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connexion MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connexion à MongoDB réussie"))
  .catch((err) => console.error("❌ Erreur de connexion MongoDB", err));
mongoose.connection.on("connected", () => {
  console.log("🌿 Connecté à la base MongoDB:", mongoose.connection.name);
});

// Import des routes
const catwaysRouter = require("./routes/Catways");
const reservationsRouter = require("./routes/Reservations");
const usersRouter = require("./routes/Users");
const authRouter = require("./routes/Auth");

// Utilisation des routes
app.use("/catways", catwaysRouter);
app.use("/catways/:id/reservations", reservationsRouter);
app.use("/users", usersRouter);
app.use("/", authRouter);

// Route d'accueil avec formulaire login
app.get("/", (req, res) => {
  res.render("index", { error: null });
});

// Route dashboard protégée avec récupération des données
app.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    // Récupérer l'utilisateur complet sans le password
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    // Récupérer les réservations (ajuste selon ton schéma)
    const reservations = await Reservation.find();

    // Rendre la page dashboard en passant les données
    res.render("dashboard", { user, reservations });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
