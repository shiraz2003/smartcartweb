import { cartCollection } from "../models/cartModel.js";
import { itemCollection } from "../models/itemModel.js";
import { sessionCollection } from "../models/sessionModel.js";

export const getAnalytics = async () => {
  try {
    // Get total carts
    const cartsSnapshot = await cartCollection.get();
    const totalCarts = cartsSnapshot.size;
    const onlineCarts = cartsSnapshot.docs.filter(doc => doc.data().status === "online").length;
    const completedCarts = cartsSnapshot.docs.filter(doc => doc.data().status === "completed").length;

    // Get total items
    const itemsSnapshot = await itemCollection.get();
    const totalItems = itemsSnapshot.size;
    let totalStock = 0;
    let totalInventoryValue = 0;
    itemsSnapshot.docs.forEach(doc => {
      const d = doc.data();
      totalStock += Number(d.stockQuantity || 0);
      totalInventoryValue += (Number(d.stockQuantity || 0) * Number(d.price || 0));
    });

    // Get total sessions
    const sessionsSnapshot = await sessionCollection.get();
    const totalSessions = sessionsSnapshot.size;
    let totalRevenue = 0;
    let activeSessions = 0;
    sessionsSnapshot.docs.forEach(doc => {
      const d = doc.data();
      totalRevenue += Number(d.total || 0);
      if (d.status === "active") activeSessions++;
    });

    return {
      totalCarts,
      onlineCarts,
      completedCarts,
      totalItems,
      totalStock,
      totalInventoryValue,
      totalSessions,
      activeSessions,
      totalRevenue
    };
  } catch (error) {
    throw new Error("Error fetching analytics: " + error.message);
  }
};
