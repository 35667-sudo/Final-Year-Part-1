(function () {
    const token = localStorage.getItem('authToken');
    
    if (!token || token === "null" || token === "undefined") {
        console.warn("🚫 No access token found. Redirecting to login...");
        window.location.href = "login.html";  // Redirect to login page
    }
})();
