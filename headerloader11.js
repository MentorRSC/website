document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("site-header");

    if (header) {
        fetch("header.html")
            .then(res => res.text())
            .then(data => {
                header.innerHTML = data;
                setupMobileMenu();
                setupAutoTitleDisplay();
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
        console.log("Mobile menu initialized");
    } else {
        console.error("Mobile menu elements not found");
    }
}

function toggleMenu() {
    const navMenu = document.querySelector(".nav-menu");
    const menuBtn = document.querySelector(".mobile-menu");
    
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

function setupAutoTitleDisplay() {
    const nav = document.querySelector(".nav-menu");
    if (!nav) {
        console.error("Navigation menu not found");
        return;
    }

    // Get all navigation items (excluding the button/CTA)
    const navItems = Array.from(nav.querySelectorAll("li:not(:has(.cta-button)) a, li > a:not(.cta-button)"));
    
    if (navItems.length === 0) {
        console.error("No navigation items found");
        return;
    }

    let autoInterval = null;
    let currentIndex = 0;
    let isHovering = false;
    let hoverTimeout = null;

    // Store original content for each nav item
    const originalTexts = navItems.map(item => {
        // Try to find span first, if not, use the text nodes
        let span = item.querySelector("span");
        let textNode = null;
        let originalText = "";
        
        if (span) {
            originalText = span.textContent;
        } else {
            // Get text content excluding icon text
            const icon = item.querySelector("i");
            let text = item.textContent;
            if (icon) {
                text = text.replace(icon.textContent, "").trim();
            }
            originalText = text.trim();
            
            // Create a span if it doesn't exist
            span = document.createElement("span");
            span.textContent = originalText;
            // Insert span after the icon or at the end
            if (icon && icon.nextSibling) {
                item.insertBefore(span, icon.nextSibling);
            } else if (icon) {
                item.appendChild(span);
            } else {
                item.appendChild(span);
            }
        }
        
        return {
            item: item,
            span: span,
            originalText: originalText,
            originalDisplay: span.style.display
        };
    });

    // Function to show only the title at given index
    function showTitleAtIndex(index) {
        console.log("Showing title at index:", index, "Text:", originalTexts[index]?.originalText);
        
        // Hide all titles first
        originalTexts.forEach(({ span }) => {
            if (span) {
                span.style.display = "none";
            }
        });
        
        // Show the selected title
        const selected = originalTexts[index];
        if (selected && selected.span) {
            selected.span.style.display = "inline-block";
        }
    }

    // Function to reset all titles (show all normally)
    function resetAllTitles() {
        originalTexts.forEach(({ span, originalDisplay }) => {
            if (span) {
                span.style.display = originalDisplay || "inline";
            }
        });
    }

    // Function to start auto rotation
    function startAutoRotation() {
        if (autoInterval) {
            clearInterval(autoInterval);
        }
        
        if (!isHovering) {
            console.log("Starting auto rotation");
            
            // Initially hide all titles
            originalTexts.forEach(({ span }) => {
                if (span) {
                    span.style.display = "none";
                }
            });
            
            // Start with first item
            currentIndex = 0;
            showTitleAtIndex(currentIndex);
            
            // Rotate every 3 seconds
            autoInterval = setInterval(() => {
                if (!isHovering) {
                    currentIndex = (currentIndex + 1) % originalTexts.length;
                    showTitleAtIndex(currentIndex);
                    console.log("Rotating to index:", currentIndex);
                }
            }, 3000);
        }
    }

    // Function to stop auto rotation and reset
    function stopAutoRotation() {
        if (autoInterval) {
            clearInterval(autoInterval);
            autoInterval = null;
        }
        resetAllTitles();
    }

    // Add hover event listeners to each nav item
    navItems.forEach((item, index) => {
        // Mouse enter - stop auto rotation and show only this item's title
        item.addEventListener("mouseenter", () => {
            console.log("Hovering on item:", index);
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
            
            isHovering = true;
            stopAutoRotation();
            
            // Hide all titles
            originalTexts.forEach(({ span }) => {
                if (span) {
                    span.style.display = "none";
                }
            });
            
            // Show only the hovered item's title
            const hoveredItem = originalTexts[index];
            if (hoveredItem && hoveredItem.span) {
                hoveredItem.span.style.display = "inline-block";
            }
        });
        
        // Mouse leave - restart auto rotation after a short delay
        item.addEventListener("mouseleave", () => {
            hoverTimeout = setTimeout(() => {
                isHovering = false;
                stopAutoRotation();
                startAutoRotation();
            }, 300);
        });
    });

    // Also handle hover on the entire nav container
    nav.addEventListener("mouseenter", () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }
    });
    
    nav.addEventListener("mouseleave", () => {
        hoverTimeout = setTimeout(() => {
            isHovering = false;
            stopAutoRotation();
            startAutoRotation();
        }, 300);
    });

    // Start the auto rotation
    startAutoRotation();
    
    console.log("Auto title display initialized with", originalTexts.length, "items");
    console.log("Nav items found:", navItems.length);
}
