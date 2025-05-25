import { productCollection } from "../models/productModel.js";

// Create a new product
export const createProduct = async (product) => {
  try {
    const docRef = await productCollection.add(product);
    return { id: docRef.id, ...product };
  } catch (error) {
    throw new Error("Error creating product: " + error.message);
  }
};

// Get all products
export const getAllProducts = async () => {
  try {
    const snapshot = await productCollection.get();
    return snapshot.docs.map((doc) => ({
      id: doc.id, // Include the document ID
      ...doc.data(), // Include the rest of the document data
    }));
  } catch (error) {
    throw new Error("Error fetching products: " + error.message);
  }
};

// Update a product
export const updateProduct = async (id, updatedData) => {
  try {
    await productCollection.doc(id).update(updatedData);
    return { id, ...updatedData };
  } catch (error) {
    throw new Error("Error updating product: " + error.message);
  }
};

// Delete a product
export const deleteProduct = async (id) => {
  try {
    await productCollection.doc(id).delete();
    return { id };
  } catch (error) {
    throw new Error("Error deleting product: " + error.message);
  }
};