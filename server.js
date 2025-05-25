require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");

const app = express();

// Import du middleware d'authentification
const authMiddleware = require("./middlewares/auth");

// Import des modèles nécessaires
const User = require("./models/User");
const Reservation = require("./models/Reservation");
const Catway = require("./models/Catway");

// Configurations
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride("_method"));

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
app.use("/reservations", reservationsRouter);
app.use("/users", usersRouter);
app.use("/", authRouter);

// Route d'accueil avec formulaire login
app.get("/", (req, res) => {
  res.render("index", { error: null });
});

// Route dashboard protégée avec récupération des données
app.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    const reservations = await Reservation.find();
    res.render("dashboard", { user, reservations });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
});

// Pages CRUD EJS protégées
app.get("/catways", authMiddleware, async (req, res) => {
  const catways = await Catway.find();
  res.render("catways", { catways });
});

app.post("/catways", authMiddleware, async (req, res) => {
  await Catway.create({ number: req.body.number });
  res.redirect("/catways");
});

app.delete("/catways/:id", authMiddleware, async (req, res) => {
  await Catway.findByIdAndDelete(req.params.id);
  res.redirect("/catways");
});

app.get("/reservations", authMiddleware, async (req, res) => {
  const reservations = await Reservation.find();
  res.render("reservations", { reservations });
});

app.post("/reservations", authMiddleware, async (req, res) => {
  await Reservation.create(req.body);
  res.redirect("/reservations");
});

app.delete("/reservations/:id", authMiddleware, async (req, res) => {
  await Reservation.findByIdAndDelete(req.params.id);
  res.redirect("/reservations");
});

app.get("/users", authMiddleware, async (req, res) => {
  const users = await User.find();
  res.render("users", { users });
});

app.post("/users", authMiddleware, async (req, res) => {
  const { name, email, password } = req.body;
  await User.create({ name, email, password });
  res.redirect("/users");
});

app.delete("/users/:id", authMiddleware, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/users");
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
