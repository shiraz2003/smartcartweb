/**
 * Authentication Guard for Smart Cart Web Application
 * This script checks if a user is authenticated for protected pages
 */

// Function to check if the current page is a protected page
function isProtectedPage() {
  const path = window.location.pathname;
  console.log("Current path:", path);
  
  // Login page is not protected
  if (path.includes('/login.html')) {
    console.log("Login page detected, not protected");
    return false;
  }
  
  // If we're directly accessing a file (not through routing)
  if (path.endsWith('.html')) {
    // If it's not login, it's protected
    if (!path.includes('/login.html')) {
      console.log("HTML page detected that's not login - protected");
      return true;
    }
  } else if (path.endsWith('/')) {
    // Root paths are typically protected dashboard routes
    console.log("Root path detected - protected");
    return true;
  }
  
  // Safety default - assume protected 
  console.log("Default case - assuming protected");
  return true;
}

// Check authentication state when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Only run this check if Firebase is loaded
  if (typeof firebase !== 'undefined' && firebase.auth) {
    // If we're on a protected page and not authenticated, redirect to login
    if (isProtectedPage()) {
      firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
          console.log('User not authenticated. Redirecting to login...');
          // Store the current URL to redirect back after login
          sessionStorage.setItem('redirectUrl', window.location.href);
          window.location.href = '../pages/login.html';
        } else {
          console.log('User authenticated:', user.email);
          // Show user info if there's a user profile element
          const userProfileElement = document.getElementById('userProfile');
          if (userProfileElement) {
            userProfileElement.textContent = user.displayName || user.email;
          }
        }
      });
    }
  } else {
    console.warn('Firebase Auth not loaded. Authentication check skipped.');
  }
});

// Add Firebase dependency if it's not already loaded
(function() {
  if (typeof firebase === 'undefined') {
    console.log('Loading Firebase libraries...');
    
    // Load Firebase App
    const firebaseAppScript = document.createElement('script');
    firebaseAppScript.src = 'https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js';
    firebaseAppScript.async = true;
    document.head.appendChild(firebaseAppScript);
    
    // Load Firebase Auth
    const firebaseAuthScript = document.createElement('script');
    firebaseAuthScript.src = 'https://www.gstatic.com/firebasejs/10.10.0/firebase-auth-compat.js';
    firebaseAuthScript.async = true;
    document.head.appendChild(firebaseAuthScript);
    
    // Initialize Firebase when scripts are loaded
    firebaseAuthScript.onload = function() {      // Firebase configuration
      const firebaseConfig = {
        apiKey: "AIzaSyDkiTRBqyPUEI2vxOWjxpRvMHLnJ7vm9rU",
        authDomain: "smart-cart-e4ff3.firebaseapp.com",
        projectId: "smart-cart-e4ff3",
        storageBucket: "smart-cart-e4ff3.firebasestorage.app",
        messagingSenderId: "327888803071",
        appId: "1:327888803071:web:e705547e4943ed3e41e8ca",
        measurementId: "G-8GV88SHJMB"
      };
        // Initialize Firebase - avoid duplicate initialization
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
      } catch (error) {
        console.error("Firebase initialization error in authGuard:", error);
      }
      // Check authentication again after Firebase is loaded
      firebase.auth().onAuthStateChanged(function(user) {
        if (!user && isProtectedPage()) {
          console.log("User not authenticated and page is protected, redirecting to login");
          
          // Store current full URL as the redirect destination
          sessionStorage.setItem('redirectUrl', window.location.href);
          
          // Calculate relative path to login.html from current location
          const currentPath = window.location.pathname;
          let loginPath = '../pages/login.html';
          
          // If we're already in the pages directory, use a different relative path
          if (currentPath.includes('/pages/') && 
              !currentPath.endsWith('/pages/')) {
            loginPath = 'login.html';  
          }
          
          console.log("Redirecting to:", loginPath);
          window.location.href = loginPath;
        }
      });
    };
  }
})();
