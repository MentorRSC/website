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

    // Store original elements for each nav item
    const items = navItems.map(item => {
        const icon = item.querySelector("i");
        const span = item.querySelector("span");
        const originalText = span ? span.textContent : "";
        
        // Store original HTML
        const originalHTML = item.innerHTML;
        
        return {
            item: item,
            icon: icon,
            span: span,
            originalText: originalText,
            originalHTML: originalHTML,
            isReplaced: false
        };
    });

    // Function to replace icon with text for a specific item
    function replaceIconWithText(index) {
        // First, restore ALL items to original state
        items.forEach(item => {
            if (item.isReplaced) {
                item.item.innerHTML = item.originalHTML;
                item.isReplaced = false;
                // Re-capture the icon and span references
                item.icon = item.item.querySelector("i");
                item.span = item.item.querySelector("span");
            }
        });
        
        // Now replace ONLY the selected item
        const selected = items[index];
        if (selected && selected.icon && selected.span) {
            // Hide icon and show text
            selected.icon.style.display = "none";
            selected.span.style.display = "inline";
            selected.span.style.marginLeft = "0";
            selected.isReplaced = true;
            console.log("Showing title for:", selected.originalText);
        }
    }

    // Function to restore all items to original (icons visible)
    function restoreAllIcons() {
        items.forEach(item => {
            if (item.isReplaced) {
                item.item.innerHTML = item.originalHTML;
                item.isReplaced = false;
                // Re-capture references
                item.icon = item.item.querySelector("i");
                item.span = item.item.querySelector("span");
            }
            // Ensure icons are visible
            if (item.icon) {
                item.icon.style.display = "";
            }
            if (item.span) {
                item.span.style.display = "";
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
            console.log("Starting auto rotation - replacing icons with titles");
            
            // Start with first item
            currentIndex = 0;
            replaceIconWithText(currentIndex);
            
            // Rotate every 3 seconds
            window.autoTitleInterval = setInterval(() => {
                if (!isHovering) {
                    currentIndex = (currentIndex + 1) % items.length;
                    replaceIconWithText(currentIndex);
                }
            }, 3000);
        }
    }

    // Function to stop auto rotation and restore all icons
    function stopAutoRotation() {
        if (window.autoTitleInterval) {
            clearInterval(window.autoTitleInterval);
            window.autoTitleInterval = null;
        }
        restoreAllIcons();
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
        items[index].span = newItem.querySelector("span");
        items[index].originalHTML = newItem.innerHTML;
        
        // Mouse enter - show this item's title and stop auto
        newItem.addEventListener("mouseenter", () => {
            console.log("Hovering on:", items[index].originalText);
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
            
            isHovering = true;
            stopAutoRotation();
            
            // Show only the hovered item's title (replace its icon)
            items.forEach((i, idx) => {
                if (idx === index) {
                    if (i.icon && i.span) {
                        i.icon.style.display = "none";
                        i.span.style.display = "inline";
                        i.isReplaced = true;
                    }
                } else {
                    // Restore others to original
                    if (i.isReplaced) {
                        i.item.innerHTML = i.originalHTML;
                        i.isReplaced = false;
                        i.icon = i.item.querySelector("i");
                        i.span = i.item.querySelector("span");
                    }
                    if (i.icon) {
                        i.icon.style.display = "";
                    }
                    if (i.span) {
                        i.span.style.display = "";
                    }
                }
            });
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
    
    console.log("Auto title effect initialized - icons will be replaced with titles one by one");
    
    // Add CSS for smooth transitions
    const style = document.createElement('style');
    style.textContent = `
        .nav-menu .hover-code-css li a i,
        .nav-menu .hover-code-css li a span {
            transition: all 0.3s ease;
        }
        .nav-menu .hover-code-css li a span {
            display: inline-block;
        }
    `;
    document.head.appendChild(style);
}
