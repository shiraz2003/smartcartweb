document.addEventListener("DOMContentLoaded", () => {
  const loading = document.getElementById("analytics-loading");
  const error = document.getElementById("analytics-error");
  const grid = document.getElementById("analytics-grid");

  function showLoading() {
    loading.style.display = "block";
    error.style.display = "none";
    grid.style.display = "none";
  }
  function showError(msg) {
    loading.style.display = "none";
    error.style.display = "block";
    error.textContent = msg;
    grid.style.display = "none";
  }
  function showGrid() {
    loading.style.display = "none";
    error.style.display = "none";
    grid.style.display = "grid";
  }

  async function fetchAnalytics() {
    showLoading();
    try {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data = await res.json();
      // Fill in the values
      document.getElementById("totalCarts").textContent = data.totalCarts;
      document.getElementById("onlineCarts").textContent = data.onlineCarts;
      document.getElementById("completedCarts").textContent = data.completedCarts;
      document.getElementById("totalItems").textContent = data.totalItems;
      document.getElementById("totalStock").textContent = data.totalStock;
      document.getElementById("totalInventoryValue").textContent = data.totalInventoryValue.toLocaleString("en-US", { style: "currency", currency: "USD" });
      document.getElementById("totalSessions").textContent = data.totalSessions;
      document.getElementById("activeSessions").textContent = data.activeSessions;
      document.getElementById("totalRevenue").textContent = data.totalRevenue.toLocaleString("en-US", { style: "currency", currency: "USD" });
      showGrid();
    } catch (err) {
      showError(err.message || "Unknown error");
    }
  }

  fetchAnalytics();
});
