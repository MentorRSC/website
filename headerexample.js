<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
    <title>InnovationHub | Dynamic Header Demo</title>
    <!-- Font Awesome 6 (free CDN) for icons: bars, times, house, book, etc -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(145deg, #f6f9fc 0%, #eef2f5 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* ========== HEADER STYLES (matching modern hub) ========== */
        site-header {
            display: block;
            width: 100%;
        }

        header {
            background: #0a192f;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
            position: sticky;
            top: 0;
            z-index: 1000;
            backdrop-filter: blur(0px);
            border-bottom: 1px solid rgba(100, 200, 255, 0.2);
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.9rem 2rem;
            flex-wrap: wrap;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            text-decoration: none;
            transition: transform 0.2s ease;
        }
        .logo:hover {
            transform: scale(1.02);
        }
        .logo i {
            font-size: 2.2rem;
            color: #ffd966;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }
        .logo h1 {
            font-size: 1.8rem;
            font-weight: 700;
            letter-spacing: -0.5px;
            background: linear-gradient(135deg, #ffffff, #a0c4ff);
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
        }
        .logo h1 span {
            background: linear-gradient(135deg, #ffd966, #ffb347);
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            font-weight: 800;
        }

        /* navigation menu (desktop) */
        .nav-menu ul {
            display: flex;
            list-style: none;
            gap: 0.5rem;
            align-items: center;
            flex-wrap: wrap;
        }
        .nav-menu li {
            position: relative;
        }
        .nav-menu a {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 0.6rem 1.1rem;
            font-weight: 500;
            font-size: 1rem;
            color: #e6f1ff;
            text-decoration: none;
            border-radius: 40px;
            transition: all 0.25s;
            background: transparent;
        }
        .nav-menu a i {
            font-size: 1.1rem;
            color: #64ffda;
            transition: transform 0.2s;
        }
        .nav-menu a:hover {
            background: rgba(100, 255, 218, 0.12);
            color: #ffffff;
            transform: translateY(-2px);
        }
        .nav-menu a:hover i {
            transform: scale(1.1);
            color: #ffd966;
        }
        .cta-button {
            background: linear-gradient(95deg, #ffb347, #ff6b4a);
            color: white !important;
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(255, 107, 74, 0.3);
            border: none;
            padding: 0.6rem 1.4rem !important;
        }
        .cta-button i {
            color: white !important;
        }
        .cta-button:hover {
            background: linear-gradient(95deg, #ff9f2e, #ff5a35);
            transform: translateY(-2px);
            box-shadow: 0 8px 18px rgba(255, 107, 74, 0.4);
        }

        /* mobile menu button */
        .mobile-menu {
            display: none;
            font-size: 1.8rem;
            cursor: pointer;
            color: #ffd966;
            background: rgba(255,255,255,0.08);
            width: 48px;
            height: 48px;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s;
        }
        .mobile-menu:hover {
            background: rgba(255, 217, 102, 0.2);
            transform: scale(1.02);
        }

        /* mobile nav styles */
        @media (max-width: 920px) {
            .header-container {
                padding: 0.8rem 1.2rem;
            }
            .mobile-menu {
                display: flex;
            }
            .nav-menu {
                position: fixed;
                top: 75px;
                left: -100%;
                width: 80%;
                max-width: 360px;
                height: calc(100vh - 75px);
                background: #0f212e;
                backdrop-filter: blur(12px);
                background: rgba(10, 25, 47, 0.98);
                box-shadow: 4px 0 28px rgba(0, 0, 0, 0.3);
                transition: left 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.1);
                z-index: 999;
                padding: 2rem 1.5rem;
                border-right: 1px solid #2c4c6e;
                overflow-y: auto;
            }
            .nav-menu.active {
                left: 0;
            }
            .nav-menu ul {
                flex-direction: column;
                align-items: stretch;
                gap: 0.8rem;
            }
            .nav-menu li a {
                padding: 0.9rem 1rem;
                font-size: 1.1rem;
                justify-content: flex-start;
                border-radius: 20px;
            }
            .cta-button {
                text-align: center;
                justify-content: center;
                margin-top: 0.5rem;
            }
            /* overlay effect when menu open (optional body class) */
        }

        /* main content dummy section - to show page context */
        .hero-section {
            max-width: 1100px;
            margin: 3rem auto;
            padding: 2rem;
            background: white;
            border-radius: 2rem;
            box-shadow: 0 20px 35px -12px rgba(0,0,0,0.1);
            text-align: center;
        }
        .hero-section h2 {
            font-size: 2.5rem;
            background: linear-gradient(145deg, #0a192f, #1c3e55);
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            margin-bottom: 1rem;
        }
        .card-grid {
            display: flex;
            gap: 2rem;
            flex-wrap: wrap;
            justify-content: center;
            margin-top: 2.5rem;
        }
        .card {
            background: #fefefe;
            border-radius: 32px;
            padding: 1.5rem;
            width: 260px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.05);
            transition: all 0.3s;
            border: 1px solid #e2edf7;
        }
        .card i {
            font-size: 2.8rem;
            color: #ffb347;
            margin-bottom: 1rem;
        }
        footer {
            text-align: center;
            margin-top: auto;
            padding: 2rem;
            background: #0a192f;
            color: #8eacc9;
            font-size: 0.9rem;
        }
        @media (max-width: 640px) {
            .container {
                padding: 0 1rem;
            }
            .logo h1 {
                font-size: 1.3rem;
            }
            .logo i {
                font-size: 1.6rem;
            }
        }
    </style>
</head>
<body>

<!-- The custom element that will hold the dynamic header -->
<site-header></site-header>

<!-- main page content - just to show the hub context -->
<main>
    <div class="hero-section container">
        <h2>Where Ideas Build the Future</h2>
        <p style="font-size: 1.2rem; color: #2c3e50;">Innovation, collaboration, and breakthrough projects — all in one ecosystem.</p>
        <div class="card-grid">
            <div class="card"><i class="fas fa-microchip"></i><h3>AI Labs</h3><p>Explore cutting-edge research & ML models</p></div>
            <div class="card"><i class="fas fa-rocket"></i><h3>Startup Incubator</h3><p>From idea to impact, we fund innovation</p></div>
            <div class="card"><i class="fas fa-brain"></i><h3>Puzzle Challenges</h3><p>Sharpen skills with community riddles</p></div>
        </div>
    </div>
</main>

<footer>
    <p>© 2026 InnovationHub — where creators connect. Open source & community driven.</p>
</footer>

<script>
    // --------------------------------------------------------------
    // COMBINED SCRIPT: DOMContentLoaded + fetch header + mobile menu
    // --------------------------------------------------------------
    document.addEventListener("DOMContentLoaded", () => {
        const headerPlaceholder = document.querySelector("site-header");

        if (headerPlaceholder) {
            // Instead of loading external header.html, we directly inject the header markup 
            // (since we want a self-contained file that includes the exact header structure from the prompt).
            // However the requirement: "combine and give header.html" — means provide fully working
            // page with the header loaded dynamically or statically. But we also want robustness for mobile menu.
            // To perfectly reflect the original pattern and ensure no CORS / extra network, we inject the
            // exact HTML string that matches the <header> described. But also we keep fetching pattern style?
            // The user gave the header markup. So we'll embed it directly. But to respect the script pattern,
            // we'll simulate "fetch" like behavior but from inline string. However that would be overkill.
            // Better: directly set innerHTML to the given header structure and then initialize mobile menu.
            // But also ensure that if someone later wanted to replace with fetch, we keep flexibility.
            // I'll embed the header HTML exactly as given (plus small improvements to match the class naming)
            const headerHTML = `
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
            // Insert header
            headerPlaceholder.innerHTML = headerHTML;
            // After header is in DOM, setup mobile menu event listeners
            setupMobileMenu();
        } else {
            console.error("site-header element not found!");
        }
    });

    // Enhanced setupMobileMenu: ensures that we correctly bind click toggling
    // and also handles dynamic icon swapping as defined in toggleMenu.
    function setupMobileMenu() {
        const menuBtn = document.querySelector(".mobile-menu");
        const navMenu = document.querySelector(".nav-menu");
        
        if (menuBtn && navMenu) {
            // Remove any previous listeners to avoid duplicate bindings (in case of re-run)
            menuBtn.removeEventListener("click", toggleMenu);
            menuBtn.addEventListener("click", toggleMenu);
            // Also ensure that if window resize crosses desktop threshold, menu auto-closes for better UX
            window.addEventListener("resize", function handleResize() {
                if (window.innerWidth > 920) {
                    if (navMenu.classList.contains("active")) {
                        navMenu.classList.remove("active");
                        // also reset icon to bars if needed
                        const icon = menuBtn.querySelector("i");
                        if (icon && icon.classList.contains("fa-times")) {
                            icon.classList.remove("fa-times");
                            icon.classList.add("fa-bars");
                        }
                    }
                }
            });
            console.log("Mobile menu initialized & ready");
        } else {
            console.error("Mobile menu elements not found — check if header loaded correctly");
        }
    }

    // toggleMenu: handles active class and icon swap between fa-bars / fa-times
    function toggleMenu() {
        const navMenu = document.querySelector(".nav-menu");
        const menuBtn = document.querySelector(".mobile-menu");
        
        if (!navMenu || !menuBtn) return;
        
        navMenu.classList.toggle("active");
        
        // Optional: Change icon (Font Awesome 6 / 5 both support)
        const icon = menuBtn.querySelector("i");
        if (icon) {
            if (navMenu.classList.contains("active")) {
                // if menu open: show "X" (times)
                icon.classList.remove("fa-bars");
                icon.classList.add("fa-times");
            } else {
                icon.classList.remove("fa-times");
                icon.classList.add("fa-bars");
            }
        }
    }

    // Additionally, ensure that clicking on a nav link closes the mobile menu automatically 
    // (great for UX). We'll delegate event after menu is ready, but we can also add after setupMobileMenu.
    // This is an improvement while staying within the spirit of original code.
    function addAutoCloseOnNavClick() {
        const navLinks = document.querySelectorAll(".nav-menu a");
        const menuBtn = document.querySelector(".mobile-menu");
        const navMenu = document.querySelector(".nav-menu");
        if (navLinks.length && menuBtn && navMenu) {
            navLinks.forEach(link => {
                link.removeEventListener("click", closeMobileMenu);
                link.addEventListener("click", closeMobileMenu);
            });
        }
        function closeMobileMenu() {
            if (navMenu.classList.contains("active")) {
                navMenu.classList.remove("active");
                const icon = menuBtn?.querySelector("i");
                if (icon && icon.classList.contains("fa-times")) {
                    icon.classList.remove("fa-times");
                    icon.classList.add("fa-bars");
                }
            }
        }
    }
    
    // Override setupMobileMenu to also call auto-close after bindings.
    // Preserve original but enhance:
    const originalSetup = setupMobileMenu;
    window.setupMobileMenu = function() {
        originalSetup();
        addAutoCloseOnNavClick();
    };
    // Re-run after any potential dynamic? But we already run setupMobileMenu after header injection.
    // To avoid duplicate we'll just call enhanced version after injection. However we need to replace the global.
    // For safety, override the function reference after declaration, but careful about hoisting.
    // Better: create a final initializer.
    // Patch: after header insertion, we called original setupMobileMenu; then we can manually add auto-close.
    // However the best method: extend the logic inside a DOM watch.
    // Let's elegantly override after script execution:
    // we redefine but we also call it again from the DOMContentLoaded? Not needed, we can call addAutoClose after setup.
    // Since we control the whole flow, inside DOMContentLoaded after setupMobileMenu() we call addAutoCloseOnNavClick().
    // That's clean.
    
    // But we already defined setupMobileMenu which doesn't include auto-close. I will now add additional after-load.
    document.addEventListener("DOMContentLoaded", function finalEnhance() {
        // ensure that if site-header already filled, we also add auto-close after a microtask.
        // Since the header is set synchronously inside the first DOMContentLoaded, we can also call after.
        // But to avoid race, we use a small timeout or MutationObserver? simpler: use a second check after setTimeout.
        // But the setupMobileMenu inside our DOMContentLoaded runs, then we call attachAutoClose.
        setTimeout(() => {
            addAutoCloseOnNavClick();
            // Also fix any edge: if the navMenu is present but icons are not properly matched after manual toggle we sync.
        }, 50);
    });
    
    // For completeness, if any clicks on document to close when clicking outside (optional but nice)
    document.addEventListener("click", function(e) {
        const navMenu = document.querySelector(".nav-menu");
        const menuBtn = document.querySelector(".mobile-menu");
        if (!navMenu || !menuBtn) return;
        const isMobileView = window.innerWidth <= 920;
        if (!isMobileView) return;
        if (navMenu.classList.contains("active")) {
            // if clicked outside both navMenu and mobile-menu button, close
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
</script>
</body>
</html>
