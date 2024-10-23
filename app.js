const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const nodemailer = require("nodemailer");

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB.");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// EJS Template Engine Setup
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/main");

// File Upload Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Import routes
const authRoutes = require("./routes/Authentication Routes");

// Use routes
app.use("/auth", authRoutes);

// Basic routes
app.get("/", (req, res) => {
  res.render("pages/home", {
    title: "Home",
    message: "Welcome to AAU Gym Management System",
  });
});

app.get("/about", (req, res) => {
  res.render("pages/about", { title: "About Us" });
});

app.get("/packages", (req, res) => {
  res.render("pages/packages", { title: "Our Packages" });
});

app.get("/contact", (req, res) => {
  res.render("pages/contact", { title: "Contact Us" });
});

app.get("/faq", (req, res) => {
  res.render("pages/faq", { title: "FAQ" });
});

app.get("/login", (req, res) => {
  res.render("pages/login", { title: "Login" });
});

app.get("/register/member", (req, res) => {
  res.render("pages/register-member", { title: "Become a Member" });
});

app.get("/register/trainer", (req, res) => {
  res.render("pages/register-trainer", { title: "Apply as Trainer" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("pages/error", {
    title: "Error",
    message: "Something went wrong!",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render("pages/404", {
    title: "404 Not Found",
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
