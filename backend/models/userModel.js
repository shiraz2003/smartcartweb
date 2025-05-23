import { db } from "../firebase-admin.js";

// Firestore reference for the users collection
export const userCollection = db.collection("users");

// User attributes (schema)
export const userAttributes = {
  name: "string",
  email: "string",
  role: "string",
  createdAt: "timestamp",
};

// Function to get the user's role from Firestore
export const getUserRole = async (uid) => {
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    if (userDoc.exists) {
      return userDoc.data().role; // Return the user's role (e.g., "admin")
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    throw new Error("Error fetching user role: " + error.message);
  }
};

