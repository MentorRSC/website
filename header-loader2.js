   document.addEventListener("DOMContentLoaded", () => {
        const headerElement = document.querySelector("site-header");

        if (headerElement) {
            // Directly inject the header HTML as provided (with all links, icons, and structure).
            // This matches the original "header.html" content, with proper classes.
            const headerMarkup = `
    <header>
        <div class="container header-container">
            <a href="index.html" class="logo">
                <i class="fas fa-lightbulb"></i>
                <h1>Innovation<span>Hub</span></h1>
            </a>
            <div class="mobile-menu">
                <i class="fas fa-bars"></i>
            </div>
            <nav class="nav-menu">
                <ul class="hover-code-css">
                    <li><a href="index.html"><i class="fa-solid fa-house"></i> <span>Home</span></a></li>
                    <li><a href="resources.html"><i class="fa-solid fa-book"></i> <span>Resources</span></a></li>
                    <li><a href="projects.html"><i class="fa-solid fa-code-branch"></i> <span>Projects</span></a></li>
                    <li><a href="puzzles.html"><i class="fa-solid fa-puzzle-piece"></i> <span>Puzzles</span></a></li>
                    <li><a href="members.html"><i class="fa-solid fa-users"></i> <span>Members</span></a></li>
                    <li><a href="funding.html"><i class="fa-solid fa-hand-holding-dollar"></i> <span>Investment</span></a></li>
                    <li><a href="linktree.html"><i class="fa-solid fa-share-nodes"></i> <span>Social Media</span></a></li>
                    <li><a href="joiningform.html" class="cta-button">Join Now</a></li>
                </ul>
            </nav>
        </div>
    </header>
            `;
            headerElement.innerHTML = headerMarkup;
            
            // After injection, setup mobile menu functionality (as defined)
            setupMobileMenu();
            
            // Additionally, ensure that any navigation link closes mobile menu on click (good UX)
            addAutoCloseOnNavClick();
        } else {
            console.error("site-header element missing — ensure <site-header> exists.");
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
