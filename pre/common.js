/* =====================================================
   common.js — Innovation Hub
   Handles: Loader, Cursor, Scroll Progress, Reveal,
            Counters, Particles, Mobile Menu,
            Home Link Redirect, Chemical Functions
===================================================== */

/* =====================================================
   PAGE LOADER
===================================================== */
window.addEventListener('load', () => {
    const loader = document.getElementById('pageLoader');
    const fill = document.getElementById('loaderFill');
    if (!loader || !fill) return;
    fill.style.width = '100%';
    setTimeout(() => {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 700);
    }, 900);
});

/* =====================================================
   CUSTOM CURSOR
===================================================== */
(function initCursor() {
    const dot  = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top  = mouseY + 'px';
    });

    function animateRing() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        ring.style.left = ringX + 'px';
        ring.style.top  = ringY + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('a, button, .card, [onclick]').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
})();

/* =====================================================
   SCROLL PROGRESS BAR & HEADER STATE
===================================================== */
(function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgress');
    const header      = document.getElementById('siteHeader');

    window.addEventListener('scroll', () => {
        if (progressBar) {
            const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            progressBar.style.width = scrolled + '%';
        }
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 60);
        }
    }, { passive: true });
})();

/* =====================================================
   SCROLL REVEAL (IntersectionObserver)
===================================================== */
(function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
        observer.observe(el);
    });
})();

/* =====================================================
   COUNTER ANIMATION
===================================================== */
(function initCounters() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el     = entry.target;
            const target = parseInt(el.getAttribute('data-target'), 10);
            let current  = 0;
            const step   = Math.ceil(target / 60);

            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                el.textContent = current + '+';
            }, 25);

            observer.unobserve(el);
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.counter').forEach(el => observer.observe(el));
})();

/* =====================================================
   HERO PARTICLES
===================================================== */
(function initParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.setProperty('--dur',   (6 + Math.random() * 8) + 's');
        p.style.setProperty('--delay', (Math.random() * 8) + 's');
        p.style.setProperty('--drift', ((Math.random() - 0.5) * 60) + 'px');
        const size = (2 + Math.random() * 3) + 'px';
        p.style.width  = size;
        p.style.height = size;
        container.appendChild(p);
    }
})();

/* =====================================================
   MOBILE MENU
===================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('mobileMenu');
    const navMenu       = document.getElementById('navMenu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => navMenu.classList.toggle('active'));
    }

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => navMenu && navMenu.classList.remove('active'));
    });
});

/* =====================================================
   CARD ENTRANCE ANIMATION (original logic)
===================================================== */
(function initCardAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity   = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .feature-card, .program-card, .resource-card').forEach(card => {
        observer.observe(card);
    });
})();

/* =====================================================
   HOME LINK REDIRECT (original logic)
===================================================== */
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const homeLink = document.querySelector('.nav-menu a[href="index.html"]');
        if (homeLink) {
            homeLink.href = 'https://rscpcalicut.org.in/';
        }
    }, 100);
});

/* =====================================================
   CHEMICAL FUNCTIONS (original, preserved)
===================================================== */
const chemicalFunctions = {
    chemicals: [],

    init(chemicalsData) {
        this.chemicals = chemicalsData;
        this.setupEventListeners();
        this.renderChemicals();
    },

    setupEventListeners() {
        const searchInput   = document.getElementById('searchInput');
        const filterButtons = document.querySelectorAll('.filter-btn');

        if (searchInput) {
            searchInput.addEventListener('input', e => this.handleSearch(e.target.value));
        }
        filterButtons.forEach(btn => {
            btn.addEventListener('click', e => this.handleFilter(e.target));
        });
    },

    handleSearch(searchTerm) {
        const term     = searchTerm.toLowerCase().trim();
        const filtered = this.chemicals.filter(c => c.name.toLowerCase().includes(term));
        this.renderChemicals(filtered);
    },

    handleFilter(button) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filter = button.getAttribute('data-filter');
        if (filter === 'all') {
            this.renderChemicals();
        } else {
            const filtered = this.chemicals.filter(c => c.category === filter);
            this.renderChemicals(filtered);
        }
    },

    renderChemicals(filteredChemicals = this.chemicals) {
        const grid = document.getElementById('chemicalsGrid');
        if (!grid) return;

        if (filteredChemicals.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No chemicals found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>`;
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

    getCategoryDisplayName(category) {
        const map = {
            acid:        'Acid',
            base:        'Base',
            salt:        'Salt',
            organic:     'Organic Compound',
            reagent:     'Laboratory Reagent',
            oxidizer:    'Oxidizing Agent',
            element:     'Chemical Element',
            stain:       'Staining Agent',
            metal:       'Metal',
            indicator:   'pH Indicator',
            polymer:     'Polymer',
            oxide:       'Metal Oxide',
            dye:         'Dye',
            biochemical: 'Biochemical',
            natural:     'Natural Product'
        };
        return map[category] || category;
    }
};
