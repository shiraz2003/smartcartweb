import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the frontend folder
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// Define routes for the HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/index.html"));
});

app.get("/items", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/items.html"));
});

app.get("/carts", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/carts.html"));
});

app.get("/sessions", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/sessions.html"));
});

app.get("/analytics", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/analytics.html"));
});

app.get("/settings", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/settings.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/login.html"));
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});