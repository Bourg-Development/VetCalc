// public/js/components/dosage-calculator.js - Quick dosage calculator

// Initialize Quick Dosage Form
function initQuickDosageForm() {
    const form = document.getElementById('quick-dosage-form');
    if (!form) return;

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        await calculateQuickDosage();
    });

    // Auto-fill dosage when medication changes
    const medicationSelect = document.getElementById('quick-medication');
    if (medicationSelect) {
        medicationSelect.addEventListener('change', function() {
            if (this.value) {
                const medication = JSON.parse(this.selectedOptions[0].dataset.medication || '{}');
                handleMedicationChange(medication);
            }
        });
    }

    // Form validation
    setupFormValidation(form);

    // Save form state in localStorage
    setupFormStatePersistence(form);
}

function handleMedicationChange(medication) {
    if (!medication) return;

    // Auto-fill default dosage if available
    const dosageInput = document.getElementById('quick-dosage');
    if (dosageInput && medication.defaultDosage) {
        dosageInput.value = medication.defaultDosage;

        // Show dosage info if available
        showDosageInfo(medication);
    }

    // Update form based on medication type
    updateFormForMedication(medication);
}

function showDosageInfo(medication) {
    const infoContainer = document.getElementById('dosage-info');
    if (!infoContainer || !medication.dosageInfo) return;

    infoContainer.innerHTML = `
        <div class="dosage-info-panel">
            <h5>Dosierungshinweise für ${medication.name}</h5>
            <ul>
                ${medication.dosageInfo.map(info => `<li>${utils.sanitizeHTML(info)}</li>`).join('')}
            </ul>
        </div>
    `;
    infoContainer.style.display = 'block';
}

function updateFormForMedication(medication) {
    // Update frequency options based on medication
    const frequencySelect = document.getElementById('quick-frequency');
    if (frequencySelect && medication.recommendedFrequencies) {
        frequencySelect.innerHTML = '';
        medication.recommendedFrequencies.forEach(freq => {
            const option = document.createElement('option');
            option.value = freq.value;
            option.textContent = freq.label;
            frequencySelect.appendChild(option);
        });
    }

    // Show/hide additional fields based on medication type
    toggleAdditionalFields(medication);
}

function toggleAdditionalFields(medication) {
    const additionalFields = document.getElementById('additional-dosage-fields');
    if (!additionalFields) return;

    if (medication.requiresAdditionalInfo) {
        additionalFields.style.display = 'block';

        // Add specific fields based on medication requirements
        let fieldsHTML = '';

        if (medication.requiresAge) {
            fieldsHTML += `
                <div class="form-group">
                    <label for="patient-age" class="form-label">Alter des Patienten</label>
                    <input type="number" id="patient-age" class="form-input" min="0" max="30" step="0.1">
                </div>
            `;
        }

        if (medication.requiresCondition) {
            fieldsHTML += `
                <div class="form-group">
                    <label for="medical-condition" class="form-label">Medizinische Indikation</label>
                    <select id="medical-condition" class="form-select">
                        <option value="">Wählen Sie eine Indikation...</option>
                        ${medication.indications?.map(ind =>
                `<option value="${ind.value}">${utils.sanitizeHTML(ind.label)}</option>`
            ).join('') || ''}
                    </select>
                </div>
            `;
        }

        additionalFields.innerHTML = fieldsHTML;
    } else {
        additionalFields.style.display = 'none';
        additionalFields.innerHTML = '';
    }
}

