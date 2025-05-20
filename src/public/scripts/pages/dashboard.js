// public/js/pages/dashboard.js - Dashboard page initialization

// Dashboard initialization
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
});

async function initDashboard() {
    try {
        showLoading();

        // Load dashboard data in parallel
        await Promise.all([
            loadDashboardStats(),
            loadPopularMedications(),
            loadMedicationsForQuickDosage(),
            initCharts()
        ]);

        // Initialize components
        initQuickDosageForm();
        setupChartResizeObserver();

        // Initialize dashboard-specific features
        initDashboardFeatures();

        hideLoading();

        showAlert('Dashboard geladen', 'success', 2000);
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showAlert('Fehler beim Laden des Dashboards: ' + error.message, 'error');
        hideLoading();
    }
}

// Initialize dashboard-specific features
function initDashboardFeatures() {
    // Setup keyboard navigation for dashboard cards
    setupKeyboardNavigation();

    // Setup drag and drop for dashboard customization (future feature)
    // setupDashboardCustomization();

    // Setup data refresh intervals
    setupDataRefreshIntervals();

    // Setup real-time updates (if WebSocket available)
    // setupRealTimeUpdates();

    // Initialize performance monitoring
    initPerformanceMonitoring();
}

// Setup keyboard navigation
function setupKeyboardNavigation() {
    const cards = document.querySelectorAll('.dashboard-card');
    let currentCardIndex = 0;

    document.addEventListener('keydown', (event) => {
        // Only handle navigation when no input is focused
        if (document.activeElement.tagName.toLowerCase() === 'input' ||
            document.activeElement.tagName.toLowerCase() === 'select' ||
            document.activeElement.tagName.toLowerCase() === 'textarea') {
            return;
        }

        switch (event.key) {
            case 'ArrowRight':
            case 'Tab':
                if (!event.shiftKey) {
                    event.preventDefault();
                    currentCardIndex = (currentCardIndex + 1) % cards.length;
                    focusCard(cards[currentCardIndex]);
                }
                break;
            case 'ArrowLeft':
                if (event.shiftKey && event.key === 'Tab') {
                    event.preventDefault();
                    currentCardIndex = currentCardIndex === 0 ? cards.length - 1 : currentCardIndex - 1;
                    focusCard(cards[currentCardIndex]);
                }
                break;
            case 'Enter':
                if (cards[currentCardIndex]) {
                    // Activate the first interactive element in the card
                    const interactiveElement = cards[currentCardIndex].querySelector('a, button, .activity-item, .medication-item');
                    if (interactiveElement) {
                        interactiveElement.click();
                    }
                }
                break;
        }
    });
}

function focusCard(card) {
    if (!card) return;

    // Remove focus from all cards
    document.querySelectorAll('.dashboard-card').forEach(c => {
        c.classList.remove('keyboard-focused');
    });

    // Add focus to current card
    card.classList.add('keyboard-focused');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Announce the card for screen readers
    const cardTitle = card.querySelector('.card-title');
    if (cardTitle) {
        announceForScreenReader(`Karte: ${cardTitle.textContent}`);
    }
}

// Setup data refresh intervals
function setupDataRefreshIntervals() {
    // Refresh stats every 5 minutes
    setInterval(() => {
        loadDashboardStats();
    }, 5 * 60 * 1000);

    // Refresh charts every 10 minutes
    setInterval(() => {
        updateCharts();
    }, 10 * 60 * 1000);
}

// Performance monitoring
function initPerformanceMonitoring() {
    // Measure page load time
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`Dashboard loaded in ${loadTime.toFixed(2)}ms`);

        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_load_time', {
                event_category: 'Performance',
                event_label: 'Dashboard',
                value: Math.round(loadTime)
            });
        }
    });

    // Monitor component load times
    const componentLoadTimes = {};

    window.componentLoadStart = (componentName) => {
        componentLoadTimes[componentName] = performance.now();
    };

    window.componentLoadEnd = (componentName) => {
        if (componentLoadTimes[componentName]) {
            const loadTime = performance.now() - componentLoadTimes[componentName];
            console.log(`${componentName} loaded in ${loadTime.toFixed(2)}ms`);
            delete componentLoadTimes[componentName];
        }
    };
}

