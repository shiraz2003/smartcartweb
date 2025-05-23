import { db } from "../firebase-admin.js";

// Firestore reference for the items collection
export const itemCollection = db.collection("items");

// Item attributes (schema)
export const itemAttributes = {
  name: "string",
  category: "string",
  price: "number",
  stockQuantity: "number",
  description: "string",
  createdAt: "timestamp",
  updatedAt: "timestamp",
};