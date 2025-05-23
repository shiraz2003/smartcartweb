import { db } from "../firebase-admin.js";

// Firestore reference for the carts collection
export const cartCollection = db.collection("carts");

// Cart attributes (schema)
export const cartAttributes = {
  cartId: "string",         // Unique cart identifier
  createdAt: "timestamp",   // Timestamp when the cart was created
  updatedAt: "timestamp",   // Timestamp when the cart was last updated
  status: "string",         // Status of the cart (e.g., "online", "completed")
  items: "array",           // Array of item objects
};