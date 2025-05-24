import express from "express";
import {
  createItem,
  getAllItems,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";

const router = express.Router();

// Create an item
router.post("/", async (req, res) => {
  try {
    const item = await createItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all items
router.get("/", async (req, res) => {
  console.log("GET /api/items route hit");
  try {
    console.log("Fetching all items from database...");
    const items = await getAllItems();
    console.log(`Retrieved ${items.length} items from database`);
    res.status(200).json(items);
  } catch (error) {
    console.error("Error in GET /api/items:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update an item
router.put("/:id", async (req, res) => {
  try {
    const updatedItem = await updateItem(req.params.id, req.body);
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an item
router.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await deleteItem(req.params.id);
    res.status(200).json(deletedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;