// public/js/pages/medications.js - Medications page functionality

// Medications data
let medicationsData = {
    medications: [],
    filteredMedications: [],
    totalCount: 0,
    currentPage: 1,
    itemsPerPage: 20,
    filters: {
        search: '',
        category: '',
        form: '',
        sort: 'name'
    }
};

// Current medication being edited/viewed
let currentMedication = null;

// Barcode scanner variables
let scannerInstance = null;
let currentCamera = "environment";
let currentScanMode = 'camera';
let scannedBarcode = null;
let scannedBarcodeType = null;

// Initialize medications page
document.addEventListener('DOMContentLoaded', function() {
    initMedicationsPage();
    setupBarcodeButtons();
});

function setupBarcodeButtons() {
    // Finde den Barcode-Scanner-Button und füge einen Event-Listener hinzu
    const scannerBtn = document.querySelector('.barcode-scan-btn');
    if (scannerBtn) {
        scannerBtn.addEventListener('click', function(event) {
            event.preventDefault();
            openBarcodeScanner();
        });
    }
}

async function initMedicationsPage() {
    try {
        showLoading();

        // Load medications data
        await loadMedications();

        // Setup event listeners
        setupEventListeners();

        // Initialize UI
        updateMedicationsDisplay();
        updateStats();

        // Check for URL parameters
        checkUrlParameters();

        hideLoading();

        showAlert('Medikamente geladen', 'success', 2000);
    } catch (error) {
        console.error('Error initializing medications page:', error);
        showAlert('Fehler beim Laden der Medikamente: ' + error.message, 'error');
        hideLoading();
    }
}

// Check URL parameters for automatic actions
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);

    // Check if medicationId parameter is present (takes priority over add parameter)
    const medicationId = urlParams.get('medicationId');
    if (medicationId) {
        setTimeout(() => {
            const medication = medicationsData.medications.find(med => med.id === medicationId);
            if (medication) {
                viewMedicationDetail(medicationId);
            } else {
                showAlert(`Medikament mit ID ${medicationId} nicht gefunden`, 'error');
            }
            // Clean up URL without reloading the page
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }, 100); // Small delay to ensure UI is fully loaded
        return; // Exit early to avoid checking other parameters
    }

    // Check if add=true parameter is present
    if (urlParams.get('add') === 'true') {
        setTimeout(() => {
            openAddMedicationModal();
            utils.cleanUpUrl();
        }, 100); // Small delay to ensure UI is fully loaded
    }

    // Check if scan-barcode=true parameter is present
    if(urlParams.get('scan-barcode') === 'true'){
        setTimeout(() => {
            openBarcodeScanner()
            utils.cleanUpUrl()
        }, 100)  // Small delay to ensure UI is fully loaded
    }

}

// Load medications from API
async function loadMedications() {
    try {
        const response = await api.get('/medications');
        medicationsData.medications = response.medications || [];
        medicationsData.totalCount = medicationsData.medications.length;

        // Apply current filters
        applyFilters();
    } catch (error) {
        console.error('Error loading medications:', error);
        // Use dummy data for demonstration
        medicationsData.medications = generateDummyMedications();
        medicationsData.totalCount = medicationsData.medications.length;
        applyFilters();
    }
}

// Generate dummy medications for demonstration
function generateDummyMedications() {
    const categories = ['Anästhetika', 'Antibiotika', 'Antiparasitika', 'Augensalbe', 'Bronchienerweiterer', 'Ergänzungsfuttermittel', 'Entzündungshemmer','Salbe', 'Schleimlöser', 'Impfstoffe', 'Hormone', 'Vitamine', 'Sonstige'];
    const forms = ['Tablette', 'Kapsel', 'Tropfen', 'Sirup', 'Injektion', 'Paste', 'Puder', 'Salbe', 'Spray'];
    const dosageUnits = ['mg', 'g', 'mcg', 'pg', 'ml', 'l', 'IU', 'Stk', 'Tropfen', 'Hub', 'Beutel', '%'];

    const medications = [
        {
            id: '550e8400-e29b-41d4-a716-446655440001',
            name: 'Amoxicillin',
            activeIngredient: 'Amoxicillin',
            strength: '500mg',
            dosageAmount: 500,
            dosageUnit: 'mg',
            category: 'Antibiotika',
            form: 'Tablette',
            manufacturer: 'VetPharm GmbH',
            description: 'Breitspektrum-Antibiotikum zur Behandlung bakterieller Infektionen',
            dosageInstructions: ['Mit oder ohne Futter geben', 'Kur vollständig zu Ende führen', 'Alle 12 Stunden verabreichen'],
            sideEffects: 'Mögliche Verdauungsstörungen, Durchfall, Übelkeit',
            contraindications: 'Bekannte Allergie gegen Penicilline',
            interactions: 'Kann die Wirkung von Warfarin verstärken',
            storage: 'Bei Raumtemperatur lagern, vor Feuchtigkeit schützen',
            prescriptionRequired: true,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: '550e8400-e29b-41d4-a716-446655440002',
            name: 'Metacam',
            activeIngredient: 'Meloxicam',
            strength: '5mg/ml',
            dosageAmount: 5,
            dosageUnit: 'mg',
            category: 'Schmerzmittel',
            form: 'Tropfen',
            manufacturer: 'Boehringer Ingelheim',
            description: 'Nicht-steroidales Antiphlogistikum zur Schmerzbehandlung',
            dosageInstructions: ['Nach dem Füttern geben', 'Nicht bei Nierenproblemen verwenden'],
            sideEffects: 'Magen-Darm-Beschwerden, Nierenprobleme bei Langzeitanwendung',
            contraindications: 'Nieren- oder Lebererkrankungen, Herzinsuffizienz',
            interactions: 'Nicht mit anderen NSAIDs kombinieren',
            storage: 'Bei Raumtemperatur lagern',
            prescriptionRequired: true,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: '550e8400-e29b-41d4-a716-446655440003',
            name: 'Nobivac DHPPi',
            activeIngredient: 'Staupe-, Hepatitis-, Parvovirose-, Parainfluenza-Impfstoff',
            strength: '1 Dosis',
            dosageAmount: 1,
            dosageUnit: 'Stk',
            category: 'Impfstoffe',
            form: 'Injektion',
            manufacturer: 'MSD Animal Health',
            description: 'Kombinationsimpfstoff für Hunde',
            dosageInstructions: ['Subkutan oder intramuskulär injizieren', 'Vor Gebrauch auf Raumtemperatur bringen'],
            sideEffects: 'Lokale Schwellung an der Injektionsstelle, vorübergehende Müdigkeit',
            contraindications: 'Akute Erkrankungen, Immunsuppression',
            interactions: 'Nicht mit Immunsuppressiva kombinieren',
            storage: 'Gekühlt lagern (2-8°C), nicht einfrieren',
            prescriptionRequired: true,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    // Add more dummy medications
    for (let i = 4; i <= 25; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const form = forms[Math.floor(Math.random() * forms.length)];
        const dosageUnit = dosageUnits[Math.floor(Math.random() * dosageUnits.length)];
        const dosageAmount = Math.floor(Math.random() * 500) + 50;

        medications.push({
            id: `550e8400-e29b-41d4-a716-4466554400${i.toString().padStart(2, '0')}`,
            name: `Medikament ${i}`,
            activeIngredient: `Wirkstoff ${i}`,
            strength: `${dosageAmount}${dosageUnit}`,
            dosageAmount: dosageAmount,
            dosageUnit: dosageUnit,
            category: category,
            form: form,
            manufacturer: `Hersteller ${i}`,
            description: `Beschreibung für Medikament ${i}. Weitere Details zur Anwendung und Wirkweise.`,
            dosageInstructions: [`Hinweis 1 für ${i}`, `Hinweis 2 für ${i}`],
            sideEffects: `Mögliche Nebenwirkungen für Medikament ${i}`,
            contraindications: `Gegenanzeigen für Medikament ${i}`,
            interactions: `Wechselwirkungen für Medikament ${i}`,
            storage: Math.random() > 0.5 ? 'Bei Raumtemperatur lagern' : 'Gekühlt lagern',
            prescriptionRequired: Math.random() > 0.3,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString()
        });
    }

    return medications;
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('medication-search');
    if (searchInput) {
        searchInput.addEventListener('input', utils.debounce((e) => {
            medicationsData.filters.search = e.target.value;
            medicationsData.currentPage = 1;
            applyFilters();
            updateMedicationsDisplay();
            toggleClearButton();
        }, 300));
    }

    // Filter selects
    document.getElementById('category-filter')?.addEventListener('change', (e) => {
        medicationsData.filters.category = e.target.value;
        medicationsData.currentPage = 1;
        applyFilters();
        updateMedicationsDisplay();
    });

    document.getElementById('form-filter')?.addEventListener('change', (e) => {
        medicationsData.filters.form = e.target.value;
        medicationsData.currentPage = 1;
        applyFilters();
        updateMedicationsDisplay();
    });

    document.getElementById('sort-filter')?.addEventListener('change', (e) => {
        medicationsData.filters.sort = e.target.value;
        applyFilters();
        updateMedicationsDisplay();
    });

    // Items per page
    document.getElementById('items-per-page')?.addEventListener('change', (e) => {
        medicationsData.itemsPerPage = parseInt(e.target.value);
        medicationsData.currentPage = 1;
        updateMedicationsDisplay();
    });

    // Modal close events
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeMedicationModal();
            closeMedicationDetailModal();
            closeDeleteModal();
            closeBarcodeScanner();
            closeAddBarcodeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMedicationModal();
            closeMedicationDetailModal();
            closeDeleteModal();
            closeBarcodeScanner();
            closeAddBarcodeModal();
        }
    });
}

// Toggle clear search button
function toggleClearButton() {
    const clearBtn = document.querySelector('.search-clear-btn');
    const searchInput = document.getElementById('medication-search');

    if (clearBtn && searchInput) {
        clearBtn.style.display = searchInput.value ? 'block' : 'none';
    }
}

// Clear search
function clearSearch() {
    const searchInput = document.getElementById('medication-search');
    if (searchInput) {
        searchInput.value = '';
        medicationsData.filters.search = '';
        medicationsData.currentPage = 1;
        applyFilters();
        updateMedicationsDisplay();
        toggleClearButton();
    }
}

// Apply filters and sorting
function applyFilters() {
    let filtered = [...medicationsData.medications];

    // Apply search filter
    if (medicationsData.filters.search) {
        const searchTerm = medicationsData.filters.search.toLowerCase();
        filtered = filtered.filter(med =>
            med.name.toLowerCase().includes(searchTerm) ||
            med.activeIngredient.toLowerCase().includes(searchTerm) ||
            (med.manufacturer && med.manufacturer.toLowerCase().includes(searchTerm)) ||
            (med.description && med.description.toLowerCase().includes(searchTerm))
        );
    }

    // Apply category filter
    if (medicationsData.filters.category) {
        filtered = filtered.filter(med => med.category === medicationsData.filters.category);
    }

    // Apply form filter
    if (medicationsData.filters.form) {
        filtered = filtered.filter(med => med.form === medicationsData.filters.form);
    }

    // Apply sorting
    filtered.sort((a, b) => {
        switch (medicationsData.filters.sort) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'category':
                return a.category.localeCompare(b.category);
            case 'created':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'updated':
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            default:
                return 0;
        }
    });

    medicationsData.filteredMedications = filtered;
    updateStats();
}

// Update statistics
function updateStats() {
    document.getElementById('total-medications-count').textContent = medicationsData.totalCount;
    document.getElementById('filtered-medications-count').textContent = medicationsData.filteredMedications.length;

    // Count unique categories
    const categories = new Set(medicationsData.medications.map(med => med.category));
    document.getElementById('categories-count').textContent = categories.size;
}

// Update medications display
function updateMedicationsDisplay() {
    const container = document.getElementById('medications-grid');
    const loadingEl = document.getElementById('medications-loading');
    const emptyEl = document.getElementById('medications-empty');

    if (!container) return;

    // Calculate pagination
    const startIndex = (medicationsData.currentPage - 1) * medicationsData.itemsPerPage;
    const endIndex = startIndex + medicationsData.itemsPerPage;
    const paginatedMedications = medicationsData.filteredMedications.slice(startIndex, endIndex);

    // Show/hide states
    if (medicationsData.filteredMedications.length === 0) {
        container.style.display = 'none';
        loadingEl.style.display = 'none';
        emptyEl.style.display = 'block';
        updatePagination();
        return;
    }

    container.style.display = 'grid';
    loadingEl.style.display = 'none';
    emptyEl.style.display = 'none';

    // Render medication cards
    container.innerHTML = paginatedMedications.map(med => createMedicationCard(med)).join('');

    // Update pagination
    updatePagination();
}

// Create medication card HTML
function createMedicationCard(medication) {
    const updatedDate = new Date(medication.updatedAt);
    const timeAgo = getTimeAgo(updatedDate);

    // Get dosage display
    const dosageDisplay = medication.dosageAmount && medication.dosageUnit
        ? `${medication.dosageAmount} ${medication.dosageUnit}`
        : (medication.strength || 'Nicht angegeben');

    return `
        <div class="medication-card" data-medication-id="${medication.id}">
            <div class="medication-card-header">
                <div class="medication-category-badge">
                    ${medication.category}
                </div>
                <h3 class="medication-name" onclick="viewMedicationDetail('${medication.id}')" >${utils.sanitizeHTML(medication.name)}</h3>
                <p class="medication-ingredient">${utils.sanitizeHTML(medication.activeIngredient)}</p>
                <p class="medication-strength">${utils.sanitizeHTML(dosageDisplay)}</p>
            </div>
            <div class="medication-card-body">
                <div class="medication-details">
                    <div class="medication-detail">
                        <span class="medication-detail-label">Hersteller</span>
                        <span class="medication-detail-value">${utils.sanitizeHTML(medication.manufacturer || 'Nicht angegeben')}</span>
                    </div>
                    <div class="medication-detail">
                        <span class="medication-detail-label">Form</span>
                        <span class="medication-detail-value">${medication.form || 'Nicht angegeben'}</span>
                    </div>
                    <div class="medication-detail">
                        <span class="medication-detail-label">Lagerung</span>
                        <span class="medication-detail-value">${medication.storage || 'Nicht angegeben'}</span>
                    </div>
                    <div class="medication-detail">
                        <span class="medication-detail-label">Verschreibungspflichtig</span>
                        <span class="medication-detail-value">
                            <span class="prescription-badge ${medication.prescriptionRequired ? 'required' : 'not-required'}">
                                ${medication.prescriptionRequired ? '🔴 Ja' : '🟢 Nein'}
                            </span>
                        </span>
                    </div>
                </div>
                ${medication.description ? `
                    <p class="medication-description">${utils.sanitizeHTML(medication.description)}</p>
                ` : ''}
            </div>
            <div class="medication-card-footer">
                <span class="medication-updated">Aktualisiert: ${timeAgo}</span>
                <div class="medication-actions">
                    <button class="medication-action-btn" 
                            onclick="editMedication('${medication.id}')" 
                            title="Bearbeiten">
                        <span class="material-symbols-outlined">
                            edit
                        </span>
                    </button>
                    <button class="medication-action-btn" 
                            onclick="duplicateMedication('${medication.id}')" 
                            title="Duplizieren">
                        <span class="material-symbols-outlined">
                            shadow
                        </span>
                    </button>
                    <button class="medication-action-btn delete" 
                            onclick="deleteMedication('${medication.id}')" 
                            title="Löschen">
                        <span class="material-symbols-outlined">
                            delete
                        </span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Get time ago string
function getTimeAgo(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Heute';
    if (diffDays === 2) return 'Gestern';
    if (diffDays <= 7) return `vor ${diffDays} Tagen`;
    if (diffDays <= 30) return `vor ${Math.ceil(diffDays / 7)} Wochen`;
    return `vor ${Math.ceil(diffDays / 30)} Monaten`;
}

// Update pagination
function updatePagination() {
    const paginationContainer = document.getElementById('medications-pagination');
    const paginationInfo = document.getElementById('pagination-info-text');

    if (!paginationContainer) return;

    const totalPages = Math.ceil(medicationsData.filteredMedications.length / medicationsData.itemsPerPage);
    const currentPage = medicationsData.currentPage;

    // Update pagination info
    if (paginationInfo) {
        const startItem = (currentPage - 1) * medicationsData.itemsPerPage + 1;
        const endItem = Math.min(currentPage * medicationsData.itemsPerPage, medicationsData.filteredMedications.length);
        const totalItems = medicationsData.filteredMedications.length;

        paginationInfo.textContent = `Zeige ${startItem}-${endItem} von ${totalItems} Medikamenten`;
    }

    // Generate pagination buttons
    let paginationHTML = '';

    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage - 1})">←</button>`;
    }

    // Page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }

    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage + 1})">→</button>`;
    }

    paginationContainer.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    medicationsData.currentPage = page;
    updateMedicationsDisplay();

    // Scroll to top
    document.getElementById('medications-grid').scrollIntoView({ behavior: 'smooth' });
}

// Reset filters
function resetFilters() {
    medicationsData.filters = {
        search: '',
        category: '',
        form: '',
        sort: 'name'
    };
    medicationsData.currentPage = 1;

    // Reset form elements
    document.getElementById('medication-search').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('form-filter').value = '';
    document.getElementById('sort-filter').value = 'name';

    applyFilters();
    updateMedicationsDisplay();
    toggleClearButton();

    showAlert('Filter zurückgesetzt', 'info');
}

// Search medications
function searchMedications() {
    const searchInput = document.getElementById('medication-search');
    if (searchInput) {
        medicationsData.filters.search = searchInput.value;
        medicationsData.currentPage = 1;
        applyFilters();
        updateMedicationsDisplay();
    }
}

// View medication detail
function viewMedicationDetail(medicationId) {
    const medication = medicationsData.medications.find(med => med.id === medicationId);
    if (!medication) return;

    currentMedication = medication;
    document.getElementById('medication-detail-modal-title').textContent = `${medication.name} - Details`;

    // Generate detail content
    const detailContent = createMedicationDetailContent(medication);
    document.getElementById('medication-detail-content').innerHTML = detailContent;

    // Show the modal
    document.getElementById('medication-detail-modal').style.display = 'flex';

    // Load barcodes for this medication
    loadMedicationBarcodes(medicationId);
}

// Create medication detail content
function createMedicationDetailContent(medication) {
    const dosageDisplay = medication.dosageAmount && medication.dosageUnit
        ? `${medication.dosageAmount} ${medication.dosageUnit}`
        : (medication.strength || 'Nicht angegeben');

    const existingSections = `
        <div class="detail-section">
            <h3 class="detail-section-title">
                <span class="detail-section-icon">💊</span>
                Grundinformationen
            </h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-item-label">Name</span>
                    <span class="detail-item-value">${utils.sanitizeHTML(medication.name)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-item-label">Wirkstoff</span>
                    <span class="detail-item-value">${utils.sanitizeHTML(medication.activeIngredient)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-item-label">Dosierung</span>
                    <span class="detail-item-value">${utils.sanitizeHTML(dosageDisplay)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-item-label">Kategorie</span>
                    <span class="detail-item-value">${medication.category}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-item-label">Darreichungsform</span>
                    <span class="detail-item-value">${medication.form || 'Nicht angegeben'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-item-label">Hersteller</span>
                    <span class="detail-item-value">${utils.sanitizeHTML(medication.manufacturer || 'Nicht angegeben')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-item-label">Lagerung</span>
                    <span class="detail-item-value">${utils.sanitizeHTML(medication.storage || 'Nicht angegeben')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-item-label">Verschreibungspflichtig</span>
                    <span class="detail-item-value">
                        <span class="prescription-badge ${medication.prescriptionRequired ? 'required' : 'not-required'}">
                            ${medication.prescriptionRequired ? '🔴 Ja' : '🟢 Nein'}
                        </span>
                    </span>
                </div>
            </div>
        </div>

        ${medication.description ? `
            <div class="detail-section">
                <h3 class="detail-section-title">
                    <span class="detail-section-icon">📝</span>
                    Beschreibung
                </h3>
                <div class="detail-text-area">${utils.sanitizeHTML(medication.description)}</div>
            </div>
        ` : ''}

        ${medication.dosageInstructions && medication.dosageInstructions.length > 0 ? `
            <div class="detail-section">
                <h3 class="detail-section-title">
                    <span class="detail-section-icon">📋</span>
                    Dosierungshinweise
                </h3>
                <ul class="detail-list">
                    ${medication.dosageInstructions.map(instruction =>
        `<li class="detail-list-item">${utils.sanitizeHTML(instruction)}</li>`
    ).join('')}
                </ul>
            </div>
        ` : ''}

        ${medication.sideEffects ? `
            <div class="detail-section">
                <h3 class="detail-section-title">
                    <span class="detail-section-icon">⚠️</span>
                    Nebenwirkungen
                </h3>
                <div class="detail-text-area">${utils.sanitizeHTML(medication.sideEffects)}</div>
            </div>
        ` : ''}

        ${medication.contraindications ? `
            <div class="detail-section">
                <h3 class="detail-section-title">
                    <span class="detail-section-icon">🚫</span>
                    Kontraindikationen
                </h3>
                <div class="detail-text-area">${utils.sanitizeHTML(medication.contraindications)}</div>
            </div>
        ` : ''}

        ${medication.interactions ? `
            <div class="detail-section">
                <h3 class="detail-section-title">
                    <span class="detail-section-icon">🔄</span>
                    Wechselwirkungen
                </h3>
                <div class="detail-text-area">${utils.sanitizeHTML(medication.interactions)}</div>
            </div>
        ` : ''}

        <div class="detail-section">
            <h3 class="detail-section-title">
                <span class="detail-section-icon">📅</span>
                Metadaten
            </h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-item-label">Erstellt am</span>
                    <span class="detail-item-value">${new Date(medication.createdAt).toLocaleDateString('de-DE')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-item-label">Zuletzt bearbeitet</span>
                    <span class="detail-item-value">${new Date(medication.updatedAt).toLocaleDateString('de-DE')}</span>
                </div>
            </div>
        </div>
    `;

    // Add barcode section
    const barcodeSection = `
        <div class="detail-section" id="medication-barcodes-section">
            <h3 class="detail-section-title">
                <span class="detail-section-icon">
                    <span class="material-symbols-outlined">qr_code</span>
                </span>
                Barcodes
                <button class="btn btn-sm btn-outline" onclick="openAddBarcodeToMedication('${medication.id}')" style="margin-left: auto;">
                    <i class="btn-icon">
                        <span class="material-symbols-outlined">add</span>
                    </i>
                    Barcode hinzufügen
                </button>
            </h3>
            <div id="medication-barcodes-container">
                <div class="barcode-loading">Lade Barcodes...</div>
            </div>
        </div>
    `;

    // Return the combined content
    return existingSections + barcodeSection;
}

// Close medication detail modal
function closeMedicationDetailModal() {
    document.getElementById('medication-detail-modal').style.display = 'none';
    currentMedication = null;
}

// Edit medication from detail view
function editMedicationFromDetail() {
    if (currentMedication) {
        const medication = currentMedication;
        closeMedicationDetailModal();
        editMedication(medication.id);
    }
}

// Open add medication modal
function openAddMedicationModal() {
    currentMedication = null;
    document.getElementById('medication-modal-title').textContent = 'Medikament hinzufügen';
    document.getElementById('save-btn-text').textContent = 'Speichern';

    // Reset form
    document.getElementById('medication-form').reset();
    document.getElementById('medication-id').value = '';

    // Reset dosage instructions
    resetDosageInstructions();

    document.getElementById('medication-modal').style.display = 'flex';
}

// Edit medication
function editMedication(medicationId) {
    const medication = medicationsData.medications.find(med => med.id === medicationId);
    if (!medication) return;

    currentMedication = medication;
    document.getElementById('medication-modal-title').textContent = 'Medikament bearbeiten';
    document.getElementById('save-btn-text').textContent = 'Änderungen speichern';

    // Fill form with medication data
    document.getElementById('medication-id').value = medication.id;
    document.getElementById('medication-name').value = medication.name;
    document.getElementById('medication-strength').value = medication.strength || '';
    document.getElementById('medication-active-ingredient').value = medication.activeIngredient;
    document.getElementById('medication-manufacturer').value = medication.manufacturer || '';
    document.getElementById('medication-category').value = medication.category;
    document.getElementById('medication-form-select').value = medication.form || '';
    document.getElementById('medication-dosage-amount').value = medication.dosageAmount || '';
    document.getElementById('medication-dosage-unit').value = medication.dosageUnit || '';
    document.getElementById('medication-description').value = medication.description || '';
    document.getElementById('medication-side-effects').value = medication.sideEffects || '';
    document.getElementById('medication-contraindications').value = medication.contraindications || '';
    document.getElementById('medication-interactions').value = medication.interactions || '';
    document.getElementById('medication-storage').value = medication.storage || '';
    document.getElementById('medication-prescription-required').value = medication.prescriptionRequired.toString();

    // Fill dosage instructions
    resetDosageInstructions();
    if (medication.dosageInstructions && medication.dosageInstructions.length > 0) {
        medication.dosageInstructions.forEach((instruction, index) => {
            if (index === 0) {
                document.querySelector('#dosage-instructions-container .dosage-instruction-item input').value = instruction;
            } else {
                addDosageInstruction(instruction);
            }
        });
    }

    document.getElementById('medication-modal').style.display = 'flex';
}

// Duplicate medication
function duplicateMedication(medicationId) {
    const medication = medicationsData.medications.find(med => med.id === medicationId);
    if (!medication) return;

    // Copy medication data but change name
    const duplicatedMedication = {
        ...medication,
        name: `${medication.name} (Kopie)`,
        id: '' // Will be generated by server
    };

    // Open modal with duplicated data
    currentMedication = null;
    document.getElementById('medication-modal-title').textContent = 'Medikament duplizieren';
    document.getElementById('save-btn-text').textContent = 'Speichern';

    // Fill form
    document.getElementById('medication-id').value = '';
    document.getElementById('medication-name').value = duplicatedMedication.name;
    document.getElementById('medication-strength').value = duplicatedMedication.strength || '';
    document.getElementById('medication-active-ingredient').value = duplicatedMedication.activeIngredient;
    document.getElementById('medication-manufacturer').value = duplicatedMedication.manufacturer || '';
    document.getElementById('medication-category').value = duplicatedMedication.category;
    document.getElementById('medication-form-select').value = duplicatedMedication.form || '';
    document.getElementById('medication-dosage-amount').value = duplicatedMedication.dosageAmount || '';
    document.getElementById('medication-dosage-unit').value = duplicatedMedication.dosageUnit || '';
    document.getElementById('medication-description').value = duplicatedMedication.description || '';
    document.getElementById('medication-side-effects').value = duplicatedMedication.sideEffects || '';
    document.getElementById('medication-contraindications').value = duplicatedMedication.contraindications || '';
    document.getElementById('medication-interactions').value = duplicatedMedication.interactions || '';
    document.getElementById('medication-storage').value = duplicatedMedication.storage || '';
    document.getElementById('medication-prescription-required').value = duplicatedMedication.prescriptionRequired.toString();

    // Fill dosage instructions
    resetDosageInstructions();
    if (duplicatedMedication.dosageInstructions && duplicatedMedication.dosageInstructions.length > 0) {
        duplicatedMedication.dosageInstructions.forEach((instruction, index) => {
            if (index === 0) {
                document.querySelector('#dosage-instructions-container .dosage-instruction-item input').value = instruction;
            } else {
                addDosageInstruction(instruction);
            }
        });
    }

    document.getElementById('medication-modal').style.display = 'flex';
}

// Delete medication
function deleteMedication(medicationId) {
    const medication = medicationsData.medications.find(med => med.id === medicationId);
    if (!medication) return;

    document.getElementById('delete-medication-name').textContent = medication.name;
    currentMedication = medication;
    document.getElementById('delete-confirmation-modal').style.display = 'flex';
}

// Confirm delete medication
async function confirmDeleteMedication() {
    if (!currentMedication) return;

    try {
        showLoading();

        // Delete from server
        await api.delete(`/medications/${currentMedication.id}`);

        // Remove from local data
        medicationsData.medications = medicationsData.medications.filter(med => med.id !== currentMedication.id);
        medicationsData.totalCount = medicationsData.medications.length;

        // Reapply filters and update display
        applyFilters();
        updateMedicationsDisplay();

        closeDeleteModal();
        hideLoading();

        showAlert('Medikament erfolgreich gelöscht', 'success');
    } catch (error) {
        console.error('Error deleting medication:', error);

        // For demo purposes, simulate successful deletion
        medicationsData.medications = medicationsData.medications.filter(med => med.id !== currentMedication.id);
        medicationsData.totalCount = medicationsData.medications.length;
        applyFilters();
        updateMedicationsDisplay();
        closeDeleteModal();
        hideLoading();

        showAlert('Medikament erfolgreich gelöscht', 'success');
    }
}

// Save medication
async function saveMedication() {
    const form = document.getElementById('medication-form');
    const formData = new FormData(form);

    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Prepare medication data matching your model
    const medicationData = {
        name: formData.get('name'),
        activeIngredient: formData.get('activeIngredient'),
        strength: formData.get('strength') || null,
        dosageAmount: formData.get('dosageAmount') ? parseFloat(formData.get('dosageAmount')) : null,
        dosageUnit: formData.get('dosageUnit') || null,
        category: formData.get('category'),
        form: formData.get('form') || null,
        manufacturer: formData.get('manufacturer') || null,
        description: formData.get('description') || null,
        dosageInstructions: Array.from(formData.getAll('dosageInstructions[]')).filter(instruction => instruction.trim()),
        sideEffects: formData.get('sideEffects') || null,
        contraindications: formData.get('contraindications') || null,
        interactions: formData.get('interactions') || null,
        storage: formData.get('storage') || null,
        prescriptionRequired: formData.get('prescriptionRequired') === 'true'
    };

    try {
        showLoading();

        let savedMedication;
        if (currentMedication) {
            // Update existing medication
            medicationData.id = currentMedication.id;
            savedMedication = await api.put(`/medications/${currentMedication.id}`, medicationData);

            // Update in local data
            const index = medicationsData.medications.findIndex(med => med.id === currentMedication.id);
            if (index !== -1) {
                medicationsData.medications[index] = {
                    ...medicationData,
                    id: currentMedication.id,
                    createdAt: currentMedication.createdAt,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Create new medication
            savedMedication = await api.post('/medications', medicationData);

            // Add to local data (simulate server response)
            const newMedication = {
                ...medicationData,
                id: `550e8400-e29b-41d4-a716-446655440${(medicationsData.medications.length + 100).toString().padStart(3, '0')}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            medicationsData.medications.unshift(newMedication);
            medicationsData.totalCount = medicationsData.medications.length;
        }

        // Reapply filters and update display
        applyFilters();
        updateMedicationsDisplay();

        closeMedicationModal();
        hideLoading();

        showAlert(currentMedication ? 'Medikament erfolgreich aktualisiert' : 'Medikament erfolgreich erstellt', 'success');
    } catch (error) {
        console.error('Error saving medication:', error);

        // For demo purposes, simulate successful save
        if (currentMedication) {
            const index = medicationsData.medications.findIndex(med => med.id === currentMedication.id);
            if (index !== -1) {
                medicationsData.medications[index] = {
                    ...medicationData,
                    id: currentMedication.id,
                    createdAt: currentMedication.createdAt,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            const newMedication = {
                ...medicationData,
                id: `550e8400-e29b-41d4-a716-446655440${(medicationsData.medications.length + 100).toString().padStart(3, '0')}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            medicationsData.medications.unshift(newMedication);
            medicationsData.totalCount = medicationsData.medications.length;
        }

        applyFilters();
        updateMedicationsDisplay();
        closeMedicationModal();
        hideLoading();

        showAlert(currentMedication ? 'Medikament erfolgreich aktualisiert' : 'Medikament erfolgreich erstellt', 'success');
    }
}

// Close medication modal
function closeMedicationModal() {
    document.getElementById('medication-modal').style.display = 'none';
    currentMedication = null;
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('delete-confirmation-modal').style.display = 'none';
    currentMedication = null;
}

// Dosage instructions management
function addDosageInstruction(value = '') {
    const container = document.getElementById('dosage-instructions-container');
    const instructionItem = document.createElement('div');
    instructionItem.className = 'dosage-instruction-item';
    instructionItem.innerHTML = `
        <input type="text" name="dosageInstructions[]" class="form-input" 
               placeholder="Hinweis eingeben..." value="${utils.sanitizeHTML(value)}">
        <button type="button" class="btn btn-sm btn-secondary" onclick="removeDosageInstruction(this)">
            <i class="btn-icon">🗑️</i>
        </button>
    `;
    container.appendChild(instructionItem);
}

function removeDosageInstruction(button) {
    const container = document.getElementById('dosage-instructions-container');
    if (container.children.length > 1) {
        button.parentElement.remove();
    }
}

function resetDosageInstructions() {
    const container = document.getElementById('dosage-instructions-container');
    container.innerHTML = `
        <div class="dosage-instruction-item">
            <input type="text" name="dosageInstructions[]" class="form-input" 
                   placeholder="Hinweis eingeben...">
            <button type="button" class="btn btn-sm btn-secondary" onclick="removeDosageInstruction(this)">
                <i class="btn-icon">🗑️</i>
            </button>
        </div>
    `;
}

// Import medications
function importMedications() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv';
    input.addEventListener('change', handleImportFile);
    input.click();
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            // Process imported data
            if (Array.isArray(data)) {
                // Add imported medications
                data.forEach(med => {
                    const newMedication = {
                        ...med,
                        id: `550e8400-e29b-41d4-a716-446655440${(medicationsData.medications.length + 200).toString().padStart(3, '0')}`,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    medicationsData.medications.push(newMedication);
                });

                medicationsData.totalCount = medicationsData.medications.length;
                applyFilters();
                updateMedicationsDisplay();

                showAlert(`${data.length} Medikamente erfolgreich importiert`, 'success');
            }
        } catch (error) {
            console.error('Error importing medications:', error);
            showAlert('Fehler beim Importieren der Medikamente', 'error');
        }
    };
    reader.readAsText(file);
}

// Export medications
function exportMedications() {
    const exportData = medicationsData.medications.map(med => ({
        name: med.name,
        activeIngredient: med.activeIngredient,
        strength: med.strength,
        dosageAmount: med.dosageAmount,
        dosageUnit: med.dosageUnit,
        category: med.category,
        form: med.form,
        manufacturer: med.manufacturer,
        description: med.description,
        dosageInstructions: med.dosageInstructions,
        sideEffects: med.sideEffects,
        contraindications: med.contraindications,
        interactions: med.interactions,
        storage: med.storage,
        prescriptionRequired: med.prescriptionRequired
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vetcalc-medications-export-${utils.formatDate(new Date(), { year: 'numeric', month: '2-digit', day: '2-digit' })}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showAlert('Medikamente erfolgreich exportiert', 'success');
}

// ====================================================
// Barcode functionality
// ====================================================

// Open barcode scanner modal
function openBarcodeScanner() {
    console.log("Opening barcode scanner");
    // Make sure HTML5QrCode script is loaded
    if (typeof Html5Qrcode === 'undefined') {
        // Load HTML5QrCode script if not already available
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js';
        script.onload = function() {
            // Show scanner modal once script is loaded
            document.getElementById('barcode-scanner-modal').style.display = 'flex';
        };
        document.head.appendChild(script);
    } else {
        // If script is already loaded, just show the modal
        document.getElementById('barcode-scanner-modal').style.display = 'flex';
    }
}

// Close barcode scanner modal
function closeBarcodeScanner() {
    const modal = document.getElementById('barcode-scanner-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    document.querySelector('.scanner-hint').style.display = 'none';
    stopScanner();
}

// Switch scan mode (camera, manual, file)
function switchScanMode(mode) {
    currentScanMode = mode;

    // Update mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeMode = document.querySelector(`[data-mode="${mode}"]`);
    if (activeMode) activeMode.classList.add('active');

    // Hide all scanner containers
    document.querySelectorAll('.scanner-container').forEach(container => {
        container.style.display = 'none';
    });

    // Show the selected scanner container
    const selectedContainer = document.getElementById(`${mode}-scanner`);
    if (selectedContainer) selectedContainer.style.display = 'block';

    // Stop scanner if switching away from camera
    if (mode !== 'camera' && scannerInstance) {
        stopScanner();
    }
}

// Start camera scanner
async function startScanner() {
    try {
        if (!scannerInstance) {
            scannerInstance = new Html5Qrcode("reader");
        }

        const config = {
            fps: 10,
            qrbox: { width: 280, height: 280 },
            aspectRatio: 1.0,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
        };

        await scannerInstance.start(
            { facingMode: currentCamera },
            config,
            (decodedText, decodedResult) => onScanSuccess(decodedText, decodedResult),
            (errorMessage) => {}  // We don't need to show error messages as they happen on every frame without a barcode
        );
        // Show hint to place barcode within scanner overlay
        document.querySelector('.scanner-hint').style.display = 'block';
        updateScannerButtons(true);
        showAlert('Scanner erfolgreich gestartet', 'success');
    } catch (error) {
        console.error('Error starting scanner:', error);
        showAlert(`Fehler beim Starten des Scanners: ${error.message}`, 'error');
    }
}

// Stop camera scanner
async function stopScanner() {
    try {
        if (scannerInstance && scannerInstance.getState) {
            const state = scannerInstance.getState();
            if (state === Html5QrcodeScannerState.SCANNING) {
                await scannerInstance.stop();
            }
        }
        updateScannerButtons(false);
    } catch (error) {
        console.error('Error stopping scanner:', error);
    }
}

// Switch camera (front/back)
async function switchCamera() {
    currentCamera = currentCamera === "environment" ? "user" : "environment";

    if (scannerInstance && scannerInstance.getState && scannerInstance.getState() === Html5QrcodeScannerState.SCANNING) {
        await stopScanner();
        setTimeout(() => startScanner(), 500);
    }
}

// Update scanner buttons
function updateScannerButtons(isScanning) {
    const startBtn = document.getElementById('start-scanner-btn');
    const stopBtn = document.getElementById('stop-scanner-btn');

    if (startBtn && stopBtn) {
        startBtn.style.display = isScanning ? 'none' : 'block';
        stopBtn.style.display = isScanning ? 'block' : 'none';
    }
}

// Handle successful scan
function onScanSuccess(decodedText, decodedResult) {
    console.log('Barcode scanned:', decodedText, decodedResult);

    // Store the scanned barcode and format
    scannedBarcode = decodedText;
    scannedBarcodeType = determineBarcodeType(decodedResult);

    // Stop the scanner
    stopScanner();

    // Process the scanned barcode
    processScannedBarcode(decodedText);
}

// Determine barcode type from scan result
function determineBarcodeType(decodedResult) {
    if (!decodedResult || !decodedResult.result || !decodedResult.result.format) {
        return null;
    }

    const format = decodedResult.result.format;

    // Map Html5QrCode formats to our barcode types
    const formatMap = {
        'QR_CODE': 'QR',
        'EAN_13': 'EAN-13',
        'EAN_8': 'EAN8',
        'CODE_128': 'Code128',
        'CODE_39': 'Code39',
        'UPC_A': 'UPC',
        'UPC_E': 'UPC',
        'ITF': 'ITF'
    };

    return formatMap[format] || 'Other';
}

// Handle manual barcode input
function handleManualInput(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        processManualBarcode();
    }
}

// Process manually entered barcode
function processManualBarcode() {
    const input = document.getElementById('manual-barcode-input');
    const barcode = input.value.trim();

    if (barcode) {
        scannedBarcode = barcode;
        scannedBarcodeType = null; // Can't determine type for manual input
        processScannedBarcode(barcode);
        input.value = '';
    } else {
        showAlert('Bitte geben Sie einen Barcode ein', 'warning');
    }
}

// Process barcode from file upload
async function scanBarcodeFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        if (!scannerInstance) {
            scannerInstance = new Html5Qrcode("reader");
        }

        const decodedText = await scannerInstance.scanFile(file, true);
        scannedBarcode = decodedText;
        scannedBarcodeType = null; // Hard to determine type from file scan
        processScannedBarcode(decodedText);

        showAlert('Barcode aus Bild erfolgreich gescannt', 'success');
    } catch (error) {
        console.error('Error scanning file:', error);
        showAlert('Fehler beim Scannen des Bildes', 'error');
    }

    // Reset file input
    event.target.value = '';
}

// Process a scanned barcode
async function processScannedBarcode(barcode) {
    try {
        // First, close the scanner modal
        closeBarcodeScanner();

        // Show loading
        showLoading();

        // Search for the barcode in the database
        const response = await api.get(`/barcode/scan/${encodeURIComponent(barcode)}`);

        if (response && response.barcode) {
            // Barcode found - open the linked medication
            const medicationId = response.barcode.medicationId;
            if (medicationId) {
                hideLoading();
                viewMedicationDetail(medicationId);
                showAlert('Barcode gefunden! Medikament wird geöffnet.', 'success');
            } else {
                hideLoading();
                showAlert('Barcode gefunden, aber kein Medikament verknüpft.', 'warning');
                openAddBarcodeModal(barcode, scannedBarcodeType);
            }
        } else {
            // Barcode not found - open add barcode modal
            hideLoading();
            showAlert('Barcode nicht gefunden. Fügen Sie ihn hinzu.', 'info');
            openAddBarcodeModal(barcode, scannedBarcodeType);
        }
    } catch (error) {
        console.error('Error processing barcode:', error);

        // For demo, if API fails, we'll open the add barcode modal
        hideLoading();
        showAlert('Barcode nicht gefunden. Fügen Sie ihn hinzu.', 'info');
        openAddBarcodeModal(barcode, scannedBarcodeType);
    }
}

// Open add barcode modal
function openAddBarcodeModal(barcode = '', barcodeType = '') {
    // Fill in the barcode field
    document.getElementById('barcode-input').value = barcode;

    // Set barcode type if available
    if (barcodeType) {
        document.getElementById('barcode-type-select').value = barcodeType;
    }

    // Populate medication select
    populateMedicationSelect();

    // Show the modal
    document.getElementById('add-barcode-modal').style.display = 'flex';
}

// Populate medication select dropdown
function populateMedicationSelect() {
    const select = document.getElementById('medication-select');
    if (!select) return;

    select.innerHTML = '<option value="">Medikament wählen...</option>';

    medicationsData.medications.forEach(med => {
        const option = document.createElement('option');
        option.value = med.id;
        option.textContent = `${med.name}${med.strength ? ` (${med.strength})` : ''}`;
        select.appendChild(option);
    });

    // Add change event listener
    select.onchange = onMedicationSelect;
}

// Handle medication selection change
function onMedicationSelect(event) {
    const medicationId = event.target.value;
    const preview = document.getElementById('selected-medication-preview');

    if (!medicationId || !preview) {
        if (preview) preview.style.display = 'none';
        return;
    }

    const medication = medicationsData.medications.find(med => med.id === medicationId);
    if (!medication) return;

    preview.innerHTML = `
        <div class="preview-title">Ausgewähltes Medikament:</div>
        <div class="preview-details">
            <span><strong>Name:</strong> ${utils.sanitizeHTML(medication.name)}</span>
            <span><strong>Wirkstoff:</strong> ${utils.sanitizeHTML(medication.activeIngredient)}</span>
            <span><strong>Stärke:</strong> ${utils.sanitizeHTML(medication.strength || '-')}</span>
            <span><strong>Form:</strong> ${utils.sanitizeHTML(medication.form || '-')}</span>
            <span><strong>Kategorie:</strong> ${utils.sanitizeHTML(medication.category || '-')}</span>
            <span><strong>Hersteller:</strong> ${utils.sanitizeHTML(medication.manufacturer || '-')}</span>
        </div>
    `;
    preview.style.display = 'block';
}

// Close add barcode modal
function closeAddBarcodeModal() {
    const modal = document.getElementById('add-barcode-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Add barcode directly to a medication
function openAddBarcodeToMedication(medicationId) {
    openAddBarcodeModal();

    // Pre-select the medication
    const select = document.getElementById('medication-select');
    if (select) {
        select.value = medicationId;

        // Trigger change event to update preview
        const event = new Event('change');
        select.dispatchEvent(event);
    }
}

// Save barcode
async function saveBarcode() {
    // Get form data
    const form = document.getElementById('add-barcode-form');
    const formData = new FormData(form);

    // Validate required fields
    const medicationId = formData.get('medicationId');
    const barcode = formData.get('barcode');

    if (!medicationId) {
        showAlert('Bitte wählen Sie ein Medikament aus', 'warning');
        return;
    }

    if (!barcode) {
        showAlert('Bitte geben Sie einen Barcode ein', 'warning');
        return;
    }

    // Create barcode object
    const barcodeData = {
        medicationId: medicationId,
        barcode: barcode,
        barcodeType: formData.get('barcodeType') || (scannedBarcodeType || null),
        pzn: formData.get('pzn') || null,
        packageSize: formData.get('packageSize') || null,
        notes: formData.get('notes') || null
    };

    console.log(barcodeData)

    try {
        showLoading();

        // Save to server
        const response = await api.post('/barcode', barcodeData);

        hideLoading();
        closeAddBarcodeModal();

        // If medication detail view is open, refresh barcodes
        if (currentMedication && currentMedication.id === medicationId) {
            loadMedicationBarcodes(medicationId);
        }

        showAlert('Barcode erfolgreich gespeichert', 'success');
    } catch (error) {
        console.error('Error saving barcode:', error);

        // For demo, simulate success
        hideLoading();
        closeAddBarcodeModal();

        // If medication detail view is open, refresh barcodes
        if (currentMedication && currentMedication.id === medicationId) {
            loadMedicationBarcodes(medicationId);
        }

        showAlert('Barcode erfolgreich gespeichert', 'success');
    }
}

// Load barcodes for a medication
async function loadMedicationBarcodes(medicationId) {
    if (!medicationId) return;

    const container = document.getElementById('medication-barcodes-container');
    if (!container) return;

    // Show loading state
    container.innerHTML = '<div class="barcode-loading">Lade Barcodes...</div>';

    try {
        // Get barcodes from API
        const response = await api.get(`/barcode/medication/${medicationId}`);
        console.log(response)
        // Process response
        if (response && response.length > 0) {
            displayMedicationBarcodes(response, container);
        } else {
            // No barcodes found
            container.innerHTML = `
                <div class="barcode-empty">
                    Keine Barcodes für dieses Medikament gefunden.
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading barcodes:', error);

        // For demo, generate some dummy barcodes
        const dummyBarcodes = generateDummyBarcodes(medicationId);
        displayMedicationBarcodes(dummyBarcodes, container);
    }
}

// Generate dummy barcodes for demonstration
function generateDummyBarcodes(medicationId) {
    // Create 1-2 dummy barcodes
    const count = Math.floor(Math.random() * 2) + 1;
    const barcodes = [];

    const types = ['EAN-13', 'Code128', 'QR', 'EAN8', 'UPC'];

    for (let i = 0; i < count; i++) {
        // Generate a random barcode based on medication ID and index
        const idPart = medicationId.substring(0, 4);
        const barcodeValue = "4250" + idPart + i + "0000".substring(0, 13 - 5 - idPart.length - 1);
        const type = types[Math.floor(Math.random() * types.length)];

        barcodes.push({
            id: `bc-${medicationId}-${i}`,
            barcode: barcodeValue,
            barcodeType: type,
            medicationId: medicationId,
            pzn: Math.random() > 0.5 ? `${Math.floor(Math.random() * 10000000) + 1000000}` : null,
            packageSize: Math.random() > 0.5 ? `${Math.floor(Math.random() * 100) + 1} ${Math.random() > 0.5 ? 'Stück' : 'ml'}` : null,
            notes: Math.random() > 0.7 ? 'Zusätzliche Notizen zum Barcode' : null,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
        });
    }

    return barcodes;
}

// Display medication barcodes
function displayMedicationBarcodes(barcodes, container) {
    container.innerHTML = barcodes.map(barcode => `
        <div class="medication-barcode-item" data-barcode-id="${barcode.id}">
            <div class="barcode-info">
                <div class="barcode-value">${utils.sanitizeHTML(barcode.barcode)}</div>
                <div class="barcode-meta">
                    <span class="barcode-type-badge">${barcode.barcodeType || 'Unbekannt'}</span>
                    ${barcode.pzn ? `<span>PZN: ${utils.sanitizeHTML(barcode.pzn)}</span>` : ''}
                    ${barcode.packageSize ? `<span>Größe: ${utils.sanitizeHTML(barcode.packageSize)}</span>` : ''}
                </div>
            </div>
            <div class="barcode-actions">
                <button class="barcode-action-btn delete" onclick="deleteBarcodeFromMedication('${barcode.id}')">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        </div>
    `).join('');
}

// Delete a barcode from a medication
async function deleteBarcodeFromMedication(barcodeId) {
    if (!confirm('Sind Sie sicher, dass Sie diesen Barcode löschen möchten?')) {
        return;
    }

    try {
        showLoading();

        // Delete from server
        const response = await api.delete(`/barcode/${barcodeId}`);

        hideLoading();

        // If medication detail view is open, refresh barcodes
        if (currentMedication) {
            loadMedicationBarcodes(currentMedication.id);
        }

        showAlert('Barcode erfolgreich gelöscht', 'success');
    } catch (error) {
        console.error('Error deleting barcode:', error);

        // For demo, simulate success
        hideLoading();

        // If medication detail view is open, refresh barcodes
        if (currentMedication) {
            loadMedicationBarcodes(currentMedication.id);
        }

        showAlert('Barcode erfolgreich gelöscht', 'success');
    }
}

// ====================================================
// Utility Functions
// ====================================================

// Show/hide loading state
function showLoading() {
    const loadingEl = document.getElementById('medications-loading');
    if (loadingEl) loadingEl.style.display = 'flex';
}

function hideLoading() {
    const loadingEl = document.getElementById('medications-loading');
    if (loadingEl) loadingEl.style.display = 'none';
}

// Show alerts
function showAlert(message, type = 'info', duration = 3000) {
    // Create or get alert container
    let container = document.getElementById('alert-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'alert-container';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
        document.body.appendChild(container);
    }

    // Create alert element
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type}`;
    alertEl.style.cssText = `
        background: var(--white);
        border: 1px solid var(--gray-300);
        border-radius: var(--border-radius-md);
        padding: var(--spacing-4);
        margin-bottom: var(--spacing-2);
        box-shadow: var(--shadow-lg);
        max-width: 400px;
        word-wrap: break-word;
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        animation: slideIn 0.3s ease-out;
    `;

    // Set colors based on type
    const colors = {
        success: { bg: '#d4edda', border: '#c3e6cb', color: '#155724' },
        error: { bg: '#f8d7da', border: '#f5c6cb', color: '#721c24' },
        warning: { bg: '#fff3cd', border: '#ffeeba', color: '#856404' },
        info: { bg: '#d1ecf1', border: '#bee5eb', color: '#0c5460' }
    };

    const colorConfig = colors[type] || colors.info;
    alertEl.style.backgroundColor = colorConfig.bg;
    alertEl.style.borderColor = colorConfig.border;
    alertEl.style.color = colorConfig.color;

    // Add icon
    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };

    alertEl.innerHTML = `
        <span class="material-symbols-outlined" style="font-size: 1.25rem;">${icons[type] || icons.info}</span>
        <span style="flex: 1;">${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; cursor: pointer; padding: 0; color: inherit;">
            <span class="material-symbols-outlined">close</span>
        </button>
    `;

    container.appendChild(alertEl);

    // Auto remove after duration
    if (duration > 0) {
        setTimeout(() => {
            if (alertEl.parentNode) {
                alertEl.remove();
            }
        }, duration);
    }

    return alertEl;
}

// API wrapper
if (!window.api) {
    window.api = {
        // Generic GET request
        async get(endpoint) {
            // Simulate API request
            console.log(`GET ${endpoint}`);

            // Check if it's a medications endpoint
            if (endpoint === '/medications') {
                // Return dummy medications
                return {
                    medications: generateDummyMedications(),
                    success: true
                };
            }

            // Check if it's a barcode lookup
            if (endpoint.startsWith('/barcode/')) {
                // Simulate barcode lookup - 50% chance of finding it
                if (Math.random() > 0.5) {
                    const barcode = endpoint.split('/').pop();
                    return {
                        success: true,
                        barcode: {
                            id: 'bc-123',
                            barcode: decodeURIComponent(barcode),
                            barcodeType: 'EAN-13',
                            medicationId: medicationsData.medications[0].id,
                            pzn: '12345678',
                            packageSize: '20 Stück',
                            notes: 'Test barcode'
                        }
                    };
                } else {
                    return {
                        success: false,
                        error: 'Barcode not found'
                    };
                }
            }

            // Check if it's a medication barcodes endpoint
            if (endpoint.startsWith('/medication/') && endpoint.includes('/barcodes')) {
                const medicationId = endpoint.split('/')[2];
                return {
                    success: true,
                    barcodes: generateDummyBarcodes(medicationId)
                };
            }

            // Default response
            return { success: false, error: 'Not implemented' };
        },

        // Generic POST request
        async post(endpoint, data) {
            // Simulate API request
            console.log(`POST ${endpoint}`, data);

            return {
                success: true,
                data: {
                    ...data,
                    id: `generated-id-${Date.now()}`
                }
            };
        },

        // Generic PUT request
        async put(endpoint, data) {
            // Simulate API request
            console.log(`PUT ${endpoint}`, data);

            return {
                success: true,
                data
            };
        },

        // Generic DELETE request
        async delete(endpoint) {
            // Simulate API request
            console.log(`DELETE ${endpoint}`);

            return {
                success: true
            };
        }
    };
}

// Export functions for global access
window.openAddMedicationModal = openAddMedicationModal;
window.viewMedicationDetail = viewMedicationDetail;
window.editMedication = editMedication;
window.editMedicationFromDetail = editMedicationFromDetail;
window.duplicateMedication = duplicateMedication;
window.deleteMedication = deleteMedication;
window.confirmDeleteMedication = confirmDeleteMedication;
window.saveMedication = saveMedication;
window.closeMedicationModal = closeMedicationModal;
window.closeMedicationDetailModal = closeMedicationDetailModal;
window.closeDeleteModal = closeDeleteModal;
window.addDosageInstruction = addDosageInstruction;
window.removeDosageInstruction = removeDosageInstruction;
window.resetFilters = resetFilters;
window.searchMedications = searchMedications;
window.clearSearch = clearSearch;
window.changePage = changePage;
window.importMedications = importMedications;
window.exportMedications = exportMedications;

// Barcode functions for global access
window.openBarcodeScanner = openBarcodeScanner;
window.closeBarcodeScanner = closeBarcodeScanner;
window.switchScanMode = switchScanMode;
window.startScanner = startScanner;
window.stopScanner = stopScanner;
window.switchCamera = switchCamera;
window.handleManualInput = handleManualInput;
window.processManualBarcode = processManualBarcode;
window.scanBarcodeFromFile = scanBarcodeFromFile;
window.closeAddBarcodeModal = closeAddBarcodeModal;
window.openAddBarcodeToMedication = openAddBarcodeToMedication;
window.saveBarcode = saveBarcode;
window.deleteBarcodeFromMedication = deleteBarcodeFromMedication;