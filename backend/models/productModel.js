import { db } from "../firebase-admin.js";

// Firestore reference for the products collection
export const productCollection = db.collection("items");

// Product attributes (schema)
export const productAttributes = {
  category: "string",
  name: "string",
  price: "number",
  timestamp: "timestamp",
  weight: "number",
};