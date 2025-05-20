// public/js/components/medications.js - Medications management

// Load Popular Medications
async function loadPopularMedications() {
    try {
        const response = await api.get('/medications?limit=6');
        dashboardData.medications = response.medications || [];
        displayPopularMedications();
    } catch (error) {
        console.error('Error loading popular medications:', error);
        const container = document.getElementById('popular-medications');
        if (container) {
            container.innerHTML = '<p class="no-medications">Keine Medikamente gefunden</p>';
        }
    }
}

function displayPopularMedications() {
    const container = document.getElementById('popular-medications');
    if (!container) return;

    if (dashboardData.medications.length === 0) {
        container.innerHTML = '<p class="no-medications">Keine Medikamente gefunden</p>';
        return;
    }

    const medicationsHTML = dashboardData.medications.map(med => `
        <div class="medication-item" onclick="viewMedication('${med.id}')" data-medication-id="${med.id}">
            <div class="medication-icon">
                <span class="material-symbols-outlined">
                    pill
                </span>
            </div>
            <div class="medication-content">
                <h4 class="medication-name">${utils.sanitizeHTML(med.name)}</h4>
                <p class="medication-info">${utils.sanitizeHTML(med.activeIngredient)} - ${utils.sanitizeHTML(med.strength)}</p>
                <span class="medication-form">${utils.sanitizeHTML(med.form)}</span>
            </div>
        </div>
    `).join('');

    container.innerHTML = medicationsHTML;
}

// Load Medications for Quick Dosage
async function loadMedicationsForQuickDosage() {
    try {
        const response = await api.get('/medications');
        const medications = response.medications || [];

        const select = document.getElementById('quick-medication');
        if (!select) return;

        select.innerHTML = '<option value="">Medikament wählen...</option>';

        medications.forEach(med => {
            const option = document.createElement('option');
            option.value = med.id;
            option.textContent = `${med.name} (${med.strength})`;
            option.dataset.medication = JSON.stringify(med);
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading medications for quick dosage:', error);
        showAlert('Fehler beim Laden der Medikamente', 'error');
    }
}

// View specific medication
function viewMedication(medicationId) {
    if (!medicationId) return;
    window.location.href = `/medications/?medicationId=${medicationId}`;
}

// Search medications
async function searchMedications(query) {
    if (!query || query.length < 2) return [];

    try {
        const response = await api.get(`/medications/search?q=${encodeURIComponent(query)}`);
        return response.medications || [];
    } catch (error) {
        console.error('Error searching medications:', error);
        return [];
    }
}

// Add medication autocomplete functionality
function initializeMedicationAutocomplete() {
    const input = document.getElementById('quick-medication-search');
    if (!input) return;

    let currentSearchTimeout;
    let currentResults = [];

    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'medication-search-results';
    resultsContainer.style.position = 'absolute';
    resultsContainer.style.top = '100%';
    resultsContainer.style.left = '0';
    resultsContainer.style.right = '0';
    resultsContainer.style.zIndex = '1000';
    resultsContainer.style.display = 'none';

    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(resultsContainer);

    // Debounced search function
    const debouncedSearch = utils.debounce(async (query) => {
        if (query.length < 2) {
            hideResults();
            return;
        }

        const results = await searchMedications(query);
        currentResults = results;
        displaySearchResults(results);
    }, 300);

    // Input event listener
    input.addEventListener('input', (event) => {
        const query = event.target.value.trim();
        debouncedSearch(query);
    });

    // Hide results when clicking outside
    document.addEventListener('click', (event) => {
        if (!input.contains(event.target) && !resultsContainer.contains(event.target)) {
            hideResults();
        }
    });

    function displaySearchResults(results) {
        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="search-result-item no-results">Keine Medikamente gefunden</div>';
        } else {
            resultsContainer.innerHTML = results.map(med => `
                <div class="search-result-item" data-medication-id="${med.id}">
                    <div class="search-result-name">${utils.sanitizeHTML(med.name)}</div>
                    <div class="search-result-details">${utils.sanitizeHTML(med.activeIngredient)} - ${utils.sanitizeHTML(med.strength)}</div>
                </div>
            `).join('');

            // Add click handlers
            resultsContainer.querySelectorAll('.search-result-item[data-medication-id]').forEach(item => {
                item.addEventListener('click', () => {
                    const medicationId = item.dataset.medicationId;
                    selectMedication(medicationId);
                });
            });
        }

        resultsContainer.style.display = 'block';
    }

    function hideResults() {
        resultsContainer.style.display = 'none';
    }

    function selectMedication(medicationId) {
        const medication = currentResults.find(med => med.id === medicationId);
        if (medication) {
            input.value = medication.name;
            input.dataset.selectedMedicationId = medicationId;
            hideResults();

            // Trigger change event for other components
            input.dispatchEvent(new CustomEvent('medicationSelected', {
                detail: { medication }
            }));
        }
    }
}

// Medication favorites management
const medicationFavorites = {
    get() {
        return utils.storage.get('medicationFavorites', []);
    },

    add(medicationId) {
        const favorites = this.get();
        if (!favorites.includes(medicationId)) {
            favorites.push(medicationId);
            utils.storage.set('medicationFavorites', favorites);
            this.updateDisplays();
            showAlert('Medikament zu Favoriten hinzugefügt', 'success');
        }
    },

    remove(medicationId) {
        const favorites = this.get();
        const index = favorites.indexOf(medicationId);
        if (index > -1) {
            favorites.splice(index, 1);
            utils.storage.set('medicationFavorites', favorites);
            this.updateDisplays();
            showAlert('Medikament aus Favoriten entfernt', 'info');
        }
    },

    toggle(medicationId) {
        const favorites = this.get();
        if (favorites.includes(medicationId)) {
            this.remove(medicationId);
        } else {
            this.add(medicationId);
        }
    },

    updateDisplays() {
        const favorites = this.get();

        // Update favorite buttons
        document.querySelectorAll('.medication-favorite-btn').forEach(btn => {
            const medicationId = btn.dataset.medicationId;
            const isFavorite = favorites.includes(medicationId);
            btn.classList.toggle('active', isFavorite);
            btn.textContent = isFavorite ? '❤️' : '🤍';
            btn.title = isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen';
        });
    }
};

// Add favorite buttons to medication items
function addFavoriteButtons() {
    document.querySelectorAll('.medication-item').forEach(item => {
        const medicationId = item.dataset.medicationId;
        if (!medicationId) return;

        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'medication-favorite-btn';
        favoriteBtn.dataset.medicationId = medicationId;
        favoriteBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            medicationFavorites.toggle(medicationId);
        });

        item.appendChild(favoriteBtn);
    });

    medicationFavorites.updateDisplays();
}

// Export functions
window.loadPopularMedications = loadPopularMedications;
window.loadMedicationsForQuickDosage = loadMedicationsForQuickDosage;
window.viewMedication = viewMedication;
window.searchMedications = searchMedications;
window.initializeMedicationAutocomplete = initializeMedicationAutocomplete;
window.medicationFavorites = medicationFavorites;