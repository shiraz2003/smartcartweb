import { itemCollection } from "../models/itemModel.js";

// Create a new item
export const createItem = async (item) => {
  try {
    const docRef = await itemCollection.add(item);
    return { id: docRef.id, ...item };
  } catch (error) {
    throw new Error("Error creating item: " + error.message);
  }
};

// Get all items
export const getAllItems = async () => {
  try {
    console.log("Fetching all items from Firestore");
    
    // Use real Firestore implementation
    const snapshot = await itemCollection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error in getAllItems:", error);
    throw new Error("Error fetching items: " + error.message);
  }
};

// Update an item
export const updateItem = async (id, updatedData) => {
  try {
    await itemCollection.doc(id).update(updatedData);
    return { id, ...updatedData };
  } catch (error) {
    throw new Error("Error updating item: " + error.message);
  }
};

// Delete an item
export const deleteItem = async (id) => {
  try {
    await itemCollection.doc(id).delete();
    return { id };
  } catch (error) {
    throw new Error("Error deleting item: " + error.message);
  }
};