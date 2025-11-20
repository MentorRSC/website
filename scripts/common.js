// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // Animation for cards on scroll
    const animateOnScroll = () => {
        const cards = document.querySelectorAll('.card, .feature-card, .program-card, .resource-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s, transform 0.5s';
            observer.observe(card);
        });
    };

    animateOnScroll();
});

// Chemical search and filter functionality
const chemicalFunctions = {
    chemicals: [],
    
    init: function(chemicalsData) {
        this.chemicals = chemicalsData;
        this.setupEventListeners();
        this.renderChemicals();
    },
    
    setupEventListeners: function() {
        const searchInput = document.getElementById('searchInput');
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilter(e.target);
            });
        });
    },
    
    handleSearch: function(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const filtered = this.chemicals.filter(chemical => 
            chemical.name.toLowerCase().includes(term)
        );
        this.renderChemicals(filtered);
    },
    
    handleFilter: function(button) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const filter = button.getAttribute('data-filter');
        if (filter === 'all') {
            this.renderChemicals();
        } else {
            const filtered = this.chemicals.filter(chemical => chemical.category === filter);
            this.renderChemicals(filtered);
        }
    },
    
    renderChemicals: function(filteredChemicals = this.chemicals) {
        const grid = document.getElementById('chemicalsGrid');
        
        if (!grid) return;
        
        if (filteredChemicals.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No chemicals found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = filteredChemicals.map(chemical => `
            <div class="chemical-card" data-category="${chemical.category}">
                <div class="chemical-name">${chemical.name}</div>
                <div class="chemical-category">${this.getCategoryDisplayName(chemical.category)}</div>
                <div class="chemical-meta">
                    <span class="hazard-level hazard-${chemical.hazard}">
                        ${chemical.hazard.toUpperCase()} HAZARD
                    </span>
                    <span class="stock-status ${chemical.stock}">
                        ${chemical.stock === 'in-stock' ? 'In Stock' : 'Low Stock'}
                    </span>
                </div>
            </div>
        `).join('');
    },
    
    getCategoryDisplayName: function(category) {
        const categoryMap = {
            'acid': 'Acid',
            'base': 'Base',
            'salt': 'Salt',
            'organic': 'Organic Compound',
            'reagent': 'Laboratory Reagent',
            'oxidizer': 'Oxidizing Agent',
            'element': 'Chemical Element',
            'stain': 'Staining Agent',
            'metal': 'Metal',
            'indicator': 'pH Indicator',
            'polymer': 'Polymer',
            'oxide': 'Metal Oxide',
            'dye': 'Dye',
            'biochemical': 'Biochemical',
            'natural': 'Natural Product'
        };
        return categoryMap[category] || category;
    }
};
