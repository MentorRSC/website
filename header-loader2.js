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

    // --- Mobile menu core functions (based on user script) ---
    function setupMobileMenu() {
        const menuBtn = document.querySelector(".mobile-menu");
        const navMenu = document.querySelector(".nav-menu");
        
        if (menuBtn && navMenu) {
            // Remove previous listener to avoid duplicates
            menuBtn.removeEventListener("click", toggleMenu);
            menuBtn.addEventListener("click", toggleMenu);
            
            // Also close menu if window resizes to desktop viewport (optional but friendly)
            window.addEventListener("resize", function handleResize() {
                if (window.innerWidth > 900) {
                    if (navMenu.classList.contains("active")) {
                        navMenu.classList.remove("active");
                        const icon = menuBtn.querySelector("i");
                        if (icon && icon.classList.contains("fa-times")) {
                            icon.classList.remove("fa-times");
                            icon.classList.add("fa-bars");
                        }
                    }
                }
            });
            console.log("Mobile menu initialized with toggle");
        } else {
            console.error("Mobile menu elements not found — check header HTML classes");
        }
    }

    // Toggle function: toggles 'active' class and changes icon between bars/times
    function toggleMenu() {
        const navMenu = document.querySelector(".nav-menu");
        const menuBtn = document.querySelector(".mobile-menu");
        
        if (!navMenu || !menuBtn) return;
        
        navMenu.classList.toggle("active");
        
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

    // Auto close mobile menu when any nav link is clicked (great for SPA-like navigation)
    function addAutoCloseOnNavClick() {
        const navLinks = document.querySelectorAll(".nav-menu a");
        const menuBtn = document.querySelector(".mobile-menu");
        const navMenu = document.querySelector(".nav-menu");
        
        if (navLinks.length && menuBtn && navMenu) {
            navLinks.forEach(link => {
                link.removeEventListener("click", closeMobileMenuHandler);
                link.addEventListener("click", closeMobileMenuHandler);
            });
        }
        
        function closeMobileMenuHandler(e) {
            // If menu is open, close it smoothly
            if (navMenu && navMenu.classList.contains("active")) {
                navMenu.classList.remove("active");
                const icon = menuBtn?.querySelector("i");
                if (icon && icon.classList.contains("fa-times")) {
                    icon.classList.remove("fa-times");
                    icon.classList.add("fa-bars");
                }
            }
        }
    }
    
    // Optional: Click outside to close (for better mobile experience)
    document.addEventListener("click", function(e) {
        const navMenu = document.querySelector(".nav-menu");
        const menuBtn = document.querySelector(".mobile-menu");
        if (!navMenu || !menuBtn) return;
        const isMobile = window.innerWidth <= 900;
        if (!isMobile) return;
        
        if (navMenu.classList.contains("active")) {
            // if clicked element is not inside nav menu and not the menu button itself
            if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                navMenu.classList.remove("active");
                const icon = menuBtn.querySelector("i");
                if (icon && icon.classList.contains("fa-times")) {
                    icon.classList.remove("fa-times");
                    icon.classList.add("fa-bars");
                }
            }
        }
    });
