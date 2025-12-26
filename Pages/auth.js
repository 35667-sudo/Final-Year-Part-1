(function () {
    const token = localStorage.getItem('authToken');

    if (!token || token === "null" || token === "undefined") {
        console.warn("ðŸš« No access token found. Redirecting to login...");
        window.location.href = "/index.html";  // âœ… root-level file
    }
})();
