document.addEventListener("DOMContentLoaded", () => {
    // Check if header already exists in the page
    const existingHeader = document.querySelector("header");
    const headerComponent = document.querySelector("site-header");
    
    if (existingHeader) {
        console.log("Header already exists in page");
        setupMobileMenu();
        setupAutoTitleEffect();
    } 
    else if (headerComponent) {
        console.log("Fetching header from header.html");
        fetch("header.html")
            .then(res => res.text())
            .then(data => {
                headerComponent.innerHTML = data;
                setTimeout(() => {
                    setupMobileMenu();
                    setupAutoTitleEffect();
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
        const newMenuBtn = menuBtn.cloneNode(true);
        menuBtn.parentNode.replaceChild(newMenuBtn, menuBtn);
        
        newMenuBtn.removeEventListener("click", toggleMenu);
        newMenuBtn.addEventListener("click", toggleMenu);
        console.log("Mobile menu initialized");
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

function setupAutoTitleEffect() {
    const nav = document.querySelector(".nav-menu");
    if (!nav) {
        console.error("Navigation menu not found");
        return;
    }

    // Get all navigation items (excluding the Join Now button)
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

    // FIRST: Hide ALL original spans permanently
    navItems.forEach(item => {
        const span = item.querySelector("span");
        if (span) {
            span.style.display = "none"; // Permanently hide original text
        }
    });

    // Store items and create tooltips
    const items = navItems.map(item => {
        const icon = item.querySelector("i");
        const span = item.querySelector("span");
        const originalText = span ? span.textContent : "";
        
        // Create tooltip element
        const tooltip = document.createElement("div");
        tooltip.textContent = originalText;
        tooltip.className = "nav-tooltip";
        tooltip.style.cssText = `
            position: absolute;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            white-space: nowrap;
            z-index: 1000;
            pointer-events: none;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            margin-top: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            opacity: 0;
            transition: opacity 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        `;
        
        // Add arrow to tooltip
        const arrow = document.createElement("div");
        arrow.style.cssText = `
            content: '';
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-width: 6px;
            border-style: solid;
            border-color: transparent transparent #667eea transparent;
        `;
        tooltip.appendChild(arrow);
        
        // Make parent li position relative
        const parentLi = item.closest("li");
        if (parentLi) {
            parentLi.style.position = "relative";
            parentLi.appendChild(tooltip);
        }
        
        return {
            item: item,
            icon: icon,
            tooltip: tooltip,
            originalText: originalText,
            parentLi: parentLi
        };
    });

    // Function to show tooltip for given index (only ONE at a time)
    function showTooltipAtIndex(index) {
        // Hide ALL tooltips first
        items.forEach(item => {
            if (item.tooltip) {
                item.tooltip.style.opacity = "0";
            }
            // Reset icon scale
            if (item.icon) {
                item.icon.style.transform = "scale(1)";
                item.icon.style.transition = "transform 0.3s ease";
            }
        });
        
        // Show ONLY the selected tooltip
        const selected = items[index];
        if (selected && selected.tooltip) {
            selected.tooltip.style.opacity = "1";
            
            // Add pulsing effect to icon
            if (selected.icon) {
                selected.icon.style.transform = "scale(1.2)";
                setTimeout(() => {
                    if (selected.icon) {
                        selected.icon.style.transform = "scale(1)";
                    }
                }, 300);
            }
            
            console.log("Showing:", selected.originalText);
        }
    }

    // Function to hide all tooltips
    function hideAllTooltips() {
        items.forEach(item => {
            if (item.tooltip) {
                item.tooltip.style.opacity = "0";
            }
            if (item.icon) {
                item.icon.style.transform = "scale(1)";
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
            
            // Start with first item
            currentIndex = 0;
            showTooltipAtIndex(currentIndex);
            
            // Rotate every 3 seconds
            window.autoTitleInterval = setInterval(() => {
                if (!isHovering) {
                    currentIndex = (currentIndex + 1) % items.length;
                    showTooltipAtIndex(currentIndex);
                }
            }, 3000);
        }
    }

    // Function to stop auto rotation
    function stopAutoRotation() {
        if (window.autoTitleInterval) {
            clearInterval(window.autoTitleInterval);
            window.autoTitleInterval = null;
        }
        hideAllTooltips();
    }

    // Add hover event listeners
    items.forEach((item, index) => {
        if (!item.item) return;
        
        // Clone and replace to remove old event listeners
        const newItem = item.item.cloneNode(true);
        item.item.parentNode.replaceChild(newItem, item.item);
        
        // Update references
        items[index].item = newItem;
        items[index].icon = newItem.querySelector("i");
        
        // Make sure span is hidden on the new item too
        const newSpan = newItem.querySelector("span");
        if (newSpan) {
            newSpan.style.display = "none";
        }
        
        // Mouse enter - show only this item's tooltip
        newItem.addEventListener("mouseenter", () => {
            console.log("Hovering on:", items[index].originalText);
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
            
            isHovering = true;
            stopAutoRotation();
            
            // Hide all tooltips first
            items.forEach(i => {
                if (i.tooltip) {
                    i.tooltip.style.opacity = "0";
                }
            });
            
            // Show only the hovered item's tooltip
            if (items[index].tooltip) {
                items[index].tooltip.style.opacity = "1";
            }
        });
        
        // Mouse leave - restart auto rotation
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
    
    console.log("Auto title effect initialized - showing ONE title at a time");
    
    // Add CSS for better styling
    const style = document.createElement('style');
    style.textContent = `
        .nav-menu .hover-code-css li {
            position: relative;
        }
        .nav-menu .hover-code-css li a {
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .nav-menu .hover-code-css li a i {
            transition: transform 0.3s ease;
        }
        .nav-menu .hover-code-css li a span {
            display: none !important; /* Force hide original text */
        }
    `;
    document.head.appendChild(style);
}
