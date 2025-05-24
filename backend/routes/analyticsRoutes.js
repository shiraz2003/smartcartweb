import express from "express";
import { getAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

// GET /api/analytics
router.get("/", async (req, res) => {
  try {
    const analytics = await getAnalytics();
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
