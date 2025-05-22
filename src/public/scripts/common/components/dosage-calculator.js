// public/js/components/dosage-calculator.js - Quick dosage calculator (simplified)

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
            } else {
                // Clear dosage field when no medication is selected
                const dosageInput = document.getElementById('quick-dosage');
                if (dosageInput) {
                    dosageInput.value = '';
                }

                // Hide dosage info
                const infoContainer = document.getElementById('dosage-info');
                if (infoContainer) {
                    infoContainer.style.display = 'none';
                }
            }
        });
    }

    // When weight changes, recalculate if dosage is already filled
    const weightInput = document.getElementById('quick-weight');
    if (weightInput) {
        weightInput.addEventListener('input', function() {
            const dosageInput = document.getElementById('quick-dosage');
            if (dosageInput && dosageInput.value) {
                // Auto-calculate as user types weight if dosage is already set
                if (this.value && !isNaN(parseFloat(this.value)) && parseFloat(this.value) > 0) {
                    const calculationPreview = document.getElementById('calculation-preview');
                    if (calculationPreview) {
                        const weight = parseFloat(this.value);
                        const dosage = parseFloat(dosageInput.value);
                        const result = weight * dosage;
                        calculationPreview.textContent = `${dosage} × ${weight} = ${result.toFixed(2)}`;
                        calculationPreview.style.display = 'block';
                    }
                }
            }
        });
    }

    // Clear the form
    clearQuickDosage();
}

function handleMedicationChange(medication) {
    if (!medication) return;

    // Auto-fill dosage from medication.dosageAmount if available
    const dosageInput = document.getElementById('quick-dosage');
    if (dosageInput && medication.dosageAmount) {
        dosageInput.value = medication.dosageAmount;

        // Show dosage info if available
        showDosageInfo(medication);

        // Update calculation preview if weight is already entered
        const weightInput = document.getElementById('quick-weight');
        if (weightInput && weightInput.value) {
            const weight = parseFloat(weightInput.value);
            if (!isNaN(weight) && weight > 0) {
                const calculationPreview = document.getElementById('calculation-preview');
                if (calculationPreview) {
                    const dosage = parseFloat(medication.dosageAmount);
                    const result = weight * dosage;
                    calculationPreview.textContent = `${dosage} × ${weight} = ${result}`;
                    calculationPreview.style.display = 'block';
                }
            }
        }
    }

    // Update medication unit display
    updateMedicationUnit(medication);
}

function showDosageInfo(medication) {
    const infoContainer = document.getElementById('dosage-info');
    if (!infoContainer) return;

    // Show standard dosage info
    infoContainer.innerHTML = `
        <div class="dosage-info-panel">
            <h5>Dosierungshinweise für ${medication.name}</h5>
            <p><strong>Standarddosierung:</strong> ${medication.dosageAmount} ${medication.dosageUnit || 'mg/kg'}</p>
            ${medication.dosageInfo ?
        `<ul>${medication.dosageInfo.map(info => `<li>${utils.sanitizeHTML(info)}</li>`).join('')}</ul>` : ''}
        </div>
    `;
    infoContainer.style.display = 'block';
}

function updateMedicationUnit(medication) {
    // Update unit displays throughout the form
    const unitDisplays = document.querySelectorAll('.medication-unit');
    const unit = medication.dosageUnit || 'mg/kg';

    unitDisplays.forEach(display => {
        display.textContent = unit;
    });

    // Update result unit display
    const resultUnitDisplays = document.querySelectorAll('.result-unit');
    // Determine the result unit (usually same as dosage unit but without the /kg if present)
    const resultUnit = medication.resultUnit || (unit.endsWith('/kg') ? unit.replace('/kg', '') : unit);

    resultUnitDisplays.forEach(display => {
        display.textContent = resultUnit;
    });
}

