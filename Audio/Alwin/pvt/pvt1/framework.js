/**
 * FRAMEWORK CORE ENGINE
 * =====================
 * Do not modify this file unless you know what you're doing
 * All configuration is in config.js
 */

(function() {
    'use strict';
    
    // Framework state
    let state = {
        cards: [],
        themes: [],
        styles: [],
        headings: null,
        currentTheme: '',
        currentStyle: '',
        isLoading: false,
        sheet2Id: null
    };
    
    // Cache system
    const cache = {
        get: (key) => {
            if (!APP_CONFIG.ADVANCED.use_cache) return null;
            const cached = localStorage.getItem(`fw_cache_${key}`);
            if (!cached) return null;
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp > APP_CONFIG.ADVANCED.cache_duration) {
                localStorage.removeItem(`fw_cache_${key}`);
                return null;
            }
            return data.value;
        },
        set: (key, value) => {
            if (!APP_CONFIG.ADVANCED.use_cache) return;
            localStorage.setItem(`fw_cache_${key}`, JSON.stringify({
                timestamp: Date.now(),
                value: value
            }));
        }
    };
    
    // Debug logger
    function log(...args) {
        if (APP_CONFIG.ADVANCED.debug_mode) {
            console.log('[Framework]', ...args);
        }
    }
    
    // Fetch sheet using Google Viz API
    async function fetchSheet(sheetId, sheetName = 'Sheet1') {
        const cacheKey = `${sheetId}_${sheetName}`;
        const cached = cache.get(cacheKey);
        if (cached) {
            log('Using cached data for:', sheetId);
            return cached;
        }
        
        try {
            const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
            const response = await fetch(url);
            const text = await response.text();
            const jsonStr = text.substring(47, text.length - 2);
            const data = JSON.parse(jsonStr);
            
            const headers = data.table.cols.map(col => col.label);
            const rows = data.table.rows.map(row => {
                const obj = {};
                row.c.forEach((cell, idx) => {
                    obj[headers[idx]] = cell ? cell.v : '';
                });
                return obj;
            });
            
            cache.set(cacheKey, rows);
            return rows;
        } catch (error) {
            log('Fetch error:', error);
            return [];
        }
    }
    
    // Extract Sheet ID from URL
    function extractSheetId(url) {
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        return match ? match[1] : url;
    }
    
    // Get Sheet2 ID from router sheet
    async function getSheet2Id() {
        const sheet1Data = await fetchSheet(APP_CONFIG.SHEETS.SHEET1_ID, 'Sheet1');
        if (sheet1Data.length === 0) {
            throw new Error('Router sheet is empty');
        }
        
        const firstRow = sheet1Data[0];
        const sheet2Url = firstRow.Sheet2_URL || firstRow.url || firstRow[Object.keys(firstRow)[0]];
        return extractSheetId(sheet2Url);
    }
    
    // Apply theme from Google Sheets or CSS class
    function applyTheme(themeName) {
        const theme = state.themes.find(t => 
            (t.theme_name || t.name || '').toLowerCase() === themeName.toLowerCase()
        );
        
        if (theme) {
            // Apply from sheet data
            document.documentElement.style.setProperty('--bg-primary', theme.primary_bg || theme.bg_main);
            document.documentElement.style.setProperty('--bg-secondary', theme.card_bg || theme.bg_card);
            document.documentElement.style.setProperty('--text-primary', theme.text_color || theme.text);
            document.documentElement.style.setProperty('--accent-primary', theme.accent || theme.accent_color);
        } else {
            // Try CSS class
            document.body.className = document.body.className.replace(/theme-\w+/g, '');
            document.body.classList.add(`theme-${themeName.toLowerCase()}`);
        }
        
        state.currentTheme = themeName;
        log('Theme applied:', themeName);
    }
    
    // Render cards
    function renderCards() {
        const container = document.getElementById('framework-grid');
        if (!container) return;
        
        if (state.cards.length === 0) {
            container.innerHTML = '<div class="text-center" style="padding: 40px;">No cards found. Check your Google Sheets data.</div>';
            return;
        }
        
        const styleClass = `card-style-${state.currentStyle}`;
        const cardsHtml = state.cards.map(card => {
            const title = card.title || card.name || card.heading || 'Untitled';
            const description = card.description || card.desc || card.text || '';
            const imageUrl = card.image || card.img || card.image_url || '';
            const link = card.link || card.url || '#';
            
            // Escape HTML
            const escape = (str) => {
                if (!str) return '';
                return String(str).replace(/[&<>]/g, function(m) {
                    if (m === '&') return '&amp;';
                    if (m === '<') return '&lt;';
                    if (m === '>') return '&gt;';
                    return m;
                });
            };
            
            const imageHtml = imageUrl 
                ? `<img class="framework-card-image" src="${escape(imageUrl)}" alt="${escape(title)}" loading="lazy">`
                : `<div class="framework-card-image-placeholder">📷</div>`;
            
            return `
                <div class="framework-card ${styleClass}">
                    ${imageHtml}
                    <div class="framework-card-content">
                        <h3 class="framework-card-title">${escape(title)}</h3>
                        <p class="framework-card-description">${escape(description)}</p>
                        ${link !== '#' ? `<a href="${escape(link)}" class="framework-card-link" target="_blank" rel="noopener">Learn More →</a>` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = cardsHtml;
        log('Rendered', state.cards.length, 'cards with style', state.currentStyle);
    }
    
    // Populate theme selector
    function populateThemeSelector() {
        const selector = document.getElementById('framework-theme-selector');
        if (!selector || !APP_CONFIG.APPEARANCE.show_theme_selector) return;
        
        selector.innerHTML = '<option value="">Select Theme</option>';
        state.themes.forEach(theme => {
            const name = theme.theme_name || theme.name;
            if (name) {
                selector.innerHTML += `<option value="${name}">${name}</option>`;
            }
        });
        
        if (state.themes.length > 0 && APP_CONFIG.APPEARANCE.default_theme) {
            selector.value = APP_CONFIG.APPEARANCE.default_theme;
            applyTheme(APP_CONFIG.APPEARANCE.default_theme);
        }
    }
    
    // Populate style selector
    function populateStyleSelector() {
        const selector = document.getElementById('framework-style-selector');
        if (!selector || !APP_CONFIG.APPEARANCE.show_style_selector) return;
        
        selector.innerHTML = '<option value="">Select Style</option>';
        state.styles.forEach((style, idx) => {
            const name = style.style_name || style.name || `Style ${idx + 1}`;
            const value = style.style_id || style.id || (idx + 1).toString();
            selector.innerHTML += `<option value="${value}">${name}</option>`;
        });
        
        const defaultStyle = APP_CONFIG.APPEARANCE.default_style || '1';
        selector.value = defaultStyle;
        state.currentStyle = defaultStyle;
    }
    
    // Update headings
    function updateHeadings() {
        if (state.headings) {
            const title = state.headings.main_heading || state.headings.title || APP_CONFIG.APPEARANCE.app_title;
            const subtitle = state.headings.subheading || state.headings.subtitle || '';
            const footer = state.headings.footer_text || state.headings.footer || 'Powered by Dynamic Card Framework';
            
            const titleEl = document.getElementById('framework-title');
            const subtitleEl = document.getElementById('framework-subtitle');
            const footerEl = document.getElementById('framework-footer');
            
            if (titleEl) titleEl.textContent = title;
            if (subtitleEl) subtitleEl.textContent = subtitle;
            if (footerEl) footerEl.textContent = footer;
            document.title = title;
        }
    }
    
    // Set grid columns
    function setGridColumns() {
        const grid = document.getElementById('framework-grid');
        if (grid) {
            const cols = APP_CONFIG.APPEARANCE.cards_per_row;
            grid.className = `framework-grid grid-${cols}`;
        }
    }
    
    // Show error
    function showError(message) {
        const container = document.getElementById('framework-grid');
        if (container) {
            container.innerHTML = `
                <div class="framework-error">
                    <div class="framework-error-icon">⚠️</div>
                    <h3>Something went wrong</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()">Retry</button>
                </div>
            `;
        }
        log('Error:', message);
    }
    
    // Show loading
    function showLoading(show) {
        const loadingEl = document.getElementById('framework-loading');
        const contentEl = document.getElementById('framework-content');
        if (loadingEl && contentEl) {
            loadingEl.style.display = show ? 'flex' : 'none';
            contentEl.style.display = show ? 'none' : 'block';
        }
    }
    
    // Load all data
    async function loadData() {
        if (state.isLoading) return;
        state.isLoading = true;
        showLoading(true);
        
        try {
            // Get Sheet2 ID
            state.sheet2Id = await getSheet2Id();
            log('Sheet2 ID:', state.sheet2Id);
            
            // Fetch all data in parallel
            const [cards, themes, styles, headings] = await Promise.all([
                fetchSheet(state.sheet2Id, 'Sheet1'),
                fetchSheet(APP_CONFIG.SHEETS.SHEET3_ID, 'Sheet1'),
                fetchSheet(APP_CONFIG.SHEETS.SHEET4_ID, 'Sheet1'),
                fetchSheet(APP_CONFIG.SHEETS.SHEET5_ID, 'Sheet1')
            ]);
            
            state.cards = cards;
            state.themes = themes;
            state.styles = styles;
            state.headings = headings[0] || {};
            
            log('Data loaded:', { cards: cards.length, themes: themes.length, styles: styles.length });
            
            // Render UI
            setGridColumns();
            updateHeadings();
            populateThemeSelector();
            populateStyleSelector();
            renderCards();
            
        } catch (error) {
            log('Load error:', error);
            showError(error.message || 'Failed to load data. Check your Sheet IDs in config.js');
        } finally {
            state.isLoading = false;
            showLoading(false);
        }
    }
    
    // Refresh data (clear cache and reload)
    async function refreshData() {
        if (APP_CONFIG.ADVANCED.use_cache) {
            localStorage.clear();
        }
        await loadData();
    }
    
    // Build UI
    function buildUI() {
        const app = document.getElementById('app');
        if (!app) return;
        
        const showThemeSelector = APP_CONFIG.APPEARANCE.show_theme_selector;
        const showStyleSelector = APP_CONFIG.APPEARANCE.show_style_selector;
        const showRefreshBtn = APP_CONFIG.APPEARANCE.show_refresh_button;
        
        app.innerHTML = `
            <div class="framework-app">
                <div id="framework-loading" class="framework-loading">
                    <div class="framework-spinner"></div>
                    <p>Loading your cards...</p>
                </div>
                
                <div id="framework-content" style="display: none;">
                    <header class="framework-header">
                        <h1 id="framework-title">${APP_CONFIG.APPEARANCE.app_title}</h1>
                        <p id="framework-subtitle"></p>
                    </header>
                    
                    <div class="framework-controls">
                        ${showThemeSelector ? `
                        <div class="framework-control-group">
                            <label>🎨 Theme:</label>
                            <select id="framework-theme-selector" class="framework-select"></select>
                        </div>
                        ` : ''}
                        
                        ${showStyleSelector ? `
                        <div class="framework-control-group">
                            <label>📇 Style:</label>
                            <select id="framework-style-selector" class="framework-select"></select>
                        </div>
                        ` : ''}
                        
                        ${showRefreshBtn ? `
                        <button id="framework-refresh-btn" class="framework-btn">⟳ Refresh</button>
                        ` : ''}
                    </div>
                    
                    <div id="framework-grid" class="framework-grid grid-3"></div>
                    
                    <footer class="framework-footer">
                        <p id="framework-footer"></p>
                    </footer>
                </div>
            </div>
        `;
        
        // Attach event listeners
        if (showThemeSelector) {
            document.getElementById('framework-theme-selector')?.addEventListener('change', (e) => {
                if (e.target.value) applyTheme(e.target.value);
            });
        }
        
        if (showStyleSelector) {
            document.getElementById('framework-style-selector')?.addEventListener('change', (e) => {
                if (e.target.value) {
                    state.currentStyle = e.target.value;
                    renderCards();
                }
            });
        }
        
        if (showRefreshBtn) {
            document.getElementById('framework-refresh-btn')?.addEventListener('click', () => refreshData());
        }
    }
    
    // Auto-refresh setup
    function setupAutoRefresh() {
        if (APP_CONFIG.ADVANCED.auto_refresh_interval > 0) {
            setInterval(() => {
                log('Auto-refreshing data...');
                refreshData();
            }, APP_CONFIG.ADVANCED.auto_refresh_interval);
        }
    }
    
    // Initialize framework
    async function init() {
        log('Framework initializing...', APP_CONFIG);
        buildUI();
        await loadData();
        setupAutoRefresh();
        log('Framework ready');
    }
    
    // Start the app
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
