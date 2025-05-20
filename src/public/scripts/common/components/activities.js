// public/js/components/activities.js - Recent activities management

// Load Recent Activities
async function loadRecentActivities() {
    try {
        // Since we don't have an activities API, we'll simulate recent activities
        // In a real app, this would be a proper API call
        const activities = await simulateRecentActivities();

        dashboardData.activities = activities;
        displayRecentActivities();
    } catch (error) {
        console.error('Error loading activities:', error);
        showAlert('Fehler beim Laden der Aktivitäten', 'error');
    }
}

async function simulateRecentActivities() {
    // Simulate API delay
    await utils.delay(300);

    return [
        {
            id: 1,
            type: 'calculation',
            description: 'Dosierung für Amoxicillin berechnet',
            patient: 'Rex (Schäferhund)',
            time: '10 Minuten',
            icon: '🧮'
        },
        {
            id: 2,
            type: 'medication',
            description: 'Neues Medikament hinzugefügt',
            name: 'Metacam 5mg',
            time: '1 Stunde',
            icon: '💊'
        },
        {
            id: 3,
            type: 'scan',
            description: 'Barcode gescannt',
            name: 'Aspirin 500mg',
            time: '2 Stunden',
            icon: '📱'
        },
        {
            id: 4,
            type: 'calculation',
            description: 'Dosierung für Insulin berechnet',
            patient: 'Mimi (Perserkatze)',
            time: '3 Stunden',
            icon: '🧮'
        },
        {
            id: 5,
            type: 'medication',
            description: 'Medikament aktualisiert',
            name: 'Prednisolon 10mg',
            time: '4 Stunden',
            icon: '💊'
        }
    ];
}

function displayRecentActivities() {
    const container = document.getElementById('recent-activities');
    if (!container) return;

    if (dashboardData.activities.length === 0) {
        container.innerHTML = '<p class="no-activities">Keine Aktivitäten gefunden</p>';
        return;
    }

    const activitiesHTML = dashboardData.activities.map(activity => `
        <div class="activity-item" data-activity-id="${activity.id}">
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <p class="activity-description">${activity.description}</p>
                ${activity.patient ? `<span class="activity-patient">${activity.patient}</span>` : ''}
                ${activity.name ? `<span class="activity-name">${activity.name}</span>` : ''}
            </div>
            <span class="activity-time">vor ${activity.time}</span>
        </div>
    `).join('');

    container.innerHTML = activitiesHTML;

    // Add click handlers for activities
    container.querySelectorAll('.activity-item').forEach(item => {
        item.addEventListener('click', handleActivityClick);
    });
}

function handleActivityClick(event) {
    const activityItem = event.currentTarget;
    const activityId = activityItem.dataset.activityId;
    const activity = dashboardData.activities.find(a => a.id == activityId);

    if (!activity) return;

    // Handle different activity types
    switch (activity.type) {
        case 'calculation':
            if (activity.patient) {
                // Navigate to dosage calculator with pre-filled patient
                showAlert('Navigation zur Dosierungsberechnung...', 'info');
                // window.location.href = `/dosage?patient=${encodeURIComponent(activity.patient)}`;
            }
            break;
        case 'medication':
            if (activity.name) {
                // Navigate to medication details
                showAlert('Navigation zu Medikament-Details...', 'info');
                // window.location.href = `/medications/search?q=${encodeURIComponent(activity.name)}`;
            }
            break;
        case 'scan':
            // Navigate to barcode scanner
            showAlert('Navigation zum Barcode-Scanner...', 'info');
            // window.location.href = '/barcode/scan';
            break;
        default:
            showAlert('Aktivität ausgewählt', 'info');
    }
}

// Refresh activities
async function refreshActivities() {
    const refreshButton = document.querySelector('[data-action="refresh-activities"]');
    if (refreshButton) {
        refreshButton.disabled = true;
        refreshButton.textContent = 'Wird geladen...';
    }

    try {
        await loadRecentActivities();
        showAlert('Aktivitäten aktualisiert', 'success');
    } catch (error) {
        showAlert('Fehler beim Aktualisieren der Aktivitäten', 'error');
    } finally {
        if (refreshButton) {
            refreshButton.disabled = false;
            refreshButton.textContent = 'Aktualisieren';
        }
    }
}

// Auto-refresh activities every 5 minutes
let activitiesRefreshInterval;

function startActivitiesAutoRefresh() {
    activitiesRefreshInterval = setInterval(() => {
        loadRecentActivities();
    }, 5 * 60 * 1000); // 5 minutes
}

function stopActivitiesAutoRefresh() {
    if (activitiesRefreshInterval) {
        clearInterval(activitiesRefreshInterval);
        activitiesRefreshInterval = null;
    }
}

// Export functions
window.loadRecentActivities = loadRecentActivities;
window.refreshActivities = refreshActivities;
window.startActivitiesAutoRefresh = startActivitiesAutoRefresh;
window.stopActivitiesAutoRefresh = stopActivitiesAutoRefresh;