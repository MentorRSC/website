document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("site-header");

    if (header) {
        fetch("header.html")
            .then(res => res.text())
            .then(data => {
                header.innerHTML = data;
                
                // ✅ ADD MOBILE MENU FUNCTIONALITY AFTER HTML IS LOADED
                setupMobileMenu();
            })
            .catch(error => console.error("Error loading header:", error));
    }
});

function setupMobileMenu() {
    const menuBtn = document.querySelector(".mobile-menu-btn");
    const nav = document.querySelector(".main-nav");
    
    if (menuBtn && nav) {
        // Remove any existing listeners to avoid duplicates
        menuBtn.removeEventListener("click", toggleMenu);
        menuBtn.addEventListener("click", toggleMenu);
    }
}

function toggleMenu() {
    const nav = document.querySelector(".main-nav");
    const menuBtn = document.querySelector(".mobile-menu-btn");
    
    nav.classList.toggle("active");
    menuBtn.classList.toggle("active");
    
    // Optional: Change icon when menu opens/closes
    const icon = menuBtn.querySelector("i");
    if (icon) {
        if (nav.classList.contains("active")) {
            icon.classList.remove("fa-bars");
            icon.classList.add("fa-times");
        } else {
            icon.classList.remove("fa-times");
            icon.classList.add("fa-bars");
        }
    }
}
