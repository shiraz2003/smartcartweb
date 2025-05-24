import express from "express";
import {
  createCart,
  getAllCarts,
  updateCart,
  deleteCart,
} from "../controllers/cartController.js";

const router = express.Router();

// Create a cart
router.post("/", async (req, res) => {
  try {
    const cart = await createCart(req.body);
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all carts
router.get("/", async (req, res) => {
  try {
    const carts = await getAllCarts();
    res.status(200).json(carts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a cart
router.put("/:id", async (req, res) => {
  try {
    const updatedCart = await updateCart(req.params.id, req.body);
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a cart
router.delete("/:id", async (req, res) => {
  try {
    const deletedCart = await deleteCart(req.params.id);
    res.status(200).json(deletedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;