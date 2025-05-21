// Helper function to format dates consistently
function formatDate(dateValue) {
    try {
        // If it's a Firestore timestamp object with seconds property
        if (dateValue && dateValue.seconds) {
            const date = new Date(dateValue.seconds * 1000);
            return date.toLocaleString();
        }
        // Otherwise try to parse it as a regular date string
        else if (dateValue) {
            const date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
                return date.toLocaleString();
            }
        }
    } catch (error) {
        console.error("Error formatting date:", error);
    }
    
    return "Invalid date";
}

document.addEventListener("DOMContentLoaded", () => {
    const cartsTable = document.getElementById("cartsTable");
    const cartsGrid = document.getElementById("cartsGrid"); // Legacy grid, now hidden
    const createCartBtn = document.getElementById("createCartBtn");
    const updateCartModal = document.getElementById("updateCartModal");
    const updateCartForm = document.getElementById("updateCartForm");
    const updateCartIdInput = document.getElementById("updateCartId");
    const updateCartNameInput = document.getElementById("updateCartName");
    const updateCartStatusInput = document.getElementById("updateCartStatus");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    const sortFilter = document.getElementById("sortFilter");

    let carts = []; // Store fetched carts

    // Fetch and display all carts
    function fetchCarts() {
        fetch("/api/carts")
            .then((response) => response.json())
            .then((data) => {
                carts = data; // Store carts for filtering and sorting
                renderCarts(carts);
                updateStats(carts);
            })
            .catch((error) => {
                console.error("Error fetching carts:", error);
            });
    }    // Render carts in the table
    function renderCarts(carts) {
        if (carts.length === 0) {
            cartsTable.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-10 text-center">
                        <div class="flex flex-col items-center">
                            <svg class="w-12 h-12 text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p class="text-gray-500 text-lg">No shopping carts found</p>
                            <p class="text-gray-400 text-sm mt-1">Create your first cart using the "New Cart" button</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        cartsTable.innerHTML = carts            .map((cart) => {
                // Format the date nicely with validation
                let formattedDate = "Invalid date";
                
                try {
                    // Check if createdAt exists and is a valid date string or object
                    if (cart.createdAt) {
                        // If createdAt is a Firestore timestamp object (has seconds and nanoseconds)
                        if (cart.createdAt.seconds) {
                            const timestamp = new Date(cart.createdAt.seconds * 1000);
                            formattedDate = timestamp.toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                            });
                        }
                        // If createdAt is a regular date string
                        else {
                            const createdDate = new Date(cart.createdAt);
                            if (!isNaN(createdDate.getTime())) {
                                formattedDate = createdDate.toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                });
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Error formatting date for cart ${cart.cartId}:`, error);
                }
                
                // Status badge class based on cart status
                const statusClass = cart.status === "online" 
                    ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800" 
                    : "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800";
                
                return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${cart.cartId}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="${statusClass}">
                            ${cart.status.charAt(0).toUpperCase() + cart.status.slice(1)}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${formattedDate}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${cart.items?.length || 0}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">$${cart.totalCost?.toFixed(2) || "0.00"}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded-md mr-2" 
                            onclick="viewCart('${cart.cartId}')">
                            View
                        </button>
                        <button class="bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-1 rounded-md" 
                            onclick="updateCart('${cart.cartId}', '${cart.name || ''}', '${cart.status}')">
                            Edit
                        </button>
                    </td>
                </tr>
                `;
            })
            .join("");
    }

    // Update cart stats
    function updateStats(carts) {
        const activeCarts = carts.filter((cart) => cart.status === "online").length;
        const totalValue = carts.reduce((sum, cart) => sum + (cart.totalCost || 0), 0);
        const avgItems = carts.length ? (carts.reduce((sum, cart) => sum + (cart.items?.length || 0), 0) / carts.length).toFixed(1) : 0;

        document.getElementById("activeCartsStat").textContent = activeCarts;
        document.getElementById("totalValueStat").textContent = `$${totalValue.toFixed(2)}`;
        document.getElementById("avgItemsStat").textContent = avgItems;
    }

    // Create a new cart
    createCartBtn.addEventListener("click", () => {
        const newCart = {
            cartId: `CART-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: "online",
            items: [],
            totalCost: 0,
        };

        fetch("/api/carts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCart),
        })
            .then((response) => response.json())
            .then(() => {
                fetchCarts(); // Refresh the cart list
            })
            .catch((error) => {
                console.error("Error creating cart:", error);
            });
    });

    // Delete a cart
    window.deleteCart = (cartId) => {
        fetch(`/api/carts/${cartId}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then(() => {
                fetchCarts(); // Refresh the cart list
            })
            .catch((error) => {
                console.error("Error deleting cart:", error);
            });
    };    // View cart details
    window.viewCart = (cartId) => {
        // Fetch cart details
        fetch(`/api/carts/${cartId}`)
            .then(response => response.json())
            .then(cart => {
                // Create a cart detail modal
                const detailModal = document.createElement('div');
                detailModal.className = 'fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50';
                detailModal.id = 'cartDetailModal';
                
                const itemsList = cart.items && cart.items.length > 0 
                    ? cart.items.map(item => `
                        <tr>
                            <td class="border px-4 py-2">${item.name || 'Item'}</td>
                            <td class="border px-4 py-2">${item.quantity || '1'}</td>
                            <td class="border px-4 py-2">$${item.price?.toFixed(2) || '0.00'}</td>
                            <td class="border px-4 py-2">$${(item.price * item.quantity).toFixed(2) || '0.00'}</td>
                        </tr>
                    `).join('')
                    : `<tr><td colspan="4" class="border px-4 py-6 text-center text-gray-500">No items in this cart</td></tr>`;
                
                detailModal.innerHTML = `
                    <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold">Cart Detail: ${cart.cartId}</h2>
                            <button class="text-gray-500 hover:text-gray-800" onclick="closeCartDetail()">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <div class="mb-6">
                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p class="text-sm text-gray-500">Status</p>
                                    <p class="font-medium">${cart.status.charAt(0).toUpperCase() + cart.status.slice(1)}</p>
                                </div>                                <div>
                                    <p class="text-sm text-gray-500">Created</p>
                                    <p class="font-medium">${formatDate(cart.createdAt)}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Last Updated</p>
                                    <p class="font-medium">${formatDate(cart.updatedAt)}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Total Value</p>
                                    <p class="font-medium">$${cart.totalCost?.toFixed(2) || "0.00"}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold mb-3">Cart Items</h3>
                            <div class="overflow-x-auto">
                                <table class="min-w-full bg-white border border-gray-200">
                                    <thead>
                                        <tr>
                                            <th class="border px-4 py-2 text-left">Item</th>
                                            <th class="border px-4 py-2 text-left">Quantity</th>
                                            <th class="border px-4 py-2 text-left">Price</th>
                                            <th class="border px-4 py-2 text-left">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${itemsList}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="3" class="border px-4 py-2 text-right font-semibold">Total:</td>
                                            <td class="border px-4 py-2 font-semibold">$${cart.totalCost?.toFixed(2) || "0.00"}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                        
                        <div class="flex justify-end gap-4">
                            <button class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" 
                                onclick="closeCartDetail()">Close</button>
                            <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" 
                                onclick="updateCart('${cart.cartId}', '${cart.name || ''}', '${cart.status}'); closeCartDetail()">Edit Cart</button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(detailModal);
            })
            .catch(error => {
                console.error('Error fetching cart details:', error);
            });
    };
    
    // Close cart detail modal
    window.closeCartDetail = () => {
        const detailModal = document.getElementById('cartDetailModal');
        if (detailModal) {
            detailModal.remove();
        }
    };

    // Show the update cart modal
    window.updateCart = (cartId, cartName, cartStatus) => {
        updateCartIdInput.value = cartId;
        updateCartNameInput.value = cartName;
        updateCartStatusInput.value = cartStatus;
        updateCartModal.classList.remove("hidden");
    };

    // Handle update cart form submission
    updateCartForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const cartId = updateCartIdInput.value;
        const updatedCart = {
            name: updateCartNameInput.value,
            status: updateCartStatusInput.value.toLowerCase(),
            updatedAt: new Date(),
        };

        fetch(`/api/carts/${cartId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedCart),
        })
            .then((response) => response.json())
            .then(() => {
                updateCartModal.classList.add("hidden");
                fetchCarts(); // Refresh the cart list
            })
            .catch((error) => {
                console.error("Error updating cart:", error);
            });
    });    // Export table data as CSV
    window.exportCartsCSV = () => {
        if (!carts || carts.length === 0) {
            alert('No data to export');
            return;
        }
        
        // CSV header
        let csvContent = 'Cart ID,Status,Created Date,Items Count,Total Value\n';
        
        // Add data rows
        carts.forEach(cart => {
            const row = [
                cart.cartId,
                cart.status,
                formatDate(cart.createdAt).split(',')[0], // Just get the date portion
                cart.items?.length || 0,
                cart.totalCost || 0
            ].join(',');
            csvContent += row + '\n';
        });
        
        // Create downloadable link
        const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'smart-carts-export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    // Close the modal
    closeModalBtn.addEventListener("click", () => {
        updateCartModal.classList.add("hidden");
    });

    // Initial fetch
    fetchCarts();
});