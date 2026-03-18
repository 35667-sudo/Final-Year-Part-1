(function () {
    const token = localStorage.getItem('authToken');

    if (!token || token === "null" || token === "undefined") {
        console.warn("ðŸš« No access token found. Redirecting to login...");
        window.location.href = "/index.html";  // âœ… root-level file
    }
})();
  document.addEventListener("DOMContentLoaded", () => {
        const userRole = localStorage.getItem("userRole");

       const roleRestrictions = {
            "Community": [
                "vector.html",
                "fertilizer.html",
                "bulk-water.html"
            ],
            "Progressive": [
                "vector.html",
                "bulk-water.html",
                 "fertilizer.html"
            ],
            "Enterprise": [
                "bulk-water.html",
                 "fertilizer.html"
            ],
            "Super": [
                "fertilizer.html"
            ]
        };


        // List of restricted buttons or elements for each role
        const roleButtonRestrictions = {
            "Community": [
                "detectBoundariesButton"
            ],
            "Progressive": [
                "detectBoundariesButton"
            ],
            "Enterprise": [
                "umar2","umar"
            ],
            "Super": [
                // You can add any specific buttons for Super role here if needed
            ]
        };

        // Hide links / menu items for restricted pages
        const restrictedPages = roleRestrictions[userRole] || [];
        restrictedPages.forEach(page => {
            document.querySelectorAll(`a[href*="${page}"]`).forEach(link => {
                link.style.display = "none";
            });
        });

        // Block direct page access
        const currentPage = window.location.pathname.split("/").pop();
        if (restrictedPages.includes(currentPage)) {
            alert("Access denied for your role.");
            window.location.href = "dashboard.html";
            return;
        }

        // Hide specific buttons or elements
        const restrictedButtons = roleButtonRestrictions[userRole] || [];
        restrictedButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.style.display = "none";
                button.disabled = true;  // Ensure it's disabled as well
            }
        });
    });
