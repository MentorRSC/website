/**
 * CONFIGURATION FILE
 * ==================
 * Change only the values below to customize your app
 * Everything else is handled automatically
 */

const APP_CONFIG = {
    // ===== REQUIRED: Google Sheets IDs =====
    // Get these from your sheet URLs:
    // https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit
    
    SHEETS: {
        // Router sheet (contains URL to Sheet2)
        SHEET1_ID: "1ABC123xyz_YourSheet1IdHere",
        
        // Color themes sheet
        SHEET3_ID: "1DEF456xyz_YourSheet3IdHere",
        
        // Card styles sheet  
        SHEET4_ID: "1GHI789xyz_YourSheet4IdHere",
        
        // Headings sheet
        SHEET5_ID: "1JKL012xyz_YourSheet5IdHere"
    },
    
    // ===== OPTIONAL: Appearance =====
    APPEARANCE: {
        // App title (shown in browser tab)
        app_title: "Dynamic Card Gallery",
        
        // Number of cards per row (1, 2, 3, 4, or 6)
        cards_per_row: 3,
        
        // Default theme (must match a theme in your Sheet3)
        default_theme: "Ocean",
        
        // Default card style (1, 2, or 3)
        default_style: "1",
        
        // Enable/disable theme selector (true/false)
        show_theme_selector: true,
        
        // Enable/disable style selector (true/false)
        show_style_selector: true,
        
        // Enable/disable refresh button (true/false)
        show_refresh_button: true
    },
    
    // ===== OPTIONAL: Advanced =====
    ADVANCED: {
        // Auto-refresh data every X milliseconds (set to 0 to disable)
        auto_refresh_interval: 0,  // 300000 = 5 minutes
        
        // Show debug info in console (true/false)
        debug_mode: false,
        
        // Cache data in localStorage (true/false)
        use_cache: true,
        
        // Cache duration in milliseconds (default 5 minutes)
        cache_duration: 300000
    }
};

// Do not edit below this line
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_CONFIG;
}