// Screen reader announcements
function announceForScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-9999px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcement.textContent = message;

    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Dashboard actions
function refreshDashboard() {
    showLoading();

    // Clear existing data
    dashboardData = {
        stats: {},
        medications: [],
        charts: {}
    };

    // Reinitialize dashboard
    initDashboard();
}

// Export dashboard data
function exportDashboardData() {
    const exportData = {
        timestamp: new Date().toISOString(),
        stats: dashboardData.stats,
        medications: dashboardData.medications.map(med => ({
            id: med.id,
            name: med.name,
            activeIngredient: med.activeIngredient,
            strength: med.strength,
            form: med.form
        }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vetcalc-dashboard-export-${utils.formatDate(new Date(), { year: 'numeric', month: '2-digit', day: '2-digit' })}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showAlert('Dashboard-Daten exportiert', 'success');
}

// Print dashboard
function printDashboard() {
    // Hide non-essential elements for printing
    const elementsToHide = document.querySelectorAll('.chart-actions, .card-link, .btn');
    elementsToHide.forEach(el => el.style.display = 'none');

    window.print();

    // Restore hidden elements
    elementsToHide.forEach(el => el.style.display = '');
}

// Dashboard customization (future feature)
function toggleDashboardCard(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;

    const isHidden = card.style.display === 'none';
    card.style.display = isHidden ? '' : 'none';

    // Save preference
    const hiddenCards = utils.storage.get('hiddenDashboardCards', []);
    if (isHidden) {
        const index = hiddenCards.indexOf(cardId);
        if (index > -1) hiddenCards.splice(index, 1);
    } else {
        if (!hiddenCards.includes(cardId)) hiddenCards.push(cardId);
    }
    utils.storage.set('hiddenDashboardCards', hiddenCards);

    showAlert(`Karte ${isHidden ? 'eingeblendet' : 'ausgeblendet'}`, 'info');
}

// Load dashboard customization preferences
function loadDashboardPreferences() {
    const hiddenCards = utils.storage.get('hiddenDashboardCards', []);
    hiddenCards.forEach(cardId => {
        const card = document.getElementById(cardId);
        if (card) card.style.display = 'none';
    });

    // Load chart preferences
    const chartPreferences = utils.storage.get('dashboardChartPreferences', {});
    if (chartPreferences.hideUsageChart) {
        const usageChartCard = document.querySelector('#usage-chart-container').closest('.dashboard-card');
        if (usageChartCard) usageChartCard.style.display = 'none';
    }
    if (chartPreferences.hideCategoriesChart) {
        const categoriesChartCard = document.querySelector('#categories-chart-container').closest('.dashboard-card');
        if (categoriesChartCard) categoriesChartCard.style.display = 'none';
    }
}

// Error recovery
function recoverFromError(error) {
    console.error('Dashboard error:', error);

    // Try to recover specific components
    if (error.message.includes('charts')) {
        showAlert('Diagramme konnten nicht geladen werden. Versuche erneut...', 'warning');
        setTimeout(() => {
            initCharts().catch(err => console.error('Chart recovery failed:', err));
        }, 2000);
    } else if (error.message.includes('medications')) {
        showAlert('Medikamente konnten nicht geladen werden. Versuche erneut...', 'warning');
        setTimeout(() => {
            loadPopularMedications().catch(err => console.error('Medications recovery failed:', err));
        }, 2000);
    }
}

// Cleanup function (called when navigating away from dashboard)
function cleanupDashboard() {
    // Destroy charts to free memory
    destroyCharts();

    // Clear any pending timeouts
    // This would be implemented with a timeout tracker

    console.log('Dashboard cleanup completed');
}

// Listen for page unload to cleanup
window.addEventListener('beforeunload', cleanupDashboard);

// Export functions for global access
window.refreshDashboard = refreshDashboard;
window.exportDashboardData = exportDashboardData;
window.printDashboard = printDashboard;
window.toggleDashboardCard = toggleDashboardCard;
window.recoverFromError = recoverFromError;

// Load preferences on initialization
setTimeout(loadDashboardPreferences, 100);