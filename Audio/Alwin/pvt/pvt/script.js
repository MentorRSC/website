// ========== CONFIGURATION ==========
// REPLACE THESE WITH YOUR ACTUAL GOOGLE SHEETS IDs
const SHEET1_ID = "1QP_vL_AbyNcI6GX3Ki_kQHKKJ9Lht3_MUFyMWslkNKU"; // Router sheet
const SHEET2_ID = "1cPH-nLX5-8TSX29qKr7FE17nHvIl0RF9tv7GTWUCwNE"; // Color themes
const SHEET3_ID = "1cPH-nLX5-8TSX29qKr7FE17nHvIl0RF9tv7GTWUCwNE"; // Color themes
const SHEET4_ID = "12y7yvyP9geaEzjH4Qo5tgA9HEqihpMp2ULp8n_QEYhA"; // Card styles
const SHEET5_ID = "1lOtB6gISk6K7A8-t5LjcCRh-SswE7RBxa9HdIXPpv_0"; // Headings

// Global data storage
let appData = {
    cards: [],        // From Sheet2
    themes: [],       // From Sheet3
    styles: [],       // From Sheet4
    headings: null,   // From Sheet5
    currentStyle: "style1"
};

// ========== HELPER: Fetch any sheet as JSON using Google Viz API ==========
async function fetchSheet(sheetId, sheetName = "Sheet1") {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
    try {
        const response = await fetch(url);
        const text = await response.text();
        // Parse Google's weird JSONP format
        const jsonStr = text.substring(47, text.length - 2);
        const data = JSON.parse(jsonStr);
        
        // Convert to array of objects
        const headers = data.table.cols.map(col => col.label);
        const rows = data.table.rows.map(row => {
            let obj = {};
            row.c.forEach((cell, idx) => {
                obj[headers[idx]] = cell ? cell.v : "";
            });
            return obj;
        });
        return rows;
    } catch (error) {
        console.error(`Error fetching sheet ${sheetId}:`, error);
        return [];
    }
}

// ========== STEP 1: Get Sheet2 URL from Sheet1 ==========
async function getSheet2Url() {
    const sheet1Data = await fetchSheet(SHEET1_ID, "Sheet1");
    if (sheet1Data.length > 0) {
        // Assume first row, first column contains Sheet2 URL or ID
        return sheet1Data[0]["Sheet2_URL"] || sheet1Data[0]["url"] || sheet1Data[0][Object.keys(sheet1Data[0])[0]];
    }
    return null;
}

// ========== STEP 2: Fetch all data ==========
async function fetchAllData() {
    try {
        // Get Sheet2 URL
        const sheet2Url = await getSheet2Url();
        if (!sheet2Url) {
            throw new Error("Could not find Sheet2 URL in Sheet1");
        }
        
        // Extract Sheet2 ID from URL
        const sheet2Id = extractSheetId(sheet2Url);
        
        // Fetch all sheets in parallel
        const [cards, themes, styles, headings] = await Promise.all([
            fetchSheet(sheet2Id, "Sheet1"),
            fetchSheet(SHEET3_ID, "Sheet1"),
            fetchSheet(SHEET4_ID, "Sheet1"),
            fetchSheet(SHEET5_ID, "Sheet1")
        ]);
        
        appData.cards = cards;
        appData.themes = themes;
        appData.styles = styles;
        appData.headings = headings[0] || {};
        
        return true;
    } catch (error) {
        console.error("Error fetching data:", error);
        return false;
    }
}

// ========== Extract Google Sheet ID from URL ==========
function extractSheetId(url) {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
}

// ========== Apply color theme ==========
function applyTheme(themeName) {
    const theme = appData.themes.find(t => t.theme_name === themeName || t.name === themeName);
    if (!theme) return;
    
    // Map sheet columns to CSS variables
    document.documentElement.style.setProperty('--primary-bg', theme.primary_bg || theme.bg_main || "#f5f7fa");
    document.documentElement.style.setProperty('--card-bg', theme.card_bg || theme.bg_card || "#ffffff");
    document.documentElement.style.setProperty('--text-color', theme.text_color || theme.text || "#333333");
    document.documentElement.style.setProperty('--accent-color', theme.accent || theme.accent_color || "#4f46e5");
}

// ========== Render cards with selected style ==========
function renderCards() {
    const container = document.getElementById('cards-container');
    if (!container) return;
    
    if (appData.cards.length === 0) {
        container.innerHTML = '<div class="loading-spinner">No cards found. Check your sheet data.</div>';
        return;
    }
    
    const styleClass = `card-style-${appData.currentStyle}`;
    const cardsHTML = appData.cards.map(card => {
        // Map common column names
        const title = card.title || card.name || card.heading || "Untitled";
        const description = card.description || card.desc || card.text || "";
        const imageUrl = card.image || card.img || card.image_url || "";
        const link = card.link || card.url || "#";
        
        // Style 1: Full card with image
        if (appData.currentStyle === "1") {
            return `
                <div class="${styleClass}">
                    ${imageUrl ? `<img class="card-image" src="${imageUrl}" alt="${title}">` : ''}
                    <div class="card-content">
                        <h3 class="card-title">${escapeHtml(title)}</h3>
                        <p class="card-description">${escapeHtml(description)}</p>
                        ${link !== "#" ? `<a href="${link}" class="card-link" target="_blank">Learn More →</a>` : ''}
                    </div>
                </div>
            `;
        }
        
        // Style 2: Minimal
        if (appData.currentStyle === "2") {
            return `
                <div class="${styleClass}">
                    <h3 class="card-title">${escapeHtml(title)}</h3>
                    <p class="card-description">${escapeHtml(description)}</p>
                    ${link !== "#" ? `<a href="${link}" class="card-link" target="_blank">Learn More →</a>` : ''}
                </div>
            `;
        }
        
        // Style 3: Badge style with circular image
        return `
            <div class="${styleClass}">
                ${imageUrl ? `<img class="card-image" src="${imageUrl}" alt="${title}">` : '<div class="card-image" style="background:var(--accent-color); border-radius:50%; margin:0 auto;"></div>'}
                <h3 class="card-title">${escapeHtml(title)}</h3>
                <p class="card-description">${escapeHtml(description)}</p>
                ${link !== "#" ? `<a href="${link}" class="card-link" target="_blank">Visit</a>` : ''}
            </div>
        `;
    }).join('');
    
    container.innerHTML = cardsHTML;
}

// ========== Populate theme dropdown ==========
function populateThemeSelector() {
    const selector = document.getElementById('theme-selector');
    if (!selector) return;
    
    selector.innerHTML = '<option value="">Select Theme</option>';
    appData.themes.forEach(theme => {
        const name = theme.theme_name || theme.name;
        if (name) {
            selector.innerHTML += `<option value="${name}">${name}</option>`;
        }
    });
    
    // Apply first theme by default if exists
    if (appData.themes.length > 0) {
        const firstTheme = appData.themes[0].theme_name || appData.themes[0].name;
        selector.value = firstTheme;
        applyTheme(firstTheme);
    }
}

// ========== Populate style dropdown ==========
function populateStyleSelector() {
    const selector = document.getElementById('style-selector');
    if (!selector) return;
    
    selector.innerHTML = '<option value="">Select Card Style</option>';
    appData.styles.forEach((style, index) => {
        const styleName = style.style_name || style.name || `Style ${index + 1}`;
        const styleValue = style.style_id || style.id || (index + 1).toString();
        selector.innerHTML += `<option value="${styleValue}">${styleName}</option>`;
    });
}

// ========== Update headings from Sheet5 ==========
function updateHeadings() {
    if (appData.headings) {
        const mainHeading = appData.headings.main_heading || appData.headings.title || "Dynamic Cards";
        const subHeading = appData.headings.subheading || appData.headings.subtitle || "";
        const footer = appData.headings.footer_text || appData.headings.footer || "Powered by Google Sheets";
        
        document.getElementById('main-heading').textContent = mainHeading;
        document.getElementById('sub-heading').textContent = subHeading;
        document.getElementById('footer-text').textContent = footer;
    }
}

// ========== Load everything ==========
async function loadApp() {
    // Show loading state
    document.getElementById('cards-container').innerHTML = '<div class="loading-spinner">Loading data from Google Sheets...</div>';
    
    const success = await fetchAllData();
    
    if (!success) {
        document.getElementById('cards-container').innerHTML = '<div class="loading-spinner">❌ Failed to load data. Check console for errors.</div>';
        return;
    }
    
    // Update UI
    updateHeadings();
    populateThemeSelector();
    populateStyleSelector();
    renderCards();
    
    // Set default style
    if (appData.styles.length > 0) {
        const defaultStyle = appData.styles[0].style_id || (appData.styles[0].id) || "1";
        document.getElementById('style-selector').value = defaultStyle;
        appData.currentStyle = defaultStyle;
    }
}

// ========== Event Listeners ==========
function setupEventListeners() {
    // Theme selector
    document.getElementById('theme-selector').addEventListener('change', (e) => {
        if (e.target.value) {
            applyTheme(e.target.value);
        }
    });
    
    // Style selector
    document.getElementById('style-selector').addEventListener('change', (e) => {
        if (e.target.value) {
            appData.currentStyle = e.target.value;
            renderCards();
        }
    });
    
    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', () => {
        loadApp();
    });
}

// ========== Helper: Escape HTML to prevent XSS ==========
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ========== Initialize App ==========
document.addEventListener('DOMContentLoaded', () => {
    loadApp();
    setupEventListeners();
});
