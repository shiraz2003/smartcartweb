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
  const sessionsTable = document.getElementById("sessions");
  const sessionsGrid = document.getElementById("sessionsGrid"); // Legacy grid, now hidden
  const createSessionForm = document.getElementById("createSessionForm");
  const updateSessionForm = document.getElementById("updateSessionForm");
  const deleteSessionForm = document.getElementById("deleteSessionForm");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");

  let sessions = []; // Store fetched sessions

  // Fetch and display all sessions
  function fetchSessions() {
    fetch("/api/sessions")
      .then((response) => response.json())
      .then((data) => {
        sessions = data; // Store sessions for filtering and sorting
        renderSessions(sessions);
      })
      .catch((error) => {
        sessionsTable.innerHTML = `
          <tr>
            <td colspan="6" class="px-6 py-4 text-center text-red-500">
              Error loading sessions: ${error.message}
            </td>
          </tr>
        `;
      });
  }

  // Render sessions in the table
  function renderSessions(sessions) {
    if (sessions.length === 0) {
      sessionsTable.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-10 text-center">
            <div class="flex flex-col items-center">
              <svg class="w-12 h-12 text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <p class="text-gray-500 text-lg">No shopping sessions found</p>
              <p class="text-gray-400 text-sm mt-1">Create your first session using the form below</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }
    
    sessionsTable.innerHTML = sessions
      .map((session) => {
        // Format status badge class based on session status
        const status = session.status || 'active';
        const statusClass = status === "active" 
          ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800" 
          : "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800";
        
        // Calculate total items
        const itemCount = session.items?.length || 0;
        
        return `
          <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">${session.id}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">${session.name || 'Unnamed Session'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="${statusClass}">
                ${status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">${itemCount}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">$${session.total?.toFixed(2) || "0.00"}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button class="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded-md mr-2" 
                onclick="viewSession('${session.id}')">
                View
              </button>
              <button class="bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-1 rounded-md" 
                onclick="prepareUpdateSession('${session.id}', '${session.name || ''}', '${session.total || 0}')">
                Edit
              </button>
            </td>
          </tr>
        `;      })
      .join("");
  }
  
  // Event listeners for filtering
  searchInput.addEventListener("input", filterSessions);
  statusFilter.addEventListener("change", filterSessions);

  // Filter sessions based on the input/select values
  function filterSessions() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;

    // Filter by search term and status
    let filteredSessions = sessions.filter((session) => {
      const searchMatches = (
        (session.id && session.id.toLowerCase().includes(searchTerm)) || 
        (session.name && session.name.toLowerCase().includes(searchTerm))
      );
      const statusMatches = statusValue === "all" || (session.status || "active") === statusValue;
      return searchMatches && statusMatches;
    });

    // Add "no results" message if there are no matching results
    if (filteredSessions.length === 0 && (searchTerm || statusValue !== "all")) {
      sessionsTable.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-10 text-center">
            <div class="flex flex-col items-center">
              <svg class="w-12 h-12 text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p class="text-gray-500 text-lg">No matching sessions found</p>
              <p class="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    // Render the filtered sessions
    renderSessions(filteredSessions);
  }
  
  // View session details
  window.viewSession = (sessionId) => {
    // Find the session
    const session = sessions.find(s => s.id === sessionId);
    
    if (!session) {
      console.error('Session not found:', sessionId);
      return;
    }
    
    // Create a session detail modal
    const detailModal = document.createElement('div');
    detailModal.className = 'fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50';
    detailModal.id = 'sessionDetailModal';
    
    const itemsList = session.items && session.items.length > 0 
      ? session.items.map(item => `
          <tr>
            <td class="border px-4 py-2">${item.name || 'Item'}</td>
            <td class="border px-4 py-2">${item.quantity || '1'}</td>
            <td class="border px-4 py-2">$${item.price?.toFixed(2) || '0.00'}</td>
            <td class="border px-4 py-2">$${(item.price * item.quantity).toFixed(2) || '0.00'}</td>
          </tr>
        `).join('')
      : `<tr><td colspan="4" class="border px-4 py-6 text-center text-gray-500">No items in this session</td></tr>`;
    
    detailModal.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">Session Detail: ${session.name || 'Unnamed Session'}</h2>
          <button class="text-gray-500 hover:text-gray-800" onclick="closeSessionDetail()">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="mb-6">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p class="text-sm text-gray-500">Session ID</p>
              <p class="font-medium">${session.id}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Status</p>
              <p class="font-medium">${(session.status || 'active').charAt(0).toUpperCase() + (session.status || 'active').slice(1)}</p>
            </div>            <div>
              <p class="text-sm text-gray-500">Created</p>
              <p class="font-medium">${session.created_at ? formatDate(session.created_at) : 'N/A'}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Total Value</p>
              <p class="font-medium">$${session.total?.toFixed(2) || "0.00"}</p>
            </div>
          </div>
        </div>
        
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3">Session Items</h3>
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
                  <td class="border px-4 py-2 font-semibold">$${session.total?.toFixed(2) || "0.00"}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <div class="flex justify-end gap-4">
          <button class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" 
            onclick="closeSessionDetail()">Close</button>
          <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" 
            onclick="prepareUpdateSession('${session.id}', '${session.name || ''}', '${session.total || 0}'); closeSessionDetail()">Edit Session</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(detailModal);
  };
  
  // Close session detail modal
  window.closeSessionDetail = () => {
    const detailModal = document.getElementById('sessionDetailModal');
    if (detailModal) {
      detailModal.remove();
    }
  };
  
  // Prepare update session form
  window.prepareUpdateSession = (id, name, total) => {
    document.getElementById("updateSessionId").value = id;
    document.getElementById("updateSessionName").value = name;
    document.getElementById("updateSessionTotal").value = total;
    
    // Scroll to the update form
    document.getElementById("updateSessionForm").scrollIntoView({ behavior: 'smooth' });
  };

  // Create a new session
  createSessionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("sessionName").value;
    const total = document.getElementById("sessionTotal").value;

    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name, 
        total: parseFloat(total),
        status: 'active',
        items: [],
        created_at: new Date().toISOString()
      }),
    })
      .then((response) => response.json())
      .then(() => {
        fetchSessions(); // Refresh the sessions list
        createSessionForm.reset();
      })
      .catch((error) => {
        console.error("Error creating session:", error);
      });
  });
  // Update a session
  updateSessionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("updateSessionId").value;
    const name = document.getElementById("updateSessionName").value;
    const total = document.getElementById("updateSessionTotal").value;

    fetch(`/api/sessions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name, 
        total: parseFloat(total),
        updated_at: new Date().toISOString()
      }),
    })
      .then((response) => response.json())
      .then(() => {
        fetchSessions(); // Refresh the sessions list
        updateSessionForm.reset();
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4';
        successMsg.innerHTML = `
          <div class="flex items-center">
            <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>Session updated successfully!</span>
          </div>
        `;
        
        updateSessionForm.parentNode.insertBefore(successMsg, updateSessionForm);
        
        // Remove the message after 3 seconds
        setTimeout(() => {
          successMsg.remove();
        }, 3000);
      })
      .catch((error) => {
        console.error("Error updating session:", error);
      });
  });

  // Delete a session
  deleteSessionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("deleteSessionId").value;
    
    // Confirm deletion with the user
    if (!confirm(`Are you sure you want to delete session ${id}? This action cannot be undone.`)) {
      return;
    }

    fetch(`/api/sessions/${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then(() => {
        fetchSessions(); // Refresh the sessions list
        deleteSessionForm.reset();
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4';
        successMsg.innerHTML = `
          <div class="flex items-center">
            <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>Session deleted successfully!</span>
          </div>
        `;
        
        deleteSessionForm.parentNode.insertBefore(successMsg, deleteSessionForm);
        
        // Remove the message after 3 seconds
        setTimeout(() => {
          successMsg.remove();
        }, 3000);
      })
      .catch((error) => {
        console.error("Error deleting session:", error);
        
        // Show error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4';
        errorMsg.innerHTML = `
          <div class="flex items-center">
            <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span>Error deleting session: ${error.message}</span>
          </div>
        `;
        
        deleteSessionForm.parentNode.insertBefore(errorMsg, deleteSessionForm);
        
        // Remove the message after 5 seconds
        setTimeout(() => {
          errorMsg.remove();
        }, 5000);
      });
  });
  
  // Add Direct Delete function
  window.deleteSessionDirect = (sessionId) => {
    if (confirm(`Are you sure you want to delete session ${sessionId}? This action cannot be undone.`)) {
      fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then(() => {
          fetchSessions(); // Refresh the sessions list
          // Close modal if open
          closeSessionDetail();
        })
        .catch((error) => {
          console.error("Error deleting session:", error);
          alert(`Error deleting session: ${error.message}`);
        });
    }
  };

  // Initial fetch
  fetchSessions();
});