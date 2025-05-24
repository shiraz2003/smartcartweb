import express from "express";
import {
  createSession,
  getAllSessions,
  updateSession,
  deleteSession,
} from "../controllers/sessionController.js";

const router = express.Router();

// Create a session
router.post("/", async (req, res) => {
  try {
    const session = await createSession(req.body);
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all sessions
router.get("/", async (req, res) => {
  try {
    const sessions = await getAllSessions();
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a session
router.put("/:id", async (req, res) => {
  try {
    const updatedSession = await updateSession(req.params.id, req.body);
    res.status(200).json(updatedSession);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a session
router.delete("/:id", async (req, res) => {
  try {
    const deletedSession = await deleteSession(req.params.id);
    res.status(200).json(deletedSession);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;