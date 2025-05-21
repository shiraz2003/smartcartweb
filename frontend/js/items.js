document.addEventListener("DOMContentLoaded", () => {
  const itemsDiv = document.getElementById("items");
  const addItemForm = document.getElementById("addItemForm");
  const totalItemsElement = document.getElementById("totalItems");
  const lowStockElement = document.getElementById("lowStock");
  const totalValueElement = document.getElementById("totalValue");
  const itemCountElement = document.getElementById("itemCount");
  const refreshButton = document.querySelector('.card-footer .btn-outline-dark:last-child');
  const exportButton = document.querySelector('.card-footer .btn-outline-dark:first-child');
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  
  // Store items globally
  let allItems = [];

  // Function to show low stock notification
  function showLowStockNotification(lowStockItems) {
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-warning border-0 position-fixed start-0 bottom-0 m-3';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.style.zIndex = '1050';
    
    const lowStockList = lowStockItems.map(item => 
      `<li>${item.name}: <strong>${item.stockQuantity}</strong> left</li>`
    ).join('');
    
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <i class="fas fa-exclamation-triangle me-2"></i>
          <strong>Low Stock Alert</strong>
          <ul class="mb-0 ps-4 mt-1">
            ${lowStockList}
          </ul>
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Check if Bootstrap is available
    if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
      const bsToast = new bootstrap.Toast(toast);
      bsToast.show();    } else {
      // Fallback if Bootstrap JS is not loaded
      toast.style.display = 'block';
      setTimeout(() => {
        toast.remove();
      }, 8000);
    }
  }

  // Fetch items from the backend
  function fetchItems() {
    console.log("Fetching items from /api/items");
    
    // Show loading indicator
    itemsDiv.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-4 text-gray-500">
          <div class="d-flex justify-content-center">
            <div class="spinner-border text-dark me-2" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            Loading items...
          </div>
        </td>
      </tr>
    `;
    
    // Use the full URL to the backend API
    fetch("http://localhost:5000/api/items")
      .then((response) => {
        console.log("Response status:", response.status);
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then((items) => {
        console.log("Items received:", items);
        if (Array.isArray(items)) {
          allItems = items; // Store items globally
          
          // Update item stats
          updateItemStats(items);
          
          // Render items (will use filtered items if search is active)
          renderItems(allItems);
          
          // Show notification for low stock items if there are any
          const lowStockItems = items.filter(item => parseInt(item.stockQuantity) < 10);
          if (lowStockItems.length > 0) {
            showLowStockNotification(lowStockItems);
          }
        } else {
          throw new Error("Received invalid data format from server");
        }
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
        itemsDiv.innerHTML = `
          <tr>
            <td colspan="5" class="text-center py-4 text-gray-700">
              <i class="fas fa-exclamation-circle text-gray-700 me-2"></i>
              Error loading items: ${error.message}
            </td>
          </tr>
        `;
      });
  }
  
  // Render items function (separating this from fetchItems for search functionality)
  function renderItems(items) {
    if (items.length === 0) {
      itemsDiv.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4 text-gray-500">
            <i class="fas fa-box-open text-gray-400 text-4xl mb-2"></i>
            <p>No items found. Add your first item using the form.</p>
          </td>
        </tr>
      `;
    } else {
      // Group items by category
      const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {});

      // Render grouped items
      itemsDiv.innerHTML = Object.keys(groupedItems)
        .map(
          (category) => `
            <tr>
              <td colspan="5" class="bg-gray-200 text-gray-800 font-bold px-4 py-2">
                ${category}
              </td>
            </tr>
            ${groupedItems[category]
              .map(
                (item) => `                <tr data-id="${item.id}" class="${parseInt(item.stockQuantity) < 10 ? 'bg-warning bg-opacity-10' : ''}">
                  <td class="px-4 py-3 font-medium">${item.name}</td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-medium">
                      ${item.category}
                    </span>
                  </td>
                  <td class="px-4 py-3 font-medium">$${parseFloat(item.price).toFixed(2)}</td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${
                      parseInt(item.stockQuantity) <= 5 
                        ? 'bg-red-500 text-white' 
                        : parseInt(item.stockQuantity) <= 20 
                          ? 'bg-yellow-500 text-white' 
                          : 'bg-green-500 text-white'
                    }">
                      ${item.stockQuantity}
                    </span>
                    ${parseInt(item.stockQuantity) < 10 ? 
                      '<span class="badge bg-warning text-dark ms-2 py-1 px-2" title="Low stock"><i class="fas fa-exclamation-triangle me-1"></i>Low stock</span>' : 
                      ''}
                  </td>
                  <td class="px-4 py-3">
                    <button class="btn btn-sm btn-outline-dark me-1 edit-btn" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-dark delete-btn" title="Delete">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              `
              )
              .join("")}
          `
        )
        .join("");

      // Update item count display
      itemCountElement.textContent = items.length;
    }
    
    // Attach event listeners for buttons
    attachEventListeners();
  }
  
  // Update item statistics
  function updateItemStats(items) {
    // Count total items
    totalItemsElement.textContent = items.length;
    itemCountElement.textContent = items.length;
    
    // Count low stock items (less than 10)
    const lowStockItems = items.filter(item => parseInt(item.stockQuantity) < 10);
    lowStockElement.textContent = lowStockItems.length;
    
    // Calculate total inventory value
    const totalValue = items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * parseInt(item.stockQuantity));
    }, 0);
    totalValueElement.textContent = `$${totalValue.toFixed(2)}`;
  }
  
  // Search functionality
  function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
      // If search is empty, show all items
      renderItems(allItems);
      return;
    }
    
    // Filter items based on search term
    const filteredItems = allItems.filter(item => {
      return (
        item.name.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm)
      );
    });
    
    // Render filtered items
    renderItems(filteredItems);
  }
  
  // Add search event listener
  if (searchInput) {
    searchInput.addEventListener("keyup", function(event) {
      // Perform search when user presses Enter
      if (event.key === "Enter") {
        performSearch();
      }
    });
  }
  
  if (searchButton) {
    searchButton.addEventListener("click", performSearch);
  }
  
  // Attach event listeners to edit and delete buttons
  function attachEventListeners() {
    // Use event delegation for buttons to handle dynamically added elements
    itemsDiv.addEventListener("click", (e) => {
      // Handle edit button clicks
      if (e.target.classList.contains("edit-btn") || e.target.closest(".edit-btn")) {
        const row = e.target.closest("tr");
        if (row) {
          const itemId = row.getAttribute("data-id");
          const itemName = row.querySelector("td:nth-child(1)").textContent.trim();
          const itemCategory = row.querySelector("td:nth-child(2) span").textContent.trim();
          const itemPrice = row.querySelector("td:nth-child(3)").textContent.replace("$", "").trim();
          const itemStock = row.querySelector("td:nth-child(4) span").textContent.trim();

          // Populate the form with the item's details for editing
          document.getElementById("itemName").value = itemName;
          document.getElementById("itemCategory").value = itemCategory;
          document.getElementById("itemPrice").value = itemPrice;
          document.getElementById("itemStock").value = itemStock;

          // Add a hidden field to track the item ID
          document.getElementById("addItemForm").setAttribute("data-edit-id", itemId);
          
          // Update button text to indicate editing
          const submitBtn = addItemForm.querySelector('button[type="submit"]');
          submitBtn.innerHTML = `<i class="fas fa-check-circle me-2"></i>Update Item`;
          
          // Scroll to form
          document.querySelector('.card-header h2').scrollIntoView({ behavior: 'smooth' });
        }
      }
      
      // Handle delete button clicks
      if (e.target.classList.contains("delete-btn") || e.target.closest(".delete-btn")) {
        const row = e.target.closest("tr");
        if (row) {
          const itemId = row.getAttribute("data-id");
          const itemName = row.querySelector("td:nth-child(1)").textContent.trim();          if (confirm(`Are you sure you want to delete "${itemName}"?`)) {
            fetch(`http://localhost:5000/api/items/${itemId}`, {
              method: "DELETE",
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`Server responded with status: ${response.status}`);
                }
                return response.json();
              })
              .then(() => {
                fetchItems(); // Refresh the items list
              })
              .catch((error) => {
                console.error("Error deleting item:", error);
                alert(`Error deleting item: ${error.message}`);
              });
          }
        }
      }
    });
  }
  
  // Add or update an item
  addItemForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Get form values with proper validation
    const name = document.getElementById("itemName").value.trim();
    const category = document.getElementById("itemCategory").value.trim();
    const price = parseFloat(document.getElementById("itemPrice").value);
    const stockQuantity = parseInt(document.getElementById("itemStock").value);
    const description = document.getElementById("itemDescription")?.value.trim() || "";
    
    // Form validation
    if (!name || !category || isNaN(price) || isNaN(stockQuantity)) {
      alert("Please fill out all required fields with valid values.");
      return;
    }
      // Check if editing or adding
    const editId = addItemForm.getAttribute("data-edit-id");
    const method = editId ? "PUT" : "POST";
    const url = editId ? `http://localhost:5000/api/items/${editId}` : "http://localhost:5000/api/items";
    
    // Create item object
    const itemData = {
      name,
      category,
      price,
      stockQuantity,
      description,
      updatedAt: new Date().toISOString()
    };
    
    // If adding a new item, add createdAt timestamp
    if (!editId) {
      itemData.createdAt = new Date().toISOString();
    }

    // Show feedback that we're saving
    const submitBtn = addItemForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...`;
      fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemData),
      credentials: "same-origin"
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`Server error (${response.status}): ${text || 'Unknown error'}`);
          });
        }
        return response.json();
      })
      .then((responseData) => {
        console.log("Successfully saved item:", responseData);
        fetchItems(); // Refresh the items list
        addItemForm.reset();
        addItemForm.removeAttribute("data-edit-id");
        
        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fas fa-plus-circle me-2"></i>Add Item`;
        
        // Show success message
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-success border-0 position-fixed top-0 end-0 m-3';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        toast.style.zIndex = '1050';
        toast.innerHTML = `
          <div class="d-flex">
            <div class="toast-body">
              <i class="fas fa-check-circle me-2"></i>${editId ? "Item updated successfully!" : "Item added successfully!"}
            </div>
            <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        `;
          document.body.appendChild(toast);
        
        // Check if Bootstrap is available
        if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
          const bsToast = new bootstrap.Toast(toast);
          bsToast.show();
        } else {
          // Fallback if Bootstrap JS is not loaded
          toast.style.display = 'block';
        }
        
        setTimeout(() => {
          toast.remove();
        }, 5000);
      })
      .catch((error) => {
        console.error("Error saving item:", error);
        
        // Show error notification
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-danger border-0 position-fixed top-0 end-0 m-3';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        toast.style.zIndex = '1050';
        toast.innerHTML = `
          <div class="d-flex">
            <div class="toast-body">
              <i class="fas fa-exclamation-circle me-2"></i>Error: ${error.message}
            </div>
            <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        `;
          document.body.appendChild(toast);
        
        // Check if Bootstrap is available
        if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
          const bsToast = new bootstrap.Toast(toast);
          bsToast.show();
        } else {
          // Fallback if Bootstrap JS is not loaded
          toast.style.display = 'block';
        }
        
        setTimeout(() => {
          toast.remove();
        }, 8000);
        
        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      });
  });
  
  // Function to export items to CSV
  function exportToCSV() {
    if (allItems.length === 0) {
      alert("No items to export");
      return;
    }
    
    // Create CSV headers
    const headers = ["Name", "Category", "Price", "Stock Quantity", "Description"];
    
    // Create CSV content
    let csvContent = headers.join(",") + "\n";
    
    allItems.forEach(item => {
      const row = [
        `"${item.name || ''}"`,
        `"${item.category || ''}"`,
        item.price || 0,
        item.stockQuantity || 0,
        `"${(item.description || '').replace(/"/g, '""')}"`,
      ];
      csvContent += row.join(",") + "\n";
    });
    
    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `items-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  // Add event listener to refresh button
  if (refreshButton) {
    refreshButton.addEventListener("click", () => {
      fetchItems();
    });
  }
  
  // Add event listener to export button
  if (exportButton) {
    exportButton.addEventListener("click", () => {
      exportToCSV();
    });
  }

  // Initial fetch
  fetchItems();
});