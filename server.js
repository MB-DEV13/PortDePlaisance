require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const app = express();

// Configurations
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connexion à MongoDB réussie"))
  .catch((err) => console.error("❌ Erreur de connexion MongoDB", err));
mongoose.connection.on("connected", () => {
  console.log("🌿 Connecté à la base MongoDB:", mongoose.connection.name);
});

// **Import des routes**
const catwaysRouter = require("./routes/Catways");
const reservationsRouter = require("./routes/Reservations");

// **Utilisation des routes**
app.use("/catways", catwaysRouter);

// Sous-route réservations imbriquée dans catways/:id
app.use("/catways/:id/reservations", reservationsRouter);

// Route d'accueil
app.get("/", (req, res) => {
  res.render("pages/index", { title: "Accueil" });
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