async function calculateQuickDosage() {
    try {
        const medicationSelect = document.getElementById('quick-medication');
        const weightInput = document.getElementById('quick-weight');
        const dosageInput = document.getElementById('quick-dosage');

        if (!medicationSelect || !weightInput || !dosageInput) {
            showAlert('Formularfelder nicht gefunden', 'error');
            return;
        }

        // Validate inputs
        if (!medicationSelect.value) {
            showAlert('Bitte wählen Sie ein Medikament aus', 'warning');
            medicationSelect.focus();
            return;
        }

        const weight = parseFloat(weightInput.value);
        if (isNaN(weight) || weight <= 0) {
            showAlert('Bitte geben Sie ein gültiges Gewicht ein', 'warning');
            weightInput.focus();
            return;
        }

        const dosage = parseFloat(dosageInput.value);
        if (isNaN(dosage) || dosage <= 0) {
            showAlert('Bitte geben Sie eine gültige Dosierung ein', 'warning');
            dosageInput.focus();
            return;
        }

        // Get selected medication
        const medication = medicationSelect.selectedOptions[0].dataset.medication ?
            JSON.parse(medicationSelect.selectedOptions[0].dataset.medication) : {};

        showLoading();

        // Simple calculation: dosage × weight
        const calculatedDosage = dosage * weight;

        // Prepare result object based on the API structure
        const result = {
            medication: medication,
            patientWeight: weight,
            dosagePerKg: dosage,
            recommendations: {
                singleDose: calculatedDosage,
                dailyDose: calculatedDosage * (medication.frequency || 1),
                frequency: medication.frequency || 1,
                unit: medication.resultUnit || (medication.dosageUnit ? (medication.dosageUnit.endsWith('/kg') ?
                    medication.dosageUnit.replace('/kg', '') : medication.dosageUnit) : 'mg'),
                notes: []
            }
        };

        // Add dosage warnings or notes if applicable
        if (medication.maxDose && calculatedDosage > medication.maxDose) {
            result.recommendations.warning = `Berechnete Dosis überschreitet die empfohlene Maximaldosis von ${medication.maxDose} ${result.recommendations.unit}!`;
            result.recommendations.notes.push(`Empfohlene Maximaldosis: ${medication.maxDose} ${result.recommendations.unit}`);
        }

        displayQuickDosageResult(result);
        showAlert('Dosierung erfolgreich berechnet', 'success');

    } catch (error) {
        console.error('Error calculating quick dosage:', error);
        showAlert('Fehler bei der Dosierungsberechnung: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

function displayQuickDosageResult(result) {
    const container = document.getElementById('quick-dosage-result');
    if (!container) return;

    const recommendations = result.recommendations;
    const medicationName = result.medication?.name || 'Medikament';

    container.innerHTML = `
        <div class="dosage-result-content">
            <h4>Berechnungsergebnis für ${utils.sanitizeHTML(medicationName)}</h4>
            <div class="dosage-calculation">
                <span class="calculation-formula">
                    ${result.dosagePerKg} <span class="medication-unit">${result.medication?.dosageUnit || 'mg/kg'}</span> × 
                    ${result.patientWeight} kg = 
                    <strong>${recommendations.singleDose} <span class="result-unit">${recommendations.unit}</span></strong>
                </span>
            </div>
            <div class="dosage-values">
                <div class="dosage-value">
                    <span class="dosage-label">Einzeldosis:</span>
                    <span class="dosage-amount">${recommendations.singleDose} ${recommendations.unit}</span>
                </div>
                ${recommendations.frequency > 1 ? `
                <div class="dosage-value">
                    <span class="dosage-label">Tagesdosis:</span>
                    <span class="dosage-amount">${recommendations.dailyDose} ${recommendations.unit}</span>
                </div>
                <div class="dosage-value">
                    <span class="dosage-label">Häufigkeit:</span>
                    <span class="dosage-amount">${recommendations.frequency}x täglich</span>
                </div>
                ` : ''}
            </div>
            ${recommendations.warning ? `
                <div class="dosage-warning">
                    <i class="warning-icon">⚠️</i>
                    ${utils.sanitizeHTML(recommendations.warning)}
                </div>
            ` : ''}
            ${recommendations.notes.length > 0 ? `
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
    const calculationPreview = document.getElementById('calculation-preview');

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

    if (calculationPreview) {
        calculationPreview.style.display = 'none';
        calculationPreview.textContent = '';
    }

    // Clear dosage info
    const infoContainer = document.getElementById('dosage-info');
    if (infoContainer) {
        infoContainer.style.display = 'none';
        infoContainer.innerHTML = '';
    }

    // Clear form state from localStorage
    utils.storage.remove('quickDosageFormState');
}

async function saveDosageCalculation(result) {
    try {
        showLoading();

        // Add additional fields required by the API
        const saveData = {
            ...result,
            medicationId: result.medication?.id,
            frequency: result.recommendations.frequency,
            unit: result.recommendations.unit,
            indication: 'Dashboard Quick Calculation',
            timestamp: new Date().toISOString(),
            // Use dosageUnit from medication
            dosageUnit: result.medication?.dosageUnit
        };

        const savedResult = await api.post('/dosage/calculate', saveData);

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
                .dosage-calculation {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                    font-size: 18px;
                    text-align: center;
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

// Export functions
window.initQuickDosageForm = initQuickDosageForm;
window.calculateQuickDosage = calculateQuickDosage;
window.clearQuickDosage = clearQuickDosage;
window.saveDosageCalculation = saveDosageCalculation;
window.printDosageResult = printDosageResult;