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
    
    // Pagination elements
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    const prevPageMobileBtn = document.getElementById("prevPageMobile");
    const nextPageMobileBtn = document.getElementById("nextPageMobile");
    const paginationNumbers = document.getElementById("paginationNumbers");
    const startRangeSpan = document.getElementById("startRange");
    const endRangeSpan = document.getElementById("endRange");
    const totalItemsSpan = document.getElementById("totalItems");
    
    // Pagination state
    const ITEMS_PER_PAGE = 10;
    let currentPage = 1;
    
    // Column sorting
    const tableHeaders = document.querySelectorAll('th[data-sort]');
    let currentSort = { column: 'date', direction: 'desc' };

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
    }    // Render carts in the table with pagination
    function renderCarts(carts) {
        // Update pagination UI
        updatePagination(carts.length);
        
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

        // Get paginated data
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginatedCarts = carts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
        
        // Update display range
        startRangeSpan.textContent = startIndex + 1;
        endRangeSpan.textContent = Math.min(startIndex + ITEMS_PER_PAGE, carts.length);
        totalItemsSpan.textContent = carts.length;

        cartsTable.innerHTML = paginatedCarts
            .map((cart) => {
                // Format the date nicely
                const createdDate = new Date(cart.createdAt);
                const formattedDate = createdDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
                
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
    });    // Delete a cart
    window.deleteCart = (cartId) => {
        fetch(`/api/carts/${cartId}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then(() => {
                fetchCarts(); // Refresh the cart list
                closeCartDetail(); // Close the detail modal if open
            })
            .catch((error) => {
                console.error("Error deleting cart:", error);
            });
    };
    
    // Confirm delete cart
    window.confirmDeleteCart = (cartId) => {
        const confirmModal = document.createElement('div');
        confirmModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        confirmModal.id = 'deleteConfirmModal';
        
        confirmModal.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                <div class="text-center mb-6">
                    <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Confirm Delete</h3>
                    <p class="text-sm text-gray-500">Are you sure you want to delete cart ${cartId}? This action cannot be undone.</p>
                </div>
                
                <div class="flex justify-end gap-3">
                    <button class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" 
                        onclick="closeDeleteConfirm()">Cancel</button>
                    <button class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" 
                        onclick="deleteCart('${cartId}'); closeDeleteConfirm()">Delete</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmModal);
    };
    
    // Close delete confirmation modal
    window.closeDeleteConfirm = () => {
        const confirmModal = document.getElementById('deleteConfirmModal');
        if (confirmModal) {
            confirmModal.remove();
        }
    };

    // View cart details
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
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Created</p>
                                    <p class="font-medium">${new Date(cart.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Last Updated</p>
                                    <p class="font-medium">${new Date(cart.updatedAt).toLocaleString()}</p>
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
                          <div class="flex justify-between gap-4">
                            <button class="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200" 
                                onclick="confirmDeleteCart('${cart.cartId}')">
                                <i class="fas fa-trash-alt mr-1"></i> Delete Cart
                            </button>
                            <div class="flex gap-3">
                                <button class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" 
                                    onclick="closeCartDetail()">Close</button>
                                <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" 
                                    onclick="updateCart('${cart.cartId}', '${cart.name || ''}', '${cart.status}'); closeCartDetail()">
                                    <i class="fas fa-edit mr-1"></i> Edit Cart
                                </button>
                            </div>
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
    });    // Event listeners for filtering and sorting
    searchInput.addEventListener("input", filterCarts);
    statusFilter.addEventListener("change", filterCarts);
    sortFilter.addEventListener("change", filterCarts);
    
    // Add event listeners to table headers for sorting
    tableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const sortColumn = header.getAttribute('data-sort');
            
            // Update sort direction
            if (currentSort.column === sortColumn) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = sortColumn;
                currentSort.direction = 'asc'; // Default to ascending for new column
            }
            
            // Update UI to show sort direction
            tableHeaders.forEach(h => {
                const icon = h.querySelector('i');
                if (h === header) {
                    icon.className = currentSort.direction === 'asc' 
                        ? 'fas fa-sort-up ml-1 text-blue-600' 
                        : 'fas fa-sort-down ml-1 text-blue-600';
                } else {
                    icon.className = 'fas fa-sort ml-1 text-gray-400';
                }
            });
            
            filterCarts();
        });
    });

    // Filter and sort carts based on the input/select values
    function filterCarts() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;
        const sortValue = sortFilter.value;

        // Filter by search term and status
        let filteredCarts = carts.filter((cart) => {
            const matchesSearch = cart.cartId.toLowerCase().includes(searchTerm);
            const matchesStatus = statusValue === "all" || cart.status === statusValue;
            return matchesSearch && matchesStatus;
        });

        // Sort carts based on selected column or dropdown
        if (sortValue !== "none") {
            // Use the dropdown selection if it's not "none"
            if (sortValue === "date") {
                filteredCarts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            } else if (sortValue === "value") {
                filteredCarts.sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0));
            } else if (sortValue === "items") {
                filteredCarts.sort((a, b) => (b.items?.length || 0) - (a.items?.length || 0));
            }
        } else {
            // Otherwise sort by the clicked column header
            switch(currentSort.column) {
                case 'id':
                    filteredCarts.sort((a, b) => {
                        const result = a.cartId.localeCompare(b.cartId);
                        return currentSort.direction === 'asc' ? result : -result;
                    });
                    break;
                case 'status':
                    filteredCarts.sort((a, b) => {
                        const result = a.status.localeCompare(b.status);
                        return currentSort.direction === 'asc' ? result : -result;
                    });
                    break;
                case 'date':
                    filteredCarts.sort((a, b) => {
                        const dateA = new Date(a.createdAt);
                        const dateB = new Date(b.createdAt);
                        const result = dateA - dateB;
                        return currentSort.direction === 'asc' ? result : -result;
                    });
                    break;
                case 'items':
                    filteredCarts.sort((a, b) => {
                        const itemsA = a.items?.length || 0;
                        const itemsB = b.items?.length || 0;
                        const result = itemsA - itemsB;
                        return currentSort.direction === 'asc' ? result : -result;
                    });
                    break;
                case 'value':
                    filteredCarts.sort((a, b) => {
                        const valueA = a.totalCost || 0;
                        const valueB = b.totalCost || 0;
                        const result = valueA - valueB;
                        return currentSort.direction === 'asc' ? result : -result;
                    });
                    break;
            }
        }
        
        // Add "no results" message if there are no matching results
        if (filteredCarts.length === 0 && (searchTerm || statusValue !== "all")) {
            cartsTable.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-10 text-center">
                        <div class="flex flex-col items-center">
                            <svg class="w-12 h-12 text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <p class="text-gray-500 text-lg">No matching carts found</p>
                            <p class="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Render the filtered and sorted carts
        renderCarts(filteredCarts);
    }    // Update pagination UI
    function updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        
        // Update pagination numbers
        paginationNumbers.innerHTML = '';
        
        // Limit the number of page buttons shown
        const MAX_PAGES_SHOWN = 5;
        let startPage = Math.max(1, currentPage - Math.floor(MAX_PAGES_SHOWN / 2));
        let endPage = Math.min(totalPages, startPage + MAX_PAGES_SHOWN - 1);
        
        // Adjust start if we're near the end
        if (endPage - startPage + 1 < MAX_PAGES_SHOWN) {
            startPage = Math.max(1, endPage - MAX_PAGES_SHOWN + 1);
        }
        
        // First page button if not starting at 1
        if (startPage > 1) {
            const firstPageBtn = createPageButton(1, currentPage === 1);
            paginationNumbers.appendChild(firstPageBtn);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700';
                ellipsis.textContent = '...';
                paginationNumbers.appendChild(ellipsis);
            }
        }
        
        // Page number buttons
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = createPageButton(i, currentPage === i);
            paginationNumbers.appendChild(pageBtn);
        }
        
        // Last page button if not ending at totalPages
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700';
                ellipsis.textContent = '...';
                paginationNumbers.appendChild(ellipsis);
            }
            
            const lastPageBtn = createPageButton(totalPages, currentPage === totalPages);
            paginationNumbers.appendChild(lastPageBtn);
        }
        
        // Update button states
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
        prevPageBtn.classList.toggle('opacity-50', currentPage === 1);
        nextPageBtn.classList.toggle('opacity-50', currentPage === totalPages);
        
        // Same for mobile buttons
        prevPageMobileBtn.disabled = currentPage === 1;
        nextPageMobileBtn.disabled = currentPage === totalPages;
        prevPageMobileBtn.classList.toggle('opacity-50', currentPage === 1);
        nextPageMobileBtn.classList.toggle('opacity-50', currentPage === totalPages);
    }
    
    // Create a pagination button
    function createPageButton(pageNum, isActive) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = isActive 
            ? 'relative z-10 inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' 
            : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0';
        button.textContent = pageNum;
        button.addEventListener('click', () => {
            if (currentPage !== pageNum) {
                currentPage = pageNum;
                filterCarts();
            }
        });
        return button;
    }
    
    // Add event listeners for pagination buttons
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            filterCarts();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(carts.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            filterCarts();
        }
    });
    
    // Mobile pagination buttons
    prevPageMobileBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            filterCarts();
        }
    });
    
    nextPageMobileBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(carts.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            filterCarts();
        }
    });
    
    // Export table data as CSV
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
                new Date(cart.createdAt).toLocaleDateString(),
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
