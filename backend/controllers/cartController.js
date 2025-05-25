import { cartCollection } from "../models/cartModel.js";

// Create a new cart
export const createCart = async (cart) => {
  try {
    const now = new Date();
    const newCart = {
      cartId: cart.cartId || `CART-${Date.now()}`, // Use provided cartId or generate one
      createdAt: cart.createdAt || now,
      updatedAt: cart.updatedAt || now,
      status: cart.status || "online", // Default status is "online"
      items: cart.items || [],
      totalCost: cart.totalCost || 0,
    };

    // Use cartId as the document ID
    await cartCollection.doc(newCart.cartId).set(newCart);
    return newCart;
  } catch (error) {
    throw new Error("Error creating cart: " + error.message);
  }
};

// Get all carts
export const getAllCarts = async () => {
  try {
    const snapshot = await cartCollection.get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw new Error("Error fetching carts: " + error.message);
  }
};

// Update a cart
export const updateCart = async (id, updatedData) => {
  try {
    await cartCollection.doc(id).update(updatedData);
    return { id, ...updatedData };
  } catch (error) {
    throw new Error("Error updating cart: " + error.message);
  }
};

// Delete a cart
export const deleteCart = async (id) => {
  try {
    await cartCollection.doc(id).delete();
    return { id };
  } catch (error) {
    throw new Error("Error deleting cart: " + error.message);
  }
};