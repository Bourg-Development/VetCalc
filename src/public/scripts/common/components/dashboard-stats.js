// public/js/components/dashboard-stats.js - Dashboard statistics management

// Dashboard data store
let dashboardData = {
    stats: {},
    medications: [],
    charts: {}
};

// Load Dashboard Statistics
async function loadDashboardStats() {
    try {
        const [medStats, dosageStats, barcodeStats] = await Promise.all([
            api.get('/medications/statistics'),
            api.get('/dosage/statistics'),
            api.get('/barcode/statistics')
        ]);


        dashboardData.stats = {
            medications: medStats.total || 0,
            calculations: dosageStats.totalCalculations || 0,
            scans: barcodeStats.totalBarcodes || 0
        };

        updateStatsDisplay();
    } catch (error) {
        console.error('Error loading stats:', error);
        // Set default values if API fails
        dashboardData.stats = {
            medications: 0,
            calculations: 0,
            scans: 0
        };
        updateStatsDisplay();
    }
}

function updateStatsDisplay() {
    const stats = dashboardData.stats;

    // Update medications count
    const medicationsElement = document.getElementById('total-medications');
    if (medicationsElement) {
        animateNumber(medicationsElement, 0, stats.medications, 1000);
    }

    // Update calculations count
    const calculationsElement = document.getElementById('total-calculations');
    if (calculationsElement) {
        animateNumber(calculationsElement, 0, stats.calculations, 1000);
    }

    // Update scans count
    const scansElement = document.getElementById('total-scans');
    if (scansElement) {
        animateNumber(scansElement, 0, stats.scans, 1000);
    }
}

// Animate number counting
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const range = end - start;

    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + range * easeOut);

        element.textContent = formatNumber(current, 0);

        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = formatNumber(end, 0);
        }
    }

    requestAnimationFrame(updateNumber);
}

// Export functions for use in other modules
window.dashboardData = dashboardData;
window.loadDashboardStats = loadDashboardStats;
window.updateStatsDisplay = updateStatsDisplay;