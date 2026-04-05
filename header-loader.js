document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("site-header");

    if (header) {
        fetch("header.html")
            .then(res => res.text())
            .then(data => {
                header.innerHTML = data;
                setupMobileMenu(); // Add this line
            })
            .catch(error => console.error("Error loading header:", error));
    }
});

function setupMobileMenu() {
    const menuBtn = document.querySelector(".mobile-menu");
    const navMenu = document.querySelector(".nav-menu");
    
    if (menuBtn && navMenu) {
        menuBtn.removeEventListener("click", toggleMenu);
        menuBtn.addEventListener("click", toggleMenu);
        console.log("Mobile menu initialized"); // Check if this logs
    } else {
        console.error("Mobile menu elements not found");
    }
}

function toggleMenu() {
    const navMenu = document.querySelector(".nav-menu");
    const menuBtn = document.querySelector(".mobile-menu");
    
    navMenu.classList.toggle("active");
    
    // Optional: Change icon
    const icon = menuBtn.querySelector("i");
    if (icon) {
        if (navMenu.classList.contains("active")) {
            icon.classList.remove("fa-bars");
            icon.classList.add("fa-times");
        } else {
            icon.classList.remove("fa-times");
            icon.classList.add("fa-bars");
        }
    }
}
