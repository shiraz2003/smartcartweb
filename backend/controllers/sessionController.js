import { sessionCollection } from "../models/sessionModel.js";

// Create a new session
export const createSession = async (session) => {
  try {
    const docRef = await sessionCollection.add(session);
    return { id: docRef.id, ...session };
  } catch (error) {
    throw new Error("Error creating session: " + error.message);
  }
};

// Get all sessions
export const getAllSessions = async () => {
  try {
    const snapshot = await sessionCollection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error("Error fetching sessions: " + error.message);
  }
};

// Update a session
export const updateSession = async (id, updatedData) => {
  try {
    await sessionCollection.doc(id).update(updatedData);
    return { id, ...updatedData };
  } catch (error) {
    throw new Error("Error updating session: " + error.message);
  }
};

// Delete a session
export const deleteSession = async (id) => {
  try {
    await sessionCollection.doc(id).delete();
    return { id };
  } catch (error) {
    throw new Error("Error deleting session: " + error.message);
  }
};