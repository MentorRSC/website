document.addEventListener("DOMContentLoaded", () => {
    // Check if header already exists in the page
    const existingHeader = document.querySelector("header");
    const headerComponent = document.querySelector("site-header");
    
    if (existingHeader) {
        // Header already exists in the page, just setup the effects
        console.log("Header already exists in page");
        setupMobileMenu();
        setupAutoTitleDisplay();
    } 
    else if (headerComponent) {
        // Header component tag exists, fetch the header.html
        console.log("Fetching header from header.html");
        fetch("header.html")
            .then(res => res.text())
            .then(data => {
                headerComponent.innerHTML = data;
                // Wait a bit for the DOM to update
                setTimeout(() => {
                    setupMobileMenu();
                    setupAutoTitleDisplay();
                }, 100);
            })
            .catch(error => console.error("Error loading header:", error));
    }
    else {
        console.error("No header or site-header element found");
    }
});

function setupMobileMenu() {
    const menuBtn = document.querySelector(".mobile-menu");
    const navMenu = document.querySelector(".nav-menu");
    
    if (menuBtn && navMenu) {
        // Remove existing event listeners to avoid duplicates
        const newMenuBtn = menuBtn.cloneNode(true);
        menuBtn.parentNode.replaceChild(newMenuBtn, menuBtn);
        
        newMenuBtn.removeEventListener("click", toggleMenu);
        newMenuBtn.addEventListener("click", toggleMenu);
        console.log("Mobile menu initialized");
    } else {
        console.error("Mobile menu elements not found");
    }
}

function toggleMenu() {
    const navMenu = document.querySelector(".nav-menu");
    const menuBtn = document.querySelector(".mobile-menu");
    
    if (navMenu && menuBtn) {
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
}

function setupAutoTitleDisplay() {
    const nav = document.querySelector(".nav-menu");
    if (!nav) {
        console.error("Navigation menu not found");
        return;
    }

    // Get all navigation items that have spans (excluding the Join Now button)
    const navItems = Array.from(nav.querySelectorAll(".hover-code-css li a:not(.cta-button)"));
    
    if (navItems.length === 0) {
        console.error("No navigation items found");
        return;
    }

    console.log("Found navigation items:", navItems.length);

    // Clear any existing intervals
    if (window.autoTitleInterval) {
        clearInterval(window.autoTitleInterval);
        window.autoTitleInterval = null;
    }

    let currentIndex = 0;
    let isHovering = false;
    let hoverTimeout = null;

    // Store original content for each nav item
    const originalTexts = navItems.map(item => {
        const span = item.querySelector("span");
        
        // Add CSS to ensure spans are visible when needed
        if (span) {
            // Store original styles
            const originalDisplay = span.style.display || getComputedStyle(span).display;
            const originalVisibility = span.style.visibility || getComputedStyle(span).visibility;
            
            // Force spans to have proper styling
            span.style.transition = "all 0.3s ease";
            
            return {
                item: item,
                span: span,
                originalText: span.textContent,
                originalDisplay: originalDisplay,
                originalVisibility: originalVisibility
            };
        }
        return null;
    }).filter(item => item !== null); // Remove any null entries

    if (originalTexts.length === 0) {
        console.error("No spans found in navigation items");
        return;
    }

    // Function to show only the title at given index
    function showTitleAtIndex(index) {
        // Hide all titles first
        originalTexts.forEach(({ span }) => {
            if (span) {
                span.style.display = "none";
                span.style.visibility = "hidden";
            }
        });
        
        // Show the selected title
        const selected = originalTexts[index];
        if (selected && selected.span) {
            selected.span.style.display = "inline-block";
            selected.span.style.visibility = "visible";
            // Add a temporary highlight effect
            selected.span.style.backgroundColor = "rgba(0, 123, 255, 0.1)";
            selected.span.style.padding = "2px 4px";
            selected.span.style.borderRadius = "4px";
            setTimeout(() => {
                if (selected.span) {
                    selected.span.style.backgroundColor = "";
                    selected.span.style.padding = "";
                    selected.span.style.borderRadius = "";
                }
            }, 300);
            console.log("Showing:", selected.originalText);
        }
    }

    // Function to reset all titles (show all normally)
    function resetAllTitles() {
        originalTexts.forEach(({ span, originalDisplay, originalVisibility }) => {
            if (span) {
                span.style.display = originalDisplay || "inline";
                span.style.visibility = originalVisibility || "visible";
                span.style.backgroundColor = "";
                span.style.padding = "";
                span.style.borderRadius = "";
            }
        });
    }

    // Function to start auto rotation
    function startAutoRotation() {
        if (window.autoTitleInterval) {
            clearInterval(window.autoTitleInterval);
            window.autoTitleInterval = null;
        }
        
        if (!isHovering) {
            console.log("Starting auto rotation");
            
            // Initially hide all titles
            originalTexts.forEach(({ span }) => {
                if (span) {
                    span.style.display = "none";
                    span.style.visibility = "hidden";
                }
            });
            
            // Start with first item
            currentIndex = 0;
            showTitleAtIndex(currentIndex);
            
            // Rotate every 3 seconds
            window.autoTitleInterval = setInterval(() => {
                if (!isHovering) {
                    currentIndex = (currentIndex + 1) % originalTexts.length;
                    showTitleAtIndex(currentIndex);
                }
            }, 3000);
        }
    }

    // Function to stop auto rotation and reset
    function stopAutoRotation() {
        if (window.autoTitleInterval) {
            clearInterval(window.autoTitleInterval);
            window.autoTitleInterval = null;
        }
        resetAllTitles();
    }

    // Remove existing event listeners by cloning and replacing
    originalTexts.forEach((item, index) => {
        if (!item.item) return;
        
        // Clone and replace to remove old event listeners
        const newItem = item.item.cloneNode(true);
        item.item.parentNode.replaceChild(newItem, item.item);
        
        // Update the references
        originalTexts[index].item = newItem;
        originalTexts[index].span = newItem.querySelector("span");
        
        if (!originalTexts[index].span) return;
        
        // Mouse enter - stop auto rotation and show only this item's title
        newItem.addEventListener("mouseenter", () => {
            console.log("Hovering on:", originalTexts[index].originalText);
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
            
            isHovering = true;
            stopAutoRotation();
            
            // Hide all titles
            originalTexts.forEach(({ span }) => {
                if (span) {
                    span.style.display = "none";
                    span.style.visibility = "hidden";
                }
            });
            
            // Show only the hovered item's title
            const hoveredItem = originalTexts[index];
            if (hoveredItem && hoveredItem.span) {
                hoveredItem.span.style.display = "inline-block";
                hoveredItem.span.style.visibility = "visible";
            }
        });
        
        // Mouse leave - restart auto rotation after a short delay
        newItem.addEventListener("mouseleave", () => {
            hoverTimeout = setTimeout(() => {
                isHovering = false;
                stopAutoRotation();
                startAutoRotation();
            }, 300);
        });
    });

    // Start the auto rotation
    startAutoRotation();
    
    console.log("Auto title display initialized successfully with", originalTexts.length, "items");
    
    // Add some CSS to ensure proper display
    const style = document.createElement('style');
    style.textContent = `
        .nav-menu .hover-code-css li a span {
            transition: all 0.3s ease;
            display: inline-block;
        }
        .nav-menu .hover-code-css li a {
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .nav-menu .hover-code-css li a i {
            flex-shrink: 0;
        }
    `;
    document.head.appendChild(style);
}
