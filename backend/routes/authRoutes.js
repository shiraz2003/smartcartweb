import express from "express";
import { auth } from "../firebase-admin.js";
import { getUserRole } from "../models/userModel.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { idToken } = req.body;

  try {
    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get the user's role
    const role = await getUserRole(uid);

    if (role === "admin") {
      res.status(200).json({ message: "Login successful", role });
    } else {
      res.status(403).json({ message: "Access denied" });
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error: error.message });
  }
});

export default router;