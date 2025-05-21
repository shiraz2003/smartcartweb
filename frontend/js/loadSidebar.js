document.addEventListener("DOMContentLoaded", function() {
  // Get the sidebar element
  const sidebarElement = document.getElementById('sidebar');
  
  if (sidebarElement) {
    // Fetch the sidebar HTML using a relative path
    fetch('../sidebar.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load sidebar');
        }
        return response.text();
      })
      .then(html => {
        // Insert the sidebar HTML
        sidebarElement.innerHTML = html;
        
        // Set active menu item based on current page
        const currentPage = window.location.pathname.split('/').pop().split('.')[0] || 'index';
        
        // Fix relative URLs in the sidebar
        const navLinks = sidebarElement.querySelectorAll('.nav-item');
        navLinks.forEach(link => {
          // Convert absolute paths to relative paths
          if (link.getAttribute('href').startsWith('/')) {
            const href = link.getAttribute('href');
            if (href === '/') {
              link.setAttribute('href', '../pages/index.html');
            } else {
              link.setAttribute('href', `../pages${href}.html`);
            }
          }
          
          // Add active class to current page
          if (link.getAttribute('data-page') === currentPage) {
            link.classList.add('active');
          }
        });
        
        // Add logout functionality
        const logoutLink = sidebarElement.querySelector('[data-page="login"]');
        if (logoutLink) {
          logoutLink.addEventListener('click', function(e) {
            // Only if Firebase is loaded and user is logged in
            if (typeof firebase !== 'undefined' && firebase.auth) {
              e.preventDefault();
              firebase.auth().signOut().then(() => {
                window.location.href = '../pages/login.html';
              }).catch(error => {
                console.error('Error signing out:', error);
              });
            }
          });
        }
      })
      .catch(error => {
        console.error('Error loading sidebar:', error);
        sidebarElement.innerHTML = `<p class="text-center p-4">Error loading sidebar: ${error.message}</p>`;
      });
  }
});