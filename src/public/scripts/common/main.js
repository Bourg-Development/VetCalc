// public/js/main.js - Main application JavaScript

// Global state
const app = {
    isLoading: false,
    alerts: [],
    theme: 'light'
};

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize application
function initializeApp() {
    setupEventListeners();
    setupUserMenu();
    // Initialize tooltips if any
    initializeTooltips();

    console.log('VetCalc App initialized');
}

// Setup global event listeners
function setupEventListeners() {
    // Global error handler
    window.addEventListener('error', function(event) {
        console.error('JavaScript Error:', event.error);
        showAlert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 'error');
    });

    // Global unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled Promise Rejection:', event.reason);
        showAlert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 'error');
    });

    // Form submission handler
    document.addEventListener('submit', function(event) {
        const form = event.target;
        if (form.classList.contains('prevent-double-submit')) {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                setTimeout(() => {
                    submitButton.disabled = false;
                }, 3000);
            }
        }
    });

    // Click outside handler for dropdowns
    document.addEventListener('click', function(event) {
        closeOpenDropdowns(event.target);
    });
}

// Setup user menu
function setupUserMenu() {
    const userMenuToggle = document.getElementById('user-menu-toggle');
    const userDropdown = document.getElementById('user-dropdown');

    if (userMenuToggle && userDropdown) {
        userMenuToggle.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            userDropdown.classList.toggle('show');
        });
    }
}



// Close open dropdowns
function closeOpenDropdowns(target) {
    const dropdowns = document.querySelectorAll('.user-dropdown.show');
    dropdowns.forEach(dropdown => {
        if (!dropdown.contains(target) && !dropdown.previousElementSibling.contains(target)) {
            dropdown.classList.remove('show');
        }
    });
}

// Loading state management
function showLoading() {
    if (app.isLoading) return;

    app.isLoading = true;
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('show');
    }
}

function hideLoading() {
    app.isLoading = false;
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('show');
    }
}

// Alert system
function showAlert(message, type = 'info', duration = 5000) {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;

    const alertId = utils.generateId();
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.setAttribute('data-alert-id', alertId);

    alert.innerHTML = `
        <div class="alert-content">
            <span class="alert-message">${utils.sanitizeHTML(message)}</span>
            <button class="alert-close" onclick="closeAlert('${alertId}')" aria-label="Schließen">
                <span class="material-symbols-outlined">
                    close
                </span>
            </button>
        </div>
    `;

    alertContainer.appendChild(alert);
    app.alerts.push(alertId);

    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(() => {
            closeAlert(alertId);
        }, duration);
    }

    return alertId;
}

function closeAlert(alertId) {
    const alert = document.querySelector(`[data-alert-id="${alertId}"]`);
    if (alert) {
        alert.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            alert.remove();
            app.alerts = app.alerts.filter(id => id !== alertId);
        }, 300);
    }
}

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize tooltips (if using a tooltip library)
function initializeTooltips() {
    // Implementation depends on tooltip library
    // This is a placeholder for future tooltip functionality
}

// Utility function to format numbers
function formatNumber(num, decimals = 2) {
    return new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    }).format(num);
}

// Export functions to global scope for inline event handlers
window.showAlert = showAlert;
window.closeAlert = closeAlert;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.formatNumber = formatNumber;