import { userCollection } from "../models/userModel.js";

// Create a new user
export const createUser = async (user) => {
  try {
    const docRef = await userCollection.add(user);
    return { id: docRef.id, ...user };
  } catch (error) {
    throw new Error("Error creating user: " + error.message);
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    const snapshot = await userCollection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error("Error fetching users: " + error.message);
  }
};

// Update a user
export const updateUser = async (id, updatedData) => {
  try {
    await userCollection.doc(id).update(updatedData);
    return { id, ...updatedData };
  } catch (error) {
    throw new Error("Error updating user: " + error.message);
  }
};

// Delete a user
export const deleteUser = async (id) => {
  try {
    await userCollection.doc(id).delete();
    return { id };
  } catch (error) {
    throw new Error("Error deleting user: " + error.message);
  }
};