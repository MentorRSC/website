// FutureClub - Main Application Logic
// No changes needed here unless you modify the flow

let selectedPackage = null;
let userContribution = "";
let userName = "";
let userAge = "";
let userMobile = "";

// Helper: Remove all modals
function removeModals() {
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
}

// Helper: Escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// STEP 1: Package Selection (₹50L Assets vs ₹30k/month)
function showPackageSelection() {
    removeModals();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-card">
            <button class="close-modal" id="closeModalBtn">✕</button>
            <h2>✦ Choose your future ✦</h2>
            <div class="option-grid">
                <div class="option-btn" id="optAssets">
                    <div class="option-title">🏠 ₹50 Lakh Assets</div>
                    <div class="option-desc">Free house, car, land, water, food, electricity, scooter, utilities — one time wealth package.</div>
                </div>
                <div class="option-btn" id="optMonthly">
                    <div class="option-title">💰 ₹30,000 / month</div>
                    <div class="option-desc">Lifetime monthly cash. No work. Pure financial freedom, deposited every month.</div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    
    overlay.querySelector('#closeModalBtn').onclick = () => overlay.remove();
    
    overlay.querySelector('#optAssets').onclick = () => {
        selectedPackage = "assets";
        overlay.remove();
        setTimeout(() => askFairnessQuestion(), 100);
    };
    
    overlay.querySelector('#optMonthly').onclick = () => {
        selectedPackage = "monthly";
        overlay.remove();
        setTimeout(() => askFairnessQuestion(), 100);
    };
}

// STEP 2: Fairness Question
function askFairnessQuestion() {
    removeModals();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-card">
            <button class="close-modal" id="closeModalBtn">✕</button>
            <h2>🌱 Keep the club running forever</h2>
            <p>"To keep this club running forever for everyone, what feels fair to you?"</p>
            <textarea id="fairnessAnswer" rows="3" placeholder="e.g., I can give 3 hours weekly / share my car when idle / one-time ₹2000 / bring a friend / just my gratitude..."></textarea>
            <button class="submit-btn" id="submitFairness">✓ Continue →</button>
        </div>
    `;
    document.body.appendChild(overlay);
    
    overlay.querySelector('#closeModalBtn').onclick = () => overlay.remove();
    
    overlay.querySelector('#submitFairness').onclick = () => {
        const answer = overlay.querySelector('#fairnessAnswer').value.trim();
        if (!answer) {
            alert("Please share what feels fair to you — even a small promise helps the community.");
            return;
        }
        userContribution = answer;
        overlay.remove();
        setTimeout(() => askPersonalDetails(), 100);
    };
}

// STEP 3: Personal Details (Name, Age, Mobile)
function askPersonalDetails() {
    removeModals();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-card">
            <button class="close-modal" id="closeModalBtn">✕</button>
            <h2>✨ Almost a member ✨</h2>
            <label>Full Name</label>
            <input type="text" id="memberName" placeholder="e.g., Anjali Krishnan" autocomplete="off">
            <label>Age / Date of Birth</label>
            <input type="text" id="memberAge" placeholder="e.g., 28 or 15-04-1995">
            <label>Mobile Number</label>
            <input type="tel" id="memberMobile" placeholder="10 digit number">
            <button class="submit-btn" id="submitDetails">📋 Review & Join →</button>
        </div>
    `;
    document.body.appendChild(overlay);
    
    overlay.querySelector('#closeModalBtn').onclick = () => overlay.remove();
    
    overlay.querySelector('#submitDetails').onclick = () => {
        const name = overlay.querySelector('#memberName').value.trim();
        const age = overlay.querySelector('#memberAge').value.trim();
        const mobile = overlay.querySelector('#memberMobile').value.trim();
        
        if (!name) { alert("Please enter your full name."); return; }
        if (!age) { alert("Please enter your age or date of birth."); return; }
        if (!mobile || mobile.length < 8) { alert("Please enter a valid mobile number."); return; }
        
        userName = name;
        userAge = age;
        userMobile = mobile;
        overlay.remove();
        setTimeout(() => showSummaryAndRedirect(), 100);
    };
}

// STEP 4: Show Summary and Redirect to members.html
function showSummaryAndRedirect() {
    removeModals();
    const packageText = selectedPackage === "assets" 
        ? "🏠 ₹50 Lakh Assets Package (Free house, car, land, water, food, electricity, scooter, utilities)"
        : "💰 ₹30,000 per month (Lifetime monthly cash, no work required)";
    
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-card">
            <h2>✅ Welcome to FutureClub</h2>
            <div class="review-box">
                <strong>👤 Name:</strong> ${escapeHtml(userName)}<br>
                <strong>🎂 Age/DOB:</strong> ${escapeHtml(userAge)}<br>
                <strong>📞 Mobile:</strong> ${escapeHtml(userMobile)}<br>
                <strong>📦 Package:</strong> ${packageText}<br>
                <strong>🤝 Your Contribution:</strong> "${escapeHtml(userContribution)}"
            </div>
            <p style="color: #a5f3c3;">✨ Your membership is being prepared. Redirecting to members area...</p>
        </div>
    `;
    document.body.appendChild(overlay);
    
    // Auto redirect after 2.5 seconds
    setTimeout(() => {
        window.location.href = "members.html";
    }, 2500);
}

// JOIN button handler - clears screen and starts the flow
function handleJoin() {
    const container = document.getElementById('appRoot');
    if (container) {
        container.innerHTML = `
            <div class="club-title">
                <h1>FUTURECLUB</h1>
            </div>
            <div class="loading-text">
                <p>⚡ shaping your membership ⚡</p>
            </div>
        `;
    }
    showPackageSelection();
}

// LOGIN button handler - redirect to dashboard
function handleLogin() {
    window.location.href = "dashboard.html";
}

// Initialize event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const joinBtn = document.getElementById('joinBtn');
    const loginBtn = document.getElementById('loginBtn');
    
    if (joinBtn) joinBtn.onclick = handleJoin;
    if (loginBtn) loginBtn.onclick = handleLogin;
});
