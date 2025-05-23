import { db } from "../firebase-admin.js";

// Firestore reference for the sessions collection
export const sessionCollection = db.collection("sessions");

// Session attributes (schema)
export const sessionAttributes = {
  item_count: "number",
  items: "array",
  server_timestamp: "timestamp",
  total: "number",
  status: "string", // e.g., "active", "completed"
};