async function calculateQuickDosage() {
    try {
        const formData = getFormData();
        const validation = validateDosageForm(formData);

        if (!validation.isValid) {
            displayValidationErrors(validation.errors);
            return;
        }

        showLoading();

        const result = await api.post('/dosage/calculate', formData);
        displayQuickDosageResult(result);

        showAlert('Dosierung erfolgreich berechnet', 'success');
    } catch (error) {
        console.error('Error calculating quick dosage:', error);
        showAlert('Fehler bei der Dosierungsberechnung: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function getFormData() {
    return {
        medicationId: document.getElementById('quick-medication')?.value,
        patientWeight: parseFloat(document.getElementById('quick-weight')?.value),
        dosagePerKg: parseFloat(document.getElementById('quick-dosage')?.value),
        frequency: parseInt(document.getElementById('quick-frequency')?.value),
        patientAge: document.getElementById('patient-age')?.value ?
            parseFloat(document.getElementById('patient-age').value) : null,
        medicalCondition: document.getElementById('medical-condition')?.value || null,
        indication: 'Dashboard Quick Calculation',
        timestamp: new Date().toISOString()
    };
}

function validateDosageForm(formData) {
    const errors = {};

    if (!formData.medicationId) {
        errors.medication = 'Bitte wählen Sie ein Medikament aus';
    }

    if (!formData.patientWeight || formData.patientWeight <= 0) {
        errors.weight = 'Bitte geben Sie ein gültiges Gewicht ein';
    } else if (formData.patientWeight > 100) {
        errors.weight = 'Gewicht scheint unrealistisch hoch zu sein';
    }

    if (!formData.dosagePerKg || formData.dosagePerKg <= 0) {
        errors.dosage = 'Bitte geben Sie eine gültige Dosierung ein';
    } else if (formData.dosagePerKg > 1000) {
        errors.dosage = 'Dosierung scheint unrealistisch hoch zu sein';
    }

    if (!formData.frequency || formData.frequency <= 0) {
        errors.frequency = 'Bitte wählen Sie eine Häufigkeit aus';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
}

function displayValidationErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(error => error.remove());

    // Display new errors
    for (const [field, message] of Object.entries(errors)) {
        const fieldElement = getFieldElement(field);
        if (fieldElement) {
            const errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            errorElement.textContent = message;
            fieldElement.parentElement.appendChild(errorElement);
            fieldElement.classList.add('error');
        }
    }

    // Focus first error field
    const firstErrorField = document.querySelector('.form-input.error, .form-select.error');
    if (firstErrorField) {
        firstErrorField.focus();
    }
}

function getFieldElement(fieldName) {
    const fieldMap = {
        medication: 'quick-medication',
        weight: 'quick-weight',
        dosage: 'quick-dosage',
        frequency: 'quick-frequency'
    };

    const elementId = fieldMap[fieldName];
    return elementId ? document.getElementById(elementId) : null;
}

function displayQuickDosageResult(result) {
    const container = document.getElementById('quick-dosage-result');
    if (!container) return;

    const recommendations = result.recommendations;

    container.innerHTML = `
        <div class="dosage-result-content">
            <h4>Berechnungsergebnis</h4>
            <div class="dosage-values">
                <div class="dosage-value">
                    <span class="dosage-label">Einzeldosis:</span>
                    <span class="dosage-amount">${recommendations.singleDose.toFixed(2)} ${recommendations.unit}</span>
                </div>
                <div class="dosage-value">
                    <span class="dosage-label">Tagesdosis:</span>
                    <span class="dosage-amount">${recommendations.dailyDose.toFixed(2)} ${recommendations.unit}</span>
                </div>
                <div class="dosage-value">
                    <span class="dosage-label">Häufigkeit:</span>
                    <span class="dosage-amount">${recommendations.frequency}x täglich</span>
                </div>
            </div>
            ${recommendations.warning ? `
                <div class="dosage-warning">
                    <i class="warning-icon">⚠️</i>
                    ${utils.sanitizeHTML(recommendations.warning)}
                </div>
            ` : ''}
            ${recommendations.notes ? `
                <div class="dosage-notes">
                    <h5>Hinweise:</h5>
                    <ul>
                        ${recommendations.notes.map(note => `<li>${utils.sanitizeHTML(note)}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            <div class="dosage-actions">
                <button class="btn btn-sm btn-primary" onclick="saveDosageCalculation(${JSON.stringify(result).replace(/"/g, '&quot;')})">
                    💾 Speichern
                </button>
                <button class="btn btn-sm btn-outline" onclick="printDosageResult()">
                    🖨️ Drucken
                </button>
                <button class="btn btn-sm btn-secondary" onclick="clearQuickDosage()">
                    🗑️ Löschen
                </button>
            </div>
        </div>
    `;

    container.style.display = 'block';

    // Scroll to result
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearQuickDosage() {
    const form = document.getElementById('quick-dosage-form');
    const result = document.getElementById('quick-dosage-result');

    if (form) {
        form.reset();
        // Clear any validation errors
        document.querySelectorAll('.form-error').forEach(error => error.remove());
        document.querySelectorAll('.form-input.error, .form-select.error').forEach(field => {
            field.classList.remove('error');
        });
    }

    if (result) {
        result.style.display = 'none';
        result.innerHTML = '';
    }

    // Clear form state from localStorage
    utils.storage.remove('quickDosageFormState');
}

async function saveDosageCalculation(result) {
    try {
        showLoading();

        const savedResult = await api.post('/dosage/save', {
            ...result,
            savedAt: new Date().toISOString()
        });

        showAlert('Dosierungsberechnung gespeichert', 'success');

        // Update saved calculations display if it exists
        if (typeof updateSavedCalculations === 'function') {
            updateSavedCalculations();
        }
    } catch (error) {
        console.error('Error saving dosage calculation:', error);
        showAlert('Fehler beim Speichern der Berechnung', 'error');
    } finally {
        hideLoading();
    }
}

function printDosageResult() {
    const resultContent = document.querySelector('.dosage-result-content');
    if (!resultContent) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dosierungsberechnung - VetCalc</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    color: #333;
                }
                .dosage-values { 
                    margin: 20px 0; 
                    border: 1px solid #ddd;
                    padding: 15px;
                    border-radius: 5px;
                }
                .dosage-value { 
                    margin: 10px 0; 
                    display: flex;
                    justify-content: space-between;
                }
                .dosage-label { 
                    font-weight: bold; 
                }
                .dosage-warning { 
                    background: #fff3cd; 
                    border: 1px solid #ffeaa7; 
                    padding: 10px; 
                    margin: 10px 0;
                    border-radius: 5px;
                }
                .dosage-actions { 
                    display: none; 
                }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <h1>VetCalc - Dosierungsberechnung</h1>
            <p>Erstellt am: ${utils.formatDate(new Date())} um ${utils.formatTime(new Date())}</p>
            ${resultContent.innerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Form state persistence
function setupFormStatePersistence(form) {
    const formId = form.id;
    const storageKey = `${formId}State`;

    // Load saved state
    const savedState = utils.storage.get(storageKey);
    if (savedState) {
        restoreFormState(form, savedState);
    }

    // Save state on change
    const saveState = utils.debounce(() => {
        const state = getFormState(form);
        utils.storage.set(storageKey, state);
    }, 1000);

    form.addEventListener('input', saveState);
    form.addEventListener('change', saveState);
}

function getFormState(form) {
    const formData = new FormData(form);
    const state = {};

    for (const [key, value] of formData.entries()) {
        state[key] = value;
    }

    return state;
}

function restoreFormState(form, state) {
    for (const [key, value] of Object.entries(state)) {
        const field = form.querySelector(`[name="${key}"]`);
        if (field) {
            field.value = value;
        }
    }
}

// Form validation setup
function setupFormValidation(form) {
    const fields = form.querySelectorAll('.form-input, .form-select');

    fields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => clearFieldError(field));
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name || field.id;
    let isValid = true;
    let message = '';

    // Clear previous error
    clearFieldError(field);

    // Check required fields
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'Dieses Feld ist erforderlich';
    }

    // Field-specific validation
    if (value && !isValid === false) {
        switch (fieldName) {
            case 'quick-weight':
                if (isNaN(value) || parseFloat(value) <= 0) {
                    isValid = false;
                    message = 'Bitte geben Sie ein gültiges Gewicht ein';
                }
                break;
            case 'quick-dosage':
                if (isNaN(value) || parseFloat(value) <= 0) {
                    isValid = false;
                    message = 'Bitte geben Sie eine gültige Dosierung ein';
                }
                break;
        }
    }

    if (!isValid) {
        showFieldError(field, message);
    }

    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');

    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.textContent = message;

    field.parentElement.appendChild(errorElement);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentElement.querySelector('.form-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Export functions
window.initQuickDosageForm = initQuickDosageForm;
window.calculateQuickDosage = calculateQuickDosage;
window.clearQuickDosage = clearQuickDosage;
window.saveDosageCalculation = saveDosageCalculation;
window.printDosageResult = printDosageResult